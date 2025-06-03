import React, { useState } from 'react';
import { Patient } from '@/types/database';
import PatientForm from '../forms/PatientForm';

type PatientDetailsModalProps = {
  patient: Patient | null;
  onUpdatePatient: (updatedPatient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<Patient>;
  onClose: () => void;
};

export default function PatientDetailsModal({
  patient,
  onUpdatePatient,
  onClose,
}: PatientDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!patient) return null;

  const handleUpdatePatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    setIsUpdating(true);
    try {
      await onUpdatePatient(patientData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date helper function
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div>
      {isEditing ? (
        <PatientForm
          onSubmit={handleUpdatePatient}
          isSubmitting={isUpdating}
          initialData={patient}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="mt-1 text-sm text-gray-900">{patient.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
              <p className="mt-1 text-sm text-gray-900">{formatDate(patient.dob)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Gender</h4>
              <p className="mt-1 text-sm text-gray-900">{patient.gender}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Phone</h4>
              <p className="mt-1 text-sm text-gray-900">{patient.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Email</h4>
              <p className="mt-1 text-sm text-gray-900">{patient.email || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Address</h4>
              <p className="mt-1 text-sm text-gray-900">{patient.address || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">City</h4>
              <p className="mt-1 text-sm text-gray-900">{patient.city || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">State</h4>
              <p className="mt-1 text-sm text-gray-900">{patient.state || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">ZIP</h4>
              <p className="mt-1 text-sm text-gray-900">{patient.zip || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Patient
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
