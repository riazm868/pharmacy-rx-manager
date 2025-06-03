import React, { useState } from 'react';
import { Medication } from '@/types/database';
import MedicationForm from '../forms/MedicationForm';

type MedicationDetailsModalProps = {
  medication: Medication | null;
  onUpdateMedication: (updatedMedication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => Promise<Medication>;
  onClose: () => void;
};

export default function MedicationDetailsModal({
  medication,
  onUpdateMedication,
  onClose,
}: MedicationDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!medication) return null;

  const handleUpdateMedication = async (medicationData: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    setIsUpdating(true);
    try {
      await onUpdateMedication(medicationData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating medication:', error);
      alert('Failed to update medication. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {isEditing ? (
        <MedicationForm
          onSubmit={handleUpdateMedication}
          isSubmitting={isUpdating}
          initialData={medication}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="mt-1 text-sm text-gray-900">{medication.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Strength</h4>
              <p className="mt-1 text-sm text-gray-900">{medication.strength}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Count</h4>
              <p className="mt-1 text-sm text-gray-900">{medication.count}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Manufacturer</h4>
              <p className="mt-1 text-sm text-gray-900">{medication.manufacturer || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Medication
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
