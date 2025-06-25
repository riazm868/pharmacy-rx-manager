/*
 * REFACTORING SUGGESTIONS:
 * 1. Split this large component into smaller components:
 *    - MedicationItemForm: Extract the medication item form into a separate component
 *    - PrescriptionHeader: Extract the header section with patient/doctor selection
 *    - FormActions: Extract the action buttons at the bottom
 * 2. Use React Context for sharing state between components
 * 3. Use a form library like Formik or React Hook Form for better form management
 * 4. Create custom hooks for API calls and form validation logic
 */

import React, { useState, useEffect } from 'react';
import { Patient, Doctor, Medication, Prescription, PrescriptionMedication } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { calculateQuantityToDispense } from '@/utils/calculateQuantity';
import { supabase } from '@/lib/supabase';
import AutocompleteWithAdd from '../ui/AutocompleteWithAdd';
import Modal from '../modals/Modal';
import PrintLabelModal from '../modals/PrintLabelModal';
import PatientForm from './PatientForm';
import DoctorForm from './DoctorForm';
import MedicationForm from './MedicationForm';
import PatientDetailsModal from '../modals/PatientDetailsModal';
import DoctorDetailsModal from '../modals/DoctorDetailsModal';
import MedicationDetailsModal from '../modals/MedicationDetailsModal';

// Frequency options for the dropdown
const frequencyOptions = [
  { value: 'once daily', label: 'Once Daily (QD)' },
  { value: 'twice daily', label: 'Twice Daily (BID)' },
  { value: 'three times daily', label: 'Three Times Daily (TID)' },
  { value: 'four times daily', label: 'Four Times Daily (QID)' },
  { value: 'every 4 hours', label: 'Every 4 Hours (Q4H)' },
  { value: 'every 6 hours', label: 'Every 6 Hours (Q6H)' },
  { value: 'every 8 hours', label: 'Every 8 Hours (Q8H)' },
  { value: 'every 12 hours', label: 'Every 12 Hours (Q12H)' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'twice weekly', label: 'Twice Weekly' },
  { value: 'every other day', label: 'Every Other Day (QOD)' },
  { value: 'as needed', label: 'As Needed (PRN)' },
  { value: 'at bedtime', label: 'At Bedtime (QHS)' },
];

interface PrescriptionFormProps {
  onSubmit: (
    prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>,
    medications: Array<Omit<PrescriptionMedication, 'id' | 'prescription_id' | 'created_at' | 'updated_at'>>,
    callback?: (prescription: Prescription, medications: PrescriptionMedication[]) => void
  ) => void;
  onCancel: () => void;
  patients: Patient[];
  doctors: Doctor[];
  medications: Medication[];
  onSearchPatient: (query: string) => void;
  onSearchDoctor: (query: string) => void;
  onSearchMedication: (query: string) => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<Patient>;
  onAddDoctor: (doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => Promise<Doctor>;
  onAddMedication: (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => Promise<Medication>;
  isSubmitting?: boolean;
};

type MedicationItem = {
  medication: Medication | null;
  dose: string;
  route: string;
  frequency: string;
  days: number;
  quantity: number;
  unit: string;
  refills: number;
  notes?: string;
  id: string; // Temporary ID for UI purposes
};

export default function PrescriptionForm({
  onSubmit,
  onCancel,
  patients,
  doctors,
  medications,
  onSearchPatient,
  onSearchDoctor,
  onSearchMedication,
  onAddPatient,
  onAddDoctor,
  onAddMedication,
  isSubmitting = false,
}: PrescriptionFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [prescriptionDate, setPrescriptionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [prescriptionNumber, setPrescriptionNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [medicationItems, setMedicationItems] = useState<MedicationItem[]>([]);
  
  // Error states
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    patient?: string;
    doctor?: string;
    medications?: string;
    prescriptionNumber?: string;
  }>({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  
  // Modal states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [showDoctorDetailsModal, setShowDoctorDetailsModal] = useState(false);
  const [showMedicationDetailsModal, setShowMedicationDetailsModal] = useState(false);
  const [selectedMedicationForDetails, setSelectedMedicationForDetails] = useState<Medication | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  
  // State for print label modal
  const [showPrintLabelModal, setShowPrintLabelModal] = useState(false);
  const [createdPrescription, setCreatedPrescription] = useState<Prescription | null>(null);
  const [selectedMedicationForPrint, setSelectedMedicationForPrint] = useState<{
    medication: Medication;
    prescriptionMedication: PrescriptionMedication;
  } | null>(null);

  // Add a new medication item to the prescription
  const addMedicationItem = () => {
    setMedicationItems([
      ...medicationItems,
      {
        medication: null,
        dose: '',
        route: '',
        frequency: '',
        days: 0,
        quantity: 0,
        unit: 'tablets',
        refills: 0,
        notes: '',
        id: `temp-${Date.now()}-${medicationItems.length}`,
      },
    ]);
  };

  // Remove a medication item from the prescription
  const removeMedicationItem = (id: string) => {
    setMedicationItems(medicationItems.filter((item) => item.id !== id));
  };

  // Check for duplicate prescription number
  const checkDuplicatePrescriptionNumber = async (): Promise<boolean> => {
    if (!prescriptionNumber) return false;
    
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('id')
        .eq('prescription_number', prescriptionNumber)
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking prescription number:', error);
      return false;
    }
  };

  // Update a medication item
  const updateMedicationItem = (id: string, updates: Partial<MedicationItem>) => {
    setMedicationItems(prevItems =>
      prevItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Calculate quantity based on dose, frequency, and days
  const calculateQuantity = (id: string) => {
    setMedicationItems(prevItems => {
      const item = prevItems.find((item) => item.id === id);
      if (!item) return prevItems;

      const { dose, frequency, days } = item;
      
      // Skip calculation if any required field is missing
      if (!dose || !frequency || !days) {
        console.log('Skipping calculation - missing required fields', { dose, frequency, days });
        return prevItems;
      }
      
      try {
        console.log('Calculating quantity with:', { dose, frequency, days });
        const doseNum = parseFloat(dose);
        const result = calculateQuantityToDispense(doseNum, frequency, days);
        console.log('Calculation result:', result);
        
        if (!isNaN(result.result)) {
          console.log('Updating quantity to:', result.result);
          return prevItems.map((item) => 
            item.id === id ? { ...item, quantity: result.result } : item
          );
        }
      } catch (error) {
        console.error('Error calculating quantity:', error);
      }
      
      return prevItems;
    });
  };

  // Generate SIG preview for a medication item
  const generateSIGPreview = (item: MedicationItem): string => {
    if (!item.dose || !item.frequency) {
      return '';
    }

    let sig = `Take ${item.dose} ${item.unit || 'tablet(s)'}`;
    
    // Add route with natural language
    if (item.route) {
      const routeMap: { [key: string]: string } = {
        'PO': 'by mouth',
        'IM': 'intramuscularly',
        'IV': 'intravenously',
        'SC': 'subcutaneously',
        'SL': 'sublingually',
        'TOP': 'topically',
        'INH': 'by inhalation',
        'PR': 'rectally',
        'OD': 'in the right eye',
        'OS': 'in the left eye',
        'OU': 'in both eyes',
        'AD': 'in the right ear',
        'AS': 'in the left ear',
        'AU': 'in both ears'
      };
      sig += ` ${routeMap[item.route] || item.route.toLowerCase()}`;
    } else {
      sig += ' by mouth';
    }
    
    // Add frequency with natural language
    const frequencyMap: { [key: string]: string } = {
      'QD': 'once daily',
      'BID': 'twice daily',
      'TID': 'three times daily',
      'QID': 'four times daily',
      'Q4H': 'every 4 hours',
      'Q6H': 'every 6 hours',
      'Q8H': 'every 8 hours',
      'Q12H': 'every 12 hours',
      'PRN': 'as needed',
      'QHS': 'at bedtime',
      'AC': 'before meals',
      'PC': 'after meals'
    };
    
    sig += ` ${frequencyMap[item.frequency] || item.frequency.toLowerCase()}`;
    
    // Add duration if available
    if (item.days && item.days > 0) {
      sig += ` for ${item.days} days`;
    }

    // Add notes if available
    if (item.notes) {
      sig += `. ${item.notes}`;
    }
    
    return sig;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, shouldPrint: boolean = false) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormError(null);
    setFieldErrors({});
    setIsSubmittingForm(true);
    
    // Collect validation errors
    const errors: typeof fieldErrors = {};
    
    // Validate required fields
    if (!selectedPatient) {
      errors.patient = 'Please select a patient';
    }

    if (!selectedDoctor) {
      errors.doctor = 'Please select a doctor';
    }

    if (medicationItems.length === 0 || !medicationItems.some(item => item.medication)) {
      errors.medications = 'Please add at least one medication';
    } else {
      // Validate each medication item
      const invalidMedications = medicationItems.filter(item => {
        return !item.medication || !item.dose || !item.frequency || !item.days || item.quantity <= 0;
      });

      if (invalidMedications.length > 0) {
        errors.medications = 'Please complete all required fields for each medication';
      }
    }
    
    // Check for duplicate prescription number
    if (prescriptionNumber) {
      const isDuplicate = await checkDuplicatePrescriptionNumber();
      if (isDuplicate) {
        errors.prescriptionNumber = 'This prescription number already exists. Please use a different number.';
      }
    }
    
    // If there are any errors, update state and stop submission
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please correct the errors below before submitting.');
      setIsSubmittingForm(false);
      // Scroll to top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Create prescription object
    const prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'> = {
      patient_id: selectedPatient!.id,
      doctor_id: selectedDoctor!.id,
      prescription_number: prescriptionNumber || undefined,
      date: prescriptionDate,
      notes: notes || undefined,
    };
    
    // Create medication items
    const medications = medicationItems
      .filter(item => item.medication) // Filter out empty items
      .map(item => ({
        medication_id: item.medication!.id,
        dose: item.dose,
        route: item.route,
        frequency: item.frequency,
        days: item.days,
        quantity: item.quantity,
        unit: item.unit,
        refills: item.refills,
        notes: item.notes || undefined,
      }));
    
    if (shouldPrint && medicationItems.length > 0 && medicationItems[0].medication) {
      // We'll use a callback approach to handle printing after submission
      const handlePrescriptionCreated = (createdPrescription: Prescription, createdMedications: PrescriptionMedication[]) => {
        if (createdMedications.length > 0) {
          setCreatedPrescription(createdPrescription);
          setSelectedMedicationForPrint({
            medication: medicationItems[0].medication!,
            prescriptionMedication: createdMedications[0]
          });
          setShowPrintLabelModal(true);
        }
      };
      
      // Submit the prescription with the callback
      onSubmit(prescription, medications, handlePrescriptionCreated);
    } else {
      // Regular submission without printing
      onSubmit(prescription, medications);
    }
  };

  // Handle adding a new patient
  const handleAddPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    setIsAddingPatient(true);
    try {
      const newPatient = await onAddPatient(patientData);
      setSelectedPatient(newPatient);
      setShowPatientModal(false);
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient. Please try again.');
    } finally {
      setIsAddingPatient(false);
    }
  };

  // Handle adding a new doctor
  const handleAddDoctor = async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    setIsAddingDoctor(true);
    try {
      const newDoctor = await onAddDoctor(doctorData);
      setSelectedDoctor(newDoctor);
      setShowDoctorModal(false);
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert('Failed to add doctor. Please try again.');
    } finally {
      setIsAddingDoctor(false);
    }
  };

  // Handle adding a new medication
  const handleAddMedication = async (medicationData: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    setIsAddingMedication(true);
    try {
      const newMedication = await onAddMedication(medicationData);
      // If we're adding a medication for a specific item, update that item
      if (medicationItems.length > 0) {
        // Find the first item without a medication
        const itemToUpdate = medicationItems.find(item => !item.medication);
        if (itemToUpdate) {
          updateMedicationItem(itemToUpdate.id, { medication: newMedication });
        } else {
          // If all items have medications, add a new one with this medication
          setMedicationItems([
            ...medicationItems,
            {
              medication: newMedication,
              dose: '',
              route: '',
              frequency: '',
              days: 0,
              quantity: 0,
              unit: 'tablets',
              refills: 0,
              notes: '',
              id: `temp-${Date.now()}-${medicationItems.length}`,
            },
          ]);
        }
      }
      setShowMedicationModal(false);
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Failed to add medication. Please try again.');
    } finally {
      setIsAddingMedication(false);
    }
  };

  // Add an initial empty medication item if there are none
  useEffect(() => {
    if (medicationItems.length === 0) {
      addMedicationItem();
    }
  }, []);

  // Auto-select patient if only one is provided
  useEffect(() => {
    if (patients.length === 1 && !selectedPatient) {
      setSelectedPatient(patients[0]);
    }
  }, [patients]);

  // Auto-add medications when new ones are provided
  useEffect(() => {
    if (medications.length > 0) {
      // Check if we have any empty medication items
      const emptyItems = medicationItems.filter(item => !item.medication);
      
      // For each medication in the props that isn't already in our items
      medications.forEach(medication => {
        const alreadyAdded = medicationItems.some(item => 
          item.medication && item.medication.id === medication.id
        );
        
        if (!alreadyAdded) {
          // If we have an empty item, use it
          const emptyItem = emptyItems.shift();
          if (emptyItem) {
            updateMedicationItem(emptyItem.id, { medication });
          } else {
            // Otherwise add a new item
            setMedicationItems(prev => [
              ...prev,
              {
                medication: medication,
                dose: '',
                route: '',
                frequency: '',
                days: 0,
                quantity: 0,
                unit: 'tablets',
                refills: 0,
                notes: '',
                id: `temp-${Date.now()}-${Math.random()}`,
              },
            ]);
          }
        }
      });
    }
  }, [medications]);

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      {/* Form Error Message */}
      {formError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{formError}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">New Prescription</h2>
        <p className="text-indigo-100">Fill out the form below to create a new prescription</p>
      </div>

      {/* Patient & Doctor Information */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">Patient & Doctor Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <div>
            <AutocompleteWithAdd
              items={patients}
              itemToString={(item) => (item ? item.name : '')}
              onInputValueChange={onSearchPatient}
              onSelectedItemChange={(patient) => {
                setSelectedPatient(patient);
                if (patient && fieldErrors.patient) {
                  setFieldErrors({...fieldErrors, patient: undefined});
                }
              }}
              onAddNew={() => setShowPatientModal(true)}
              label="Patient"
              placeholder="Search for a patient..."
              selectedItem={selectedPatient}
            />
            {fieldErrors.patient && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.patient}</p>
            )}
            {selectedPatient && (
              <div
                className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                onClick={() => setShowPatientDetailsModal(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium text-gray-800">{selectedPatient.name}</span>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">View Details →</span>
                </div>
              </div>
            )}
          </div>

          {/* Doctor Selection */}
          <div>
            <AutocompleteWithAdd
              items={doctors}
              itemToString={(item) => (item ? item.name : '')}
              onInputValueChange={onSearchDoctor}
              onSelectedItemChange={(doctor) => {
                setSelectedDoctor(doctor);
                if (doctor && fieldErrors.doctor) {
                  setFieldErrors({...fieldErrors, doctor: undefined});
                }
              }}
              onAddNew={() => setShowDoctorModal(true)}
              label="Doctor"
              placeholder="Search for a doctor..."
              selectedItem={selectedDoctor}
            />
            {fieldErrors.doctor && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.doctor}</p>
            )}
            {selectedDoctor && (
              <div
                className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                onClick={() => setShowDoctorDetailsModal(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span className="font-medium text-gray-800">{selectedDoctor.name}</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">View Details →</span>
                </div>
              </div>
            )}
          </div>

          {/* Prescription Number */}
          <div>
            <label htmlFor="prescription_number" className="block text-sm font-medium text-gray-700 mb-1">
              Prescription Number
            </label>
            <input
              type="text"
              name="prescription_number"
              id="prescription_number"
              value={prescriptionNumber}
              onChange={(e) => {
                setPrescriptionNumber(e.target.value);
                if (fieldErrors.prescriptionNumber) {
                  setFieldErrors({...fieldErrors, prescriptionNumber: undefined});
                }
              }}
              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter prescription number (optional)"
            />
            {fieldErrors.prescriptionNumber && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.prescriptionNumber}</p>
            )}
          </div>

          {/* Prescription Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Prescription Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={prescriptionDate}
              onChange={(e) => setPrescriptionDate(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="Add any additional notes for this prescription..."
          />
        </div>
      </div>

      {/* Medications Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Medications</h3>
          </div>
        </div>

        {medicationItems.map((item, index) => (
          <div key={item.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 space-y-4 hover:shadow-md transition-all duration-200">
            {/* Medication Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="bg-purple-600 text-white text-sm font-semibold px-2.5 py-1 rounded-full">
                  {index + 1}
                </span>
                <h4 className="text-sm font-medium text-gray-700">Medication Item</h4>
              </div>
              <button
                type="button"
                onClick={() => removeMedicationItem(item.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200"
                title="Remove medication"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Horizontal Layout for Medication Fields */}
            <div className="space-y-3">
              {/* Row 1: Medication, Dose, Unit, Route */}
              <div className="grid grid-cols-12 gap-3">
                {/* Medication Search - 4 cols */}
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medication
                  </label>
                  <AutocompleteWithAdd
                    items={medications}
                    itemToString={(med) => (med ? `${med.name} ${med.strength}` : '')}
                    onInputValueChange={onSearchMedication}
                    onSelectedItemChange={(med) => updateMedicationItem(item.id, { medication: med })}
                    onAddNew={() => setShowMedicationModal(true)}
                    label=""
                    placeholder="Search medications..."
                  />
                </div>

                {/* Dose - 2 cols */}
                <div className="col-span-2">
                  <label htmlFor={`dose-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Dose
                  </label>
                  <input
                    type="number"
                    id={`dose-${item.id}`}
                    value={item.dose}
                    onChange={(e) => updateMedicationItem(item.id, { dose: e.target.value })}
                    onBlur={() => calculateQuantity(item.id)}
                    placeholder="e.g., 1"
                    min="0"
                    step="0.5"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Unit - 2 cols */}
                <div className="col-span-2">
                  <label htmlFor={`unit-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    id={`unit-${item.id}`}
                    value={item.unit}
                    onChange={(e) => updateMedicationItem(item.id, { unit: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="ml">mL</option>
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                    <option value="unit">Unit</option>
                    <option value="puff">Puff</option>
                    <option value="drop">Drop</option>
                    <option value="patch">Patch</option>
                    <option value="suppository">Suppository</option>
                  </select>
                </div>

                {/* Route - 2 cols */}
                <div className="col-span-2">
                  <label htmlFor={`route-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Route
                  </label>
                  <select
                    id={`route-${item.id}`}
                    value={item.route}
                    onChange={(e) => updateMedicationItem(item.id, { route: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Route</option>
                    <option value="PO">PO (By Mouth)</option>
                    <option value="IM">IM (Intramuscular)</option>
                    <option value="IV">IV (Intravenous)</option>
                    <option value="SC">SC (Subcutaneous)</option>
                    <option value="SL">SL (Sublingual)</option>
                    <option value="TOP">TOP (Topical)</option>
                    <option value="INH">INH (Inhalation)</option>
                    <option value="PR">PR (Rectal)</option>
                    <option value="OD">OD (Right Eye)</option>
                    <option value="OS">OS (Left Eye)</option>
                    <option value="OU">OU (Both Eyes)</option>
                    <option value="AD">AD (Right Ear)</option>
                    <option value="AS">AS (Left Ear)</option>
                    <option value="AU">AU (Both Ears)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Frequency, Days Supply, Quantity, Refills */}
              <div className="grid grid-cols-12 gap-3">
                {/* Frequency - 3 cols */}
                <div className="col-span-3">
                  <label htmlFor={`frequency-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    id={`frequency-${item.id}`}
                    value={item.frequency || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log('Frequency change attempted:', {
                        itemId: item.id,
                        currentFrequency: item.frequency,
                        newFrequency: newValue,
                        currentDays: item.days,
                        allItemData: item
                      });
                      updateMedicationItem(item.id, { frequency: newValue });
                      setTimeout(() => calculateQuantity(item.id), 10);
                    }}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Frequency</option>
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Days Supply - 2 cols */}
                <div className="col-span-2">
                  <label htmlFor={`days-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Days Supply
                  </label>
                  <input
                    type="number"
                    id={`days-${item.id}`}
                    value={item.days}
                    onChange={(e) => updateMedicationItem(item.id, { days: parseInt(e.target.value) || 0 })}
                    onBlur={() => calculateQuantity(item.id)}
                    placeholder="e.g., 30"
                    min="0"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Quantity - 2 cols */}
                <div className="col-span-2">
                  <label htmlFor={`quantity-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id={`quantity-${item.id}`}
                    value={item.quantity}
                    readOnly
                    className="block w-full border border-gray-200 rounded-lg shadow-sm py-2 px-3 bg-gray-50 cursor-not-allowed focus:outline-none transition-all duration-200"
                    title="Quantity is auto-calculated based on dose, frequency, and days supply"
                  />
                </div>

                {/* Refills - 2 cols */}
                <div className="col-span-2">
                  <label htmlFor={`refills-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Refills
                  </label>
                  <input
                    type="number"
                    id={`refills-${item.id}`}
                    value={item.refills}
                    onChange={(e) => updateMedicationItem(item.id, { refills: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    max="12"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Notes - 3 cols */}
                <div className="col-span-3">
                  <label htmlFor={`notes-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Notes <span className="text-xs text-red-500">(Include allergies)</span>
                  </label>
                  <input
                    type="text"
                    id={`notes-${item.id}`}
                    value={item.notes}
                    onChange={(e) => updateMedicationItem(item.id, { notes: e.target.value })}
                    placeholder="e.g., Patient allergic to..."
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-red-300"
                  />
                </div>
              </div>

              {/* SIG Preview */}
              {generateSIGPreview(item) && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Instructions Preview:</p>
                  <p className="text-sm text-blue-700 mt-1">{generateSIGPreview(item)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Add Medication Button */}
        <button
          type="button"
          onClick={addMedicationItem}
          className="w-full mt-4 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Another Medication
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Prescription...
            </span>
          ) : (
            'Create Prescription'
          )}
        </button>
      </div>

      {/* Patient Modal */}
      <Modal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        title="Add New Patient"
        maxWidth="lg"
      >
        <PatientForm
          onSubmit={handleAddPatient}
          onCancel={() => setShowPatientModal(false)}
          isSubmitting={isAddingPatient}
        />
      </Modal>

      {/* Doctor Modal */}
      <Modal
        isOpen={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
        title="Add New Doctor"
        maxWidth="md"
      >
        <DoctorForm
          onSubmit={handleAddDoctor}
          onCancel={() => setShowDoctorModal(false)}
          isSubmitting={isAddingDoctor}
        />
      </Modal>

      {/* Medication Modal */}
      <Modal
        isOpen={showMedicationModal}
        onClose={() => setShowMedicationModal(false)}
        title="Add New Medication"
        maxWidth="md"
      >
        <MedicationForm
          onSubmit={handleAddMedication}
          onCancel={() => setShowMedicationModal(false)}
          isSubmitting={isAddingMedication}
        />
      </Modal>
      
      {/* Patient Details Modal */}
      <Modal
        isOpen={showPatientDetailsModal}
        onClose={() => setShowPatientDetailsModal(false)}
        title="Patient Details"
        maxWidth="lg"
      >
        <PatientDetailsModal
          patient={selectedPatient}
          onUpdatePatient={onAddPatient}
          onClose={() => setShowPatientDetailsModal(false)}
        />
      </Modal>

      {/* Doctor Details Modal */}
      <Modal
        isOpen={showDoctorDetailsModal}
        onClose={() => setShowDoctorDetailsModal(false)}
        title="Doctor Details"
        maxWidth="lg"
      >
        <DoctorDetailsModal
          doctor={selectedDoctor}
          onUpdateDoctor={onAddDoctor}
          onClose={() => setShowDoctorDetailsModal(false)}
        />
      </Modal>

      {/* Medication Details Modal */}
      <Modal
        isOpen={showMedicationDetailsModal}
        onClose={() => setShowMedicationDetailsModal(false)}
        title="Medication Details"
        maxWidth="lg"
      >
        <MedicationDetailsModal
          medication={selectedMedicationForDetails}
          onUpdateMedication={onAddMedication}
          onClose={() => setShowMedicationDetailsModal(false)}
        />
      </Modal>

      {/* Print Label Modal */}
      {createdPrescription && selectedPatient && selectedDoctor && selectedMedicationForPrint && selectedMedicationForPrint.medication && (
        <PrintLabelModal
          isOpen={showPrintLabelModal}
          onClose={() => setShowPrintLabelModal(false)}
          prescription={createdPrescription}
          patient={selectedPatient}
          doctor={selectedDoctor}
          medication={selectedMedicationForPrint.medication}
          prescriptionMedication={selectedMedicationForPrint.prescriptionMedication}
        />
      )}
    </form>
  );
}
