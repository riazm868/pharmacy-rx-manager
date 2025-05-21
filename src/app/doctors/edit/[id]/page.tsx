'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DoctorForm from '@/components/forms/DoctorForm';
import { Doctor } from '@/types/database';

export default function EditDoctorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          throw error;
        }

        setDoctor(data);
      } catch (error: any) {
        console.error('Error fetching doctor:', error);
        setError(error.message || 'Failed to load doctor details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [params.id]);

  const handleSubmit = async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check for duplicate doctor based on name and phone (excluding this doctor)
      if (doctorData.name && doctorData.phone) {
        console.log('Checking for duplicates with:', { 
          name: doctorData.name.trim().toLowerCase(), 
          phone: doctorData.phone,
          excludeId: params.id
        });
        
        // Use ilike for case-insensitive name matching
        const { data: existingDoctors, error: searchError } = await supabase
          .from('doctors')
          .select('id, name, phone')
          .ilike('name', doctorData.name.trim())
          .eq('phone', doctorData.phone)
          .neq('id', params.id)
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
            setError(`Another doctor with the same name and phone number already exists.`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Update the doctor
      const { error: updateError } = await supabase
        .from('doctors')
        .update(doctorData)
        .eq('id', params.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Redirect to the doctor detail page
      router.push(`/doctors/${params.id}`);
    } catch (err: any) {
      console.error('Error updating doctor:', err);
      setError(err.message || 'Failed to update doctor. Please try again.');
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

  if (error && !doctor) {
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
                  href="/doctors"
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Back to Doctors
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Doctor</h1>
        <div className="flex space-x-4">
          <Link
            href={`/doctors/${params.id}`}
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
          {doctor && (
            <DoctorForm
              initialData={doctor}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/doctors/${params.id}`)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
