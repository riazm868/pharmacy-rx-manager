import React, { useState } from 'react';
import { Doctor } from '@/types/database';
import DoctorNameInput from '@/components/ui/DoctorNameInput';

type DoctorFormProps = {
  onSubmit: (doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: Partial<Doctor>;
  isSubmitting?: boolean;
};

export default function DoctorForm({
  onSubmit,
  onCancel,
  initialData = {},
  isSubmitting = false,
}: DoctorFormProps) {
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    phone: '',
    phone2: '',
    email: '',
    registration_number: '',
    clinic_name: '',
    address: '',
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Doctor, 'id' | 'created_at' | 'updated_at'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Doctor Name *
        </label>
        <DoctorNameInput
          value={formData.name || ''}
          onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
          phone={formData.phone}
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number *
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          required
          value={formData.phone || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="phone2" className="block text-sm font-medium text-gray-700">
          Secondary Phone Number
        </label>
        <input
          type="tel"
          name="phone2"
          id="phone2"
          value={formData.phone2 || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">
          Doctor Registration Number
        </label>
        <input
          type="text"
          name="registration_number"
          id="registration_number"
          value={formData.registration_number || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="clinic_name" className="block text-sm font-medium text-gray-700">
          Clinic Name
        </label>
        <input
          type="text"
          name="clinic_name"
          id="clinic_name"
          value={formData.clinic_name || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Clinic Address
        </label>
        <textarea
          name="address"
          id="address"
          rows={3}
          value={formData.address || ''}
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
          {isSubmitting ? 'Saving...' : 'Save Doctor'}
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
