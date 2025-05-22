'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MedicationForm from '@/components/forms/MedicationForm';
import { Medication } from '@/types/database';

export default function EditMedicationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const { data, error } = await supabase
          .from('medications')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          throw error;
        }

        setMedication(data);
      } catch (error: any) {
        console.error('Error fetching medication:', error);
        setError(error.message || 'Failed to load medication details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedication();
  }, [params.id]);

  const handleSubmit = async (medicationData: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check for duplicate medication based on name (excluding this medication)
      if (medicationData.name) {
        console.log('Checking for duplicates with:', { 
          name: medicationData.name.trim().toLowerCase(),
          excludeId: params.id
        });
        
        // Use ilike for case-insensitive name matching
        const { data: existingMedications, error: searchError } = await supabase
          .from('medications')
          .select('id, name')
          .ilike('name', medicationData.name.trim())
          .neq('id', params.id)
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
            setError(`Another medication with the same name already exists.`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Ensure strength field is set
      const dataToUpdate = {
        ...medicationData,
        strength: medicationData.strength || 'N/A'
      };
      
      // Update the medication
      const { error: updateError } = await supabase
        .from('medications')
        .update(dataToUpdate)
        .eq('id', params.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Redirect to the medication detail page
      router.push(`/medications/${params.id}`);
    } catch (err: any) {
      console.error('Error updating medication:', err);
      setError(err.message || 'Failed to update medication. Please try again.');
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

  if (error && !medication) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <Link
                  href="/medications"
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Back to Medications
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Medication</h1>
        <div className="flex space-x-4">
          <Link
            href={`/medications/${params.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Cancel
          </Link>
        </div>
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
          {medication && (
            <MedicationForm
              initialData={medication}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/medications/${params.id}`)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
