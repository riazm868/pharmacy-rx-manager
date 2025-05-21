'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MedicationForm from '@/components/forms/MedicationForm';
import { Medication } from '@/types/database';

export default function NewMedicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (medicationData: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check for duplicate medication based on name
      if (medicationData.name) {
        console.log('Checking for duplicates with:', { 
          name: medicationData.name.trim().toLowerCase()
        });
        
        // Use ilike for case-insensitive name matching
        const { data: existingMedications, error: searchError } = await supabase
          .from('medications')
          .select('id, name')
          .ilike('name', medicationData.name.trim())
          .limit(5);
        
        if (searchError) {
          console.error('Error checking for duplicates:', searchError);
          throw searchError;
        }
        
        console.log('Found potential duplicates:', existingMedications);
        
        if (existingMedications && existingMedications.length > 0) {
          // Double check with case-insensitive comparison
          const normalizedName = medicationData.name.trim().toLowerCase();
          const duplicate = existingMedications.find(m => 
            m.name.trim().toLowerCase() === normalizedName
          );
          
          if (duplicate) {
            console.log('Confirmed duplicate:', duplicate);
            setError(`A medication with the same name already exists.`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Ensure strength field is set
      const dataToInsert = {
        ...medicationData,
        strength: medicationData.strength || 'N/A'
      };
      
      // Create the medication
      const { data, error: insertError } = await supabase
        .from('medications')
        .insert(dataToInsert)
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      // Redirect to the medications list
      router.push('/medications');
    } catch (err: any) {
      console.error('Error creating medication:', err);
      setError(err.message || 'Failed to create medication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Medication</h1>
        <Link
          href="/medications"
          className="text-indigo-600 hover:text-indigo-900"
        >
          Back to Medications
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
          <MedicationForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/medications')}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
