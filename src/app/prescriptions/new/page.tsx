'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Patient, Doctor, Medication, Prescription, PrescriptionMedication } from '@/types/database';
import PrescriptionForm from '@/components/forms/PrescriptionForm';
import LivePatientSearch from '@/components/ui/LivePatientSearch';
import LiveMedicationSearch from '@/components/ui/LiveMedicationSearch';
import { DisplayPatient } from '@/app/api/patients/route';
import { DisplayMedication } from '@/app/api/medications/route';

export default function NewPrescriptionPage() {
  console.log('Rendering NewPrescriptionPage');
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLightspeedSearch, setShowLightspeedSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);

  // Save Lightspeed patient to local database when selected
  const handleLightspeedPatientSelect = async (patient: DisplayPatient) => {
    try {
      console.log('Selected Lightspeed patient:', patient);
      
      // Check if patient already exists in local database
      const { data: existingPatient, error: checkError } = await supabase
        .from('patients')
        .select('*')
        .eq('id_number', patient.id_number)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is expected
        console.error('Error checking existing patient:', checkError);
        throw checkError;
      }

      if (existingPatient) {
        console.log('Patient already exists:', existingPatient);
        // Patient already exists, use existing record
        setSelectedPatient(existingPatient);
        return;
      }

      // Create new patient record from Lightspeed data
      const newPatientData = {
        name: patient.name,
        dob: patient.dob || '1900-01-01', // Default date when DOB is missing
        gender: patient.gender || 'Unknown',
        id_number: patient.id_number,
        dp_number: patient.dp_number || '',
        birth_cert_pin: patient.birth_cert_pin || '',
        phone: patient.phone || '',
        phone2: patient.phone2 || '',
        email: patient.email || '',
        address: patient.address || '',
        city: patient.city || '',
        state: patient.state || '',
        zip: patient.zip || '',
        lightspeed_id: patient.lightspeed_id || patient.id, // Store Lightspeed ID
      };

      console.log('Creating new patient with data:', newPatientData);

      const { data: newPatient, error: insertError } = await supabase
        .from('patients')
        .insert(newPatientData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting patient:', insertError);
        throw insertError;
      }

      console.log('Successfully created patient:', newPatient);
      setSelectedPatient(newPatient);
    } catch (err: any) {
      console.error('Error saving Lightspeed patient:', err);
      alert(`Failed to save patient from Lightspeed: ${err.message || 'Unknown error'}`);
    }
  };

  // Save Lightspeed medication to local database when selected  
  const handleLightspeedMedicationSelect = async (medication: DisplayMedication) => {
    try {
      // Check if medication already exists in local database
      const { data: existingMedication, error: checkError } = await supabase
        .from('medications')
        .select('*')
        .eq('name', medication.name)
        .single();

      if (existingMedication) {
        // Medication already exists, use existing record
        setSelectedMedications(prev => [...prev, existingMedication]);
        setMedications(prev => {
          // Add to medications list if not already there
          if (!prev.find(m => m.id === existingMedication.id)) {
            return [...prev, existingMedication];
          }
          return prev;
        });
        return;
      }

      // Create new medication record from Lightspeed data
      const newMedicationData = {
        name: medication.name,
        strength: medication.strength || 'N/A',
        count: medication.count || 0,
        price: medication.price || 0, // Store the price
        lightspeed_id: medication.lightspeed_id || medication.id, // Store Lightspeed ID
      };

      const { data: newMedication, error: insertError } = await supabase
        .from('medications')
        .insert(newMedicationData)
        .select()
        .single();

      if (insertError) throw insertError;

      setSelectedMedications(prev => [...prev, newMedication]);
      setMedications(prev => [...prev, newMedication]);
    } catch (err) {
      console.error('Error saving Lightspeed medication:', err);
      alert('Failed to save medication from Lightspeed. Please try again.');
    }
  };

  // Search for patients
  const handleSearchPatient = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('name', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Error searching patients:', err);
    }
  };

  // Search for doctors
  const handleSearchDoctor = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,clinic_name.ilike.%${query}%`)
        .order('name', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      console.error('Error searching doctors:', err);
    }
  };

  // Search for medications
  const handleSearchMedication = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      setMedications(data || []);
    } catch (err) {
      console.error('Error searching medications:', err);
    }
  };

  // Add a new patient
  const handleAddPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding patient with data:', patientData);
      
      // Validate required fields on the server side as well
      if (!patientData.name || !patientData.dob || !patientData.gender || !patientData.phone) {
        throw new Error('Missing required patient fields');
      }
      
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Successfully added patient:', data);
      return data;
    } catch (err: any) {
      console.error('Error adding patient:', err);
      // Show a more user-friendly error message
      alert(`Failed to add patient: ${err.message || 'Unknown error'}`);
      throw err;
    }
  };

  // Add a new doctor
  const handleAddDoctor = async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert(doctorData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error adding doctor:', err);
      throw err;
    }
  };

  // Add a new medication
  const handleAddMedication = async (medicationData: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Ensure strength field is set to 'N/A' if not provided
      const dataToInsert = {
        ...medicationData,
        strength: medicationData.strength || 'N/A'
      };
      
      const { data, error } = await supabase
        .from('medications')
        .insert(dataToInsert)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error adding medication:', err);
      throw err;
    }
  };

  // Handle form submission
  const handleSubmit = async (
    prescriptionData: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>,
    medicationItems: Array<Omit<PrescriptionMedication, 'id' | 'prescription_id' | 'created_at' | 'updated_at'>>,
    callback?: (prescription: Prescription, medications: PrescriptionMedication[]) => void
  ) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create the prescription
      const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select()
        .single();
      
      if (prescriptionError) throw prescriptionError;
      
      // Add medications to the prescription
      let createdMedications: PrescriptionMedication[] = [];
      
      if (medicationItems.length > 0) {
        const prescriptionMedications = medicationItems.map(item => ({
          ...item,
          prescription_id: prescription.id
        }));
        
        const { data: medications, error: medicationsError } = await supabase
          .from('prescription_medications')
          .insert(prescriptionMedications)
          .select();
        
        if (medicationsError) throw medicationsError;
        
        if (medications) {
          createdMedications = medications;
        }
      }
      
      // Park sale in Lightspeed if we have Lightspeed data
      if ((selectedPatient as any)?.lightspeed_id && showLightspeedSearch) {
        try {
          console.log('Creating parked sale in Lightspeed...');
          
          // Get patient, doctor, and medications data
          const { data: patientData } = await supabase
            .from('patients')
            .select('*')
            .eq('id', prescription.patient_id)
            .single();
            
          const { data: doctorData } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', prescription.doctor_id)
            .single();
            
          const { data: medicationData } = await supabase
            .from('medications')
            .select('*')
            .in('id', createdMedications.map(m => m.medication_id));
          
          // Build medication mapping
          const lightspeedProductIds: Record<string, string> = {};
          const lightspeedProductPrices: Record<string, number> = {};
          
          medicationData?.forEach((med: Medication) => {
            if (med.lightspeed_id) {
              lightspeedProductIds[med.id] = med.lightspeed_id;
              lightspeedProductPrices[med.id] = med.price || 0;
            }
          });
          
          // Only proceed if we have Lightspeed product IDs
          if (Object.keys(lightspeedProductIds).length > 0) {
            const parkSaleResponse = await fetch('/api/lightspeed/park-sale', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prescription,
                medications: createdMedications,
                patient: patientData,
                doctor: doctorData,
                lightspeedCustomerId: patientData?.lightspeed_id,
                lightspeedProductIds,
                lightspeedProductPrices,
              }),
            });
            
            if (!parkSaleResponse.ok) {
              const errorData = await parkSaleResponse.json();
              console.error('Failed to park sale:', errorData);
              // Don't throw - just log the error so prescription save still succeeds
              setError(`Prescription saved but failed to create sale in Lightspeed: ${errorData.error || 'Unknown error'}`);
            } else {
              console.log('Successfully parked sale in Lightspeed');
            }
          }
        } catch (parkSaleError: any) {
          console.error('Error parking sale:', parkSaleError);
          // Don't throw - just log the error so prescription save still succeeds
          setError(`Prescription saved but failed to create sale in Lightspeed: ${parkSaleError.message || 'Unknown error'}`);
        }
      }
      
      // Call the callback if provided (for printing)
      if (callback && typeof callback === 'function') {
        callback(prescription, createdMedications);
      } else {
        // Redirect to the prescription detail page if no callback
        router.push(`/prescriptions/${prescription.id}`);
      }
    } catch (err: any) {
      console.error('Error creating prescription:', err);
      setError(err.message || 'Failed to create prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('Rendering NewPrescriptionPage return');
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Prescription</h1>
        <Link
          href="/prescriptions"
          className="text-indigo-600 hover:text-indigo-900"
        >
          Back to Prescriptions
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Lightspeed Toggle */}
          <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Lightspeed Integration</h3>
              <p className="text-sm text-blue-700">Search patients and medications from your Lightspeed account</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowLightspeedSearch(!showLightspeedSearch);
                // Clear selections when toggling off
                if (showLightspeedSearch) {
                  setSelectedPatient(null);
                  setSelectedMedications([]);
                }
              }}
              className={`${
                showLightspeedSearch ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  showLightspeedSearch ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          {/* Lightspeed Search Components */}
          {showLightspeedSearch && (
            <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Lightspeed Patients
                </label>
                <LivePatientSearch
                  onSelectPatient={handleLightspeedPatientSelect}
                  placeholder="Search patients from Lightspeed..."
                />
                {selectedPatient && (
                  <div className="mt-2 p-3 bg-green-50 rounded text-sm">
                    Selected: {selectedPatient.name} (ID: {selectedPatient.id_number})
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Lightspeed Medications
                </label>
                <LiveMedicationSearch
                  onSelectMedication={handleLightspeedMedicationSelect}
                  placeholder="Search medications from Lightspeed..."
                />
              </div>
            </div>
          )}

          <PrescriptionForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/prescriptions')}
            patients={selectedPatient ? [selectedPatient] : patients}
            doctors={doctors}
            medications={selectedMedications}
            onSearchPatient={handleSearchPatient}
            onSearchDoctor={handleSearchDoctor}
            onSearchMedication={handleSearchMedication}
            onAddPatient={handleAddPatient}
            onAddDoctor={handleAddDoctor}
            onAddMedication={handleAddMedication}
            isSubmitting={isSubmitting}
            showLightspeedIntegration={showLightspeedSearch}
          />
        </div>
      </div>
    </div>
  );
}
