'use client';

import { useState } from 'react';
import LivePatientSearch from '@/components/ui/LivePatientSearch';
import { usePatientSearch, useMedicationSearch, useDoctorSearch } from '@/hooks/useApiSearch';
import { Patient, Medication, Doctor } from '@/types/database';

export default function SearchDemoPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Example of using the hooks directly
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const patientResults = usePatientSearch(patientSearchTerm, { limit: 5 });
  
  const [medicationSearchTerm, setMedicationSearchTerm] = useState('');
  const medicationResults = useMedicationSearch(medicationSearchTerm, { limit: 5 });
  
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const doctorResults = useDoctorSearch(doctorSearchTerm, { limit: 5 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Live API Search Demo</h1>
      
      {/* Phase 1: API Endpoints with Search Parameters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Phase 1: API Endpoints</h2>
        <p className="text-gray-600 mb-4">
          We've enhanced our API endpoints to support search parameters:
        </p>
        <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-2">
          <div>GET /api/patients?search=john&limit=10&offset=0</div>
          <div>GET /api/medications?search=amox&limit=10&offset=0</div>
          <div>GET /api/doctors?search=smith&limit=10&offset=0</div>
        </div>
        <p className="text-gray-600 mt-4">
          These endpoints now support pagination and search filtering.
        </p>
      </div>

      {/* Phase 2: React Hooks for Live Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Phase 2: React Hooks</h2>
        <p className="text-gray-600 mb-4">
          Custom hooks provide debouncing, caching, and error handling:
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Patients (using hook directly)
            </label>
            <input
              type="text"
              value={patientSearchTerm}
              onChange={(e) => setPatientSearchTerm(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Type to search..."
            />
            <div className="mt-2 text-sm">
              {patientResults.isLoading && <span className="text-gray-500">Loading...</span>}
              {patientResults.error && <span className="text-red-600">Error: {patientResults.error}</span>}
              {!patientResults.isLoading && !patientResults.error && (
                <span className="text-gray-600">
                  Found {patientResults.total} patients
                  {patientResults.data.length > 0 && (
                    <span> (showing {patientResults.data.length})</span>
                  )}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Medications (using hook directly)
            </label>
            <input
              type="text"
              value={medicationSearchTerm}
              onChange={(e) => setMedicationSearchTerm(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Type to search..."
            />
            <div className="mt-2 text-sm">
              {medicationResults.isLoading && <span className="text-gray-500">Loading...</span>}
              {medicationResults.error && <span className="text-red-600">Error: {medicationResults.error}</span>}
              {!medicationResults.isLoading && !medicationResults.error && (
                <span className="text-gray-600">
                  Found {medicationResults.total} medications
                  {medicationResults.data.length > 0 && (
                    <span> (showing {medicationResults.data.length})</span>
                  )}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Doctors (using hook directly)
            </label>
            <input
              type="text"
              value={doctorSearchTerm}
              onChange={(e) => setDoctorSearchTerm(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Type to search..."
            />
            <div className="mt-2 text-sm">
              {doctorResults.isLoading && <span className="text-gray-500">Loading...</span>}
              {doctorResults.error && <span className="text-red-600">Error: {doctorResults.error}</span>}
              {!doctorResults.isLoading && !doctorResults.error && (
                <span className="text-gray-600">
                  Found {doctorResults.total} doctors
                  {doctorResults.data.length > 0 && (
                    <span> (showing {doctorResults.data.length})</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phase 3: Complete Search Components */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Phase 3: Search Components</h2>
        <p className="text-gray-600 mb-4">
          Full-featured search components with dropdown results:
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Search Component
            </label>
            <LivePatientSearch
              onSelectPatient={(patient) => setSelectedPatient(patient)}
              placeholder="Search patients..."
            />
            {selectedPatient && (
              <div className="mt-2 p-3 bg-green-50 rounded text-sm">
                Selected: {selectedPatient.name} (ID: {selectedPatient.id_number})
              </div>
            )}
          </div>

          {/* You can create similar components for medications and doctors */}
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Similar components can be created for medications and doctors using the same pattern.
            </p>
          </div>
        </div>
      </div>

      {/* Features Summary */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Features Implemented</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Debouncing:</strong> Searches are delayed by 300ms to reduce API calls</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Caching:</strong> Results are cached for 5 minutes to improve performance</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Request Cancellation:</strong> Previous requests are cancelled when new searches start</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Loading States:</strong> Clear feedback during search operations</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Error Handling:</strong> Graceful error handling with user feedback</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Pagination:</strong> API supports limit and offset parameters</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 