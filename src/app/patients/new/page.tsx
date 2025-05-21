'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PatientForm from '@/components/forms/PatientForm';
import { Patient } from '@/types/database';

export default function NewPatientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check for duplicate patient based on name and DOB
      if (patientData.name && patientData.dob) {
        console.log('Checking for duplicates with:', { 
          name: patientData.name.trim().toLowerCase(), 
          dob: patientData.dob 
        });
        
        // Use ilike for case-insensitive name matching
        const { data: existingPatients, error: searchError } = await supabase
          .from('patients')
          .select('id, name, dob')
          .ilike('name', patientData.name.trim())
          .eq('dob', patientData.dob)
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
            setError(`A patient with the same name and date of birth already exists.`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Create the patient
      const { data, error: insertError } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      // Redirect to the patients list
      router.push('/patients');
      router.refresh();
    } catch (err) {
      console.error('Error creating patient:', err);
      setError('Failed to create patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/patients');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
        <Link
          href="/patients"
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
        <PatientForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
