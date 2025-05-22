import React from 'react';
import { Patient, Doctor, Medication } from '@/types/database';

type SimplePrescriptionFormProps = {
  onCancel: () => void;
  patients: Patient[];
  doctors: Doctor[];
  medications: Medication[];
};

export default function SimplePrescriptionForm({
  onCancel,
  patients,
  doctors,
  medications,
}: SimplePrescriptionFormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Simplified Prescription Form</h3>
        <p className="mt-1 text-sm text-gray-500">
          This is a simplified version of the prescription form for debugging purposes.
        </p>
        
        <div className="mt-4">
          <p>Patients available: {patients.length}</p>
          <p>Doctors available: {doctors.length}</p>
          <p>Medications available: {medications.length}</p>
        </div>
        
        <div className="mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
