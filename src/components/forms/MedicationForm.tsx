import React, { useState } from 'react';
import { Medication } from '@/types/database';

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
    name: '',
    strength: '',
    count: 0,
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value, 10) : 0) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Medication, 'id' | 'created_at' | 'updated_at'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Medication Name *
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="strength" className="block text-sm font-medium text-gray-700">
          Strength *
        </label>
        <input
          type="text"
          name="strength"
          id="strength"
          required
          placeholder="e.g., 10mg, 25mg/5ml"
          value={formData.strength || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="count" className="block text-sm font-medium text-gray-700">
          Count (Units per Container)
        </label>
        <input
          type="number"
          name="count"
          id="count"
          min="0"
          value={formData.count || 0}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

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
