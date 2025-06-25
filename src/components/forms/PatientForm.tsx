import React, { useState } from 'react';
import { Patient } from '@/types/database';
import PatientNameInput from '@/components/ui/PatientNameInput';

type PatientFormProps = {
  onSubmit: (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: Partial<Patient>;
  isSubmitting?: boolean;
};

export default function PatientForm({
  onSubmit,
  onCancel,
  initialData = {},
  isSubmitting = false,
}: PatientFormProps) {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    dob: '',
    gender: '',
    id_number: '',
    dp_number: '',
    birth_cert_pin: '',
    phone: '',
    phone2: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    ...initialData,
  });

  // Check if this is a Lightspeed-synced patient
  const isLightspeedPatient = !!(initialData as any)?.lightspeed_id;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Function to format date for display
  const formatDate = (date: string | null): string => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    } catch (e) {
      return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Collect validation errors
    const errors: string[] = [];
    
    if (!formData.name?.trim()) errors.push('Name is required');
    if (!formData.dob) errors.push('Date of birth is required');
    if (!formData.gender) errors.push('Gender is required');
    if (!formData.phone?.trim()) errors.push('Phone number is required');
    
    // Display all validation errors at once
    if (errors.length > 0) {
      alert(`Please fix the following issues:\n${errors.join('\n')}`);
      return;
    }
    
    try {
      // Ensure all required fields are present with default values if needed
      const patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name?.trim() || '',
        dob: formData.dob || '',
        gender: formData.gender || '',
        id_number: formData.id_number?.trim() || '',
        dp_number: formData.dp_number?.trim() || '',
        birth_cert_pin: formData.birth_cert_pin?.trim() || '',
        phone: formData.phone?.trim() || '',
        phone2: formData.phone2?.trim() || '',
        email: formData.email?.trim() || '',
        address: formData.address?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        zip: formData.zip?.trim() || ''
      };
      
      console.log('Submitting patient data:', patientData);
      onSubmit(patientData);
    } catch (error) {
      console.error('Error preparing patient data:', error);
      alert('An error occurred while preparing the patient data. Please check the form and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLightspeedPatient && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Lightspeed Synced Patient
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                This patient was imported from Lightspeed POS. Some fields may be read-only to maintain data integrity.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <PatientNameInput
            value={formData.name || ''}
            onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
            dob={formData.dob}
            phone={formData.phone}
            required
          />
        </div>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dob"
            id="dob"
            required
            value={formData.dob || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender *
          </label>
          <select
            name="gender"
            id="gender"
            required
            value={formData.gender || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="id_number" className="block text-sm font-medium text-gray-700">
            ID Number
          </label>
          <input
            type="text"
            name="id_number"
            id="id_number"
            value={formData.id_number || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="dp_number" className="block text-sm font-medium text-gray-700">
            DP Number
          </label>
          <input
            type="text"
            name="dp_number"
            id="dp_number"
            value={formData.dp_number || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="birth_cert_pin" className="block text-sm font-medium text-gray-700">
            Birth Certificate PIN
          </label>
          <input
            type="text"
            name="birth_cert_pin"
            id="birth_cert_pin"
            value={formData.birth_cert_pin || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone *
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
            Alternative Phone
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
            Email
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
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Address Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              name="city"
              id="city"
              value={formData.city || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              name="state"
              id="state"
              value={formData.state || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input
              type="text"
              name="zip"
              id="zip"
              value={formData.zip || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
        >
          {isSubmitting ? 'Saving...' : 'Save Patient'}
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
