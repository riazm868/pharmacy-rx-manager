import React, { useState } from 'react';
import { Medication } from '@/types/database';
import MedicationNameInput from '@/components/ui/MedicationNameInput';

type MedicationFormProps = {
  onSubmit: (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: Partial<Medication>;
  isSubmitting?: boolean;
};

export default function MedicationForm({
  onSubmit,
  onCancel,
  initialData = {},
  isSubmitting = false,
}: MedicationFormProps) {
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: initialData?.name || '',
    strength: initialData?.strength || 'N/A', // Default value for strength
    count: initialData?.count || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value, 10) : 0) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData as Omit<Medication, 'id' | 'created_at' | 'updated_at'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Medication Name *
        </label>
        <MedicationNameInput
          value={formData.name || ''}
          onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
          required
        />
      </div>

      {/* Strength field is hidden but will use default value */}

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
        >
          {isSubmitting ? 'Saving...' : 'Save Medication'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
