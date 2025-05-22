'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Patient, Doctor, Medication, Prescription, PrescriptionMedication } from '@/types/database';
import PrescriptionForm from '@/components/forms/PrescriptionForm';

type PrescriptionWithDetails = Prescription & {
  patient: Patient;
  doctor: Doctor;
};

type PrescriptionMedicationWithDetails = PrescriptionMedication & {
  medication: Medication;
};

export default function EditPrescriptionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [prescription, setPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [prescriptionMedications, setPrescriptionMedications] = useState<PrescriptionMedicationWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        // Fetch prescription with patient and doctor details
        const { data: prescriptionData, error: prescriptionError } = await supabase
          .from('prescriptions')
          .select(`
            *,
            patient:patient_id(*),
            doctor:doctor_id(*)
          `)
          .eq('id', params.id)
          .single();

        if (prescriptionError) {
          throw prescriptionError;
        }

        setPrescription(prescriptionData);
        
        // Add the patient and doctor to their respective arrays
        setPatients([prescriptionData.patient]);
        setDoctors([prescriptionData.doctor]);

        // Fetch prescription medications with medication details
        const { data: medicationsData, error: medicationsError } = await supabase
          .from('prescription_medications')
          .select(`
            *,
            medication:medication_id(*)
          `)
          .eq('prescription_id', params.id);

        if (medicationsError) {
          throw medicationsError;
        }

        setPrescriptionMedications(medicationsData || []);
        
        // Add the medications to the medications array
        if (medicationsData && medicationsData.length > 0) {
          setMedications(medicationsData.map(item => item.medication));
        }
      } catch (error: any) {
        console.error('Error fetching prescription details:', error);
        setError(error.message || 'Failed to load prescription details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescription();
  }, [params.id]);

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
      
      // Make sure the current patient is included
      if (prescription?.patient) {
        const patientExists = data?.some(p => p.id === prescription.patient.id);
        if (!patientExists && data) {
          data.unshift(prescription.patient);
        }
      }
      
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
      
      // Make sure the current doctor is included
      if (prescription?.doctor) {
        const doctorExists = data?.some(d => d.id === prescription.doctor.id);
        if (!doctorExists && data) {
          data.unshift(prescription.doctor);
        }
      }
      
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
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error adding patient:', err);
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
    medicationItems: Array<Omit<PrescriptionMedication, 'id' | 'prescription_id' | 'created_at' | 'updated_at'>>
  ) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update the prescription
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .update(prescriptionData)
        .eq('id', params.id);
      
      if (prescriptionError) throw prescriptionError;
      
      // Delete existing prescription medications
      const { error: deleteError } = await supabase
        .from('prescription_medications')
        .delete()
        .eq('prescription_id', params.id);
      
      if (deleteError) throw deleteError;
      
      // Add medications to the prescription
      if (medicationItems.length > 0) {
        const prescriptionMedications = medicationItems.map(item => ({
          ...item,
          prescription_id: params.id
        }));
        
        const { error: medicationsError } = await supabase
          .from('prescription_medications')
          .insert(prescriptionMedications);
        
        if (medicationsError) throw medicationsError;
      }
      
      // Redirect to the prescription detail page
      router.push(`/prescriptions/${params.id}`);
    } catch (err: any) {
      console.error('Error updating prescription:', err);
      setError(err.message || 'Failed to update prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Prescription not found.</p>
              <div className="mt-4">
                <Link
                  href="/prescriptions"
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
                >
                  Back to Prescriptions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Prescription</h1>
        <Link
          href={`/prescriptions/${params.id}`}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Cancel
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
          <PrescriptionForm
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/prescriptions/${params.id}`)}
            patients={patients}
            doctors={doctors}
            medications={medications}
            onSearchPatient={handleSearchPatient}
            onSearchDoctor={handleSearchDoctor}
            onSearchMedication={handleSearchMedication}
            onAddPatient={handleAddPatient}
            onAddDoctor={handleAddDoctor}
            onAddMedication={handleAddMedication}
            isSubmitting={isSubmitting}
            initialData={prescription}
            initialMedications={prescriptionMedications}
          />
        </div>
      </div>
    </div>
  );
}
