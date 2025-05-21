'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PatientForm from '@/components/forms/PatientForm';
import { Patient } from '@/types/database';

interface EditPatientPageProps {
  params: {
    id: string;
  };
}

export default function EditPatientPage({ params }: EditPatientPageProps) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setPatient(data);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Failed to load patient details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [params.id]);

  const handleSubmit = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check for duplicate patient based on name and DOB (excluding this patient)
      if (patientData.name && patientData.dob) {
        console.log('Checking for duplicates with:', { 
          name: patientData.name.trim().toLowerCase(), 
          dob: patientData.dob,
          excludeId: params.id
        });
        
        // Use ilike for case-insensitive name matching
        const { data: existingPatients, error: searchError } = await supabase
          .from('patients')
          .select('id, name, dob')
          .ilike('name', patientData.name.trim())
          .eq('dob', patientData.dob)
          .neq('id', params.id)
          .limit(5);
        
        if (searchError) {
          console.error('Error checking for duplicates:', searchError);
          throw searchError;
        }
        
        console.log('Found potential duplicates:', existingPatients);
        
        if (existingPatients && existingPatients.length > 0) {
          // Double check with case-insensitive comparison
          const normalizedName = patientData.name.trim().toLowerCase();
          const duplicate = existingPatients.find(p => 
            p.name.trim().toLowerCase() === normalizedName && 
            p.dob === patientData.dob
          );
          
          if (duplicate) {
            console.log('Confirmed duplicate:', duplicate);
            setError(`Another patient with the same name and date of birth already exists.`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Update the patient
      const { error: updateError } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', params.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Redirect to the patient detail page
      router.push(`/patients/${params.id}`);
      router.refresh();
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/patients/${params.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error || 'Patient not found'}</p>
            <div className="mt-2">
              <Link 
                href="/patients"
                className="text-sm text-red-700 underline"
              >
                Back to patients
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
        <Link
          href={`/patients/${params.id}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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

      <div className="bg-white shadow-sm rounded-lg p-6">
        {patient && (
          <PatientForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={patient}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
