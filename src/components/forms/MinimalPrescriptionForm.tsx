import React, { useState, useEffect } from 'react';
import { Patient, Doctor, Medication, Prescription, PrescriptionMedication } from '@/types/database';
import Modal from '../modals/Modal';
import PatientForm from './PatientForm';
import DoctorForm from './DoctorForm';
import MedicationForm from './MedicationForm';

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
  id: string;
};

type MinimalPrescriptionFormProps = {
  onSubmit: (
    prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>,
    medications: Array<Omit<PrescriptionMedication, 'id' | 'prescription_id' | 'created_at' | 'updated_at'>>
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

export default function MinimalPrescriptionForm({
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
}: MinimalPrescriptionFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [prescriptionDate, setPrescriptionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [medicationItems, setMedicationItems] = useState<MedicationItem[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  
  // Modal states
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [medicationItemIdToAddTo, setMedicationItemIdToAddTo] = useState<string | null>(null);

  const addMedicationItem = () => {
    setMedicationItems([...medicationItems, {
      medication: null,
      dose: '',
      route: '',
      frequency: '',
      days: 0,
      quantity: 0,
      unit: '',
      refills: 0,
      notes: '',
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }]);
  };

  const removeMedicationItem = (id: string) => {
    setMedicationItems(medicationItems.filter(item => item.id !== id));
  };

  const updateMedicationItem = (id: string, updates: Partial<MedicationItem>) => {
    setMedicationItems(medicationItems.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  // Add an initial empty medication item if there are none
  useEffect(() => {
    if (medicationItems.length === 0) {
      addMedicationItem();
    }
  }, []); // Empty dependency array - only run once on mount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !selectedDoctor) {
      alert('Please select a patient and doctor');
      return;
    }

    // Validate medication items
    const validMedications = medicationItems.filter(item => item.medication !== null);
    if (validMedications.length === 0) {
      alert('Please add at least one medication');
      return;
    }
    
    const prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'> = {
      patient_id: selectedPatient.id,
      doctor_id: selectedDoctor.id,
      date: prescriptionDate,
      notes: notes,
    };
    
    const prescriptionMedications = validMedications.map(item => ({
      medication_id: item.medication!.id,
      dose: item.dose,
      route: item.route,
      frequency: item.frequency,
      days: item.days,
      quantity: item.quantity,
      unit: item.unit,
      refills: item.refills,
      notes: item.notes || '',
    }));
    
    onSubmit(prescription, prescriptionMedications);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Minimal Prescription Form</h3>
        
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700">
              Patient
            </label>
            <div className="mt-1 flex">
              <select
                id="patient"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const patient = patients.find(p => p.id === e.target.value);
                  setSelectedPatient(patient || null);
                }}
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsAddingPatient(true)}
                className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add New
              </button>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
              Doctor
            </label>
            <div className="mt-1 flex">
              <select
                id="doctor"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={selectedDoctor?.id || ''}
                onChange={(e) => {
                  const doctor = doctors.find(d => d.id === e.target.value);
                  setSelectedDoctor(doctor || null);
                }}
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsAddingDoctor(true)}
                className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add New
              </button>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="date"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <div className="mt-1">
              <textarea
                id="notes"
                rows={3}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="sm:col-span-6 mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Medications</h4>
            
            {medicationItems.map((item, index) => (
              <div key={item.id} className="mb-6 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-md font-medium text-gray-700">Medication {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeMedicationItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor={`medication-${item.id}`} className="block text-sm font-medium text-gray-700">
                      Medication
                    </label>
                    <div className="mt-1 flex">
                      <select
                        id={`medication-${item.id}`}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={item.medication?.id || ''}
                        onChange={(e) => {
                          const medication = medications.find(m => m.id === e.target.value);
                          updateMedicationItem(item.id, { medication: medication || null });
                        }}
                      >
                        <option value="">Select a medication</option>
                        {medications.map((medication) => (
                          <option key={medication.id} value={medication.id}>
                            {medication.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setMedicationItemIdToAddTo(item.id);
                          setIsAddingMedication(true);
                        }}
                        className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add New
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor={`dose-${item.id}`} className="block text-sm font-medium text-gray-700">
                      Dose
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id={`dose-${item.id}`}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={item.dose}
                        onChange={(e) => updateMedicationItem(item.id, { dose: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={`route-${item.id}`} className="block text-sm font-medium text-gray-700">
                      Route
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id={`route-${item.id}`}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={item.route}
                        onChange={(e) => updateMedicationItem(item.id, { route: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={`frequency-${item.id}`} className="block text-sm font-medium text-gray-700">
                      Frequency
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id={`frequency-${item.id}`}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={item.frequency}
                        onChange={(e) => updateMedicationItem(item.id, { frequency: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={`days-${item.id}`} className="block text-sm font-medium text-gray-700">
                      Days
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id={`days-${item.id}`}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={item.days || ''}
                        onChange={(e) => updateMedicationItem(item.id, { days: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={`quantity-${item.id}`} className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id={`quantity-${item.id}`}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={item.quantity || ''}
                        onChange={(e) => updateMedicationItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={`unit-${item.id}`} className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id={`unit-${item.id}`}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={item.unit}
                        onChange={(e) => updateMedicationItem(item.id, { unit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={`refills-${item.id}`} className="block text-sm font-medium text-gray-700">
                      Refills
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id={`refills-${item.id}`}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={item.refills || ''}
                        onChange={(e) => updateMedicationItem(item.id, { refills: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor={`notes-${item.id}`} className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id={`notes-${item.id}`}
                        rows={2}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={item.notes || ''}
                        onChange={(e) => updateMedicationItem(item.id, { notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addMedicationItem}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Medication
            </button>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Patient Modal */}
      <Modal isOpen={isAddingPatient} onClose={() => setIsAddingPatient(false)} title="Add New Patient">
        <PatientForm
          onSubmit={async (patient) => {
            try {
              const newPatient = await onAddPatient(patient);
              setSelectedPatient(newPatient);
              setIsAddingPatient(false);
            } catch (error) {
              console.error('Error adding patient:', error);
            }
          }}
          onCancel={() => setIsAddingPatient(false)}
          isInModal={true}
        />
      </Modal>

      {/* Doctor Modal */}
      <Modal isOpen={isAddingDoctor} onClose={() => setIsAddingDoctor(false)} title="Add New Doctor">
        <DoctorForm
          onSubmit={async (doctor) => {
            try {
              const newDoctor = await onAddDoctor(doctor);
              setSelectedDoctor(newDoctor);
              setIsAddingDoctor(false);
            } catch (error) {
              console.error('Error adding doctor:', error);
            }
          }}
          onCancel={() => setIsAddingDoctor(false)}
          isInModal={true}
        />
      </Modal>

      {/* Medication Modal */}
      <Modal isOpen={isAddingMedication} onClose={() => setIsAddingMedication(false)} title="Add New Medication">
        <MedicationForm
          onSubmit={async (medication) => {
            try {
              const newMedication = await onAddMedication(medication);
              if (medicationItemIdToAddTo) {
                updateMedicationItem(medicationItemIdToAddTo, { medication: newMedication });
                setMedicationItemIdToAddTo(null);
              }
              setIsAddingMedication(false);
            } catch (error) {
              console.error('Error adding medication:', error);
            }
          }}
          onCancel={() => setIsAddingMedication(false)}
          isInModal={true}
        />
      </Modal>
    </form>
  );
}
