import React, { useState } from 'react';
import { Doctor } from '@/types/database';
import DoctorForm from '../forms/DoctorForm';

type DoctorDetailsModalProps = {
  doctor: Doctor | null;
  onUpdateDoctor: (updatedDoctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => Promise<Doctor>;
  onClose: () => void;
};

export default function DoctorDetailsModal({
  doctor,
  onUpdateDoctor,
  onClose,
}: DoctorDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!doctor) return null;

  const handleUpdateDoctor = async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    setIsUpdating(true);
    try {
      await onUpdateDoctor(doctorData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert('Failed to update doctor. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Format phone number helper function
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return 'N/A';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a 10-digit number
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    }
    
    return phone;
  };

  return (
    <div>
      {isEditing ? (
        <DoctorForm
          onSubmit={handleUpdateDoctor}
          isSubmitting={isUpdating}
          initialData={doctor}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="mt-1 text-sm text-gray-900">{doctor.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Registration Number</h4>
              <p className="mt-1 text-sm text-gray-900">{doctor.registration_number || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Clinic Name</h4>
              <p className="mt-1 text-sm text-gray-900">{doctor.clinic_name || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Phone</h4>
              <p className="mt-1 text-sm text-gray-900">{formatPhoneNumber(doctor.phone)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Alternative Phone</h4>
              <p className="mt-1 text-sm text-gray-900">{doctor.phone2 ? formatPhoneNumber(doctor.phone2) : 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Email</h4>
              <p className="mt-1 text-sm text-gray-900">{doctor.email || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-500">Address</h4>
              <p className="mt-1 text-sm text-gray-900">{doctor.address || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Doctor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
