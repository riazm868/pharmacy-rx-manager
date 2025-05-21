'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DoctorForm from '@/components/forms/DoctorForm';
import { Doctor } from '@/types/database';

export default function NewDoctorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check for duplicate doctor based on name and phone
      if (doctorData.name && doctorData.phone) {
        console.log('Checking for duplicates with:', { 
          name: doctorData.name.trim().toLowerCase(), 
          phone: doctorData.phone 
        });
        
        // Use ilike for case-insensitive name matching
        const { data: existingDoctors, error: searchError } = await supabase
          .from('doctors')
          .select('id, name, phone')
          .ilike('name', doctorData.name.trim())
          .eq('phone', doctorData.phone)
          .limit(5);
        
        if (searchError) {
          console.error('Error checking for duplicates:', searchError);
          throw searchError;
        }
        
        console.log('Found potential duplicates:', existingDoctors);
        
        if (existingDoctors && existingDoctors.length > 0) {
          // Double check with case-insensitive comparison
          const normalizedName = doctorData.name.trim().toLowerCase();
          const duplicate = existingDoctors.find(d => 
            d.name.trim().toLowerCase() === normalizedName && 
            d.phone === doctorData.phone
          );
          
          if (duplicate) {
            console.log('Confirmed duplicate:', duplicate);
            setError(`A doctor with the same name and phone number already exists.`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Create the doctor
      const { data, error: insertError } = await supabase
        .from('doctors')
        .insert(doctorData)
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      // Redirect to the doctors list
      router.push('/doctors');
    } catch (err: any) {
      console.error('Error creating doctor:', err);
      setError(err.message || 'Failed to create doctor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Doctor</h1>
        <Link
          href="/doctors"
          className="text-indigo-600 hover:text-indigo-900"
        >
          Back to Doctors
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
          <DoctorForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/doctors')}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
