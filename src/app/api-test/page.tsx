'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [patientResult, setPatientResult] = useState<any>(null);
  const [medicationResult, setMedicationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testPatientApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/patients?search=test&limit=5');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      setPatientResult({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });
    } catch (err: any) {
      setError(`Patient API Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testMedicationApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/medications?search=test&limit=5');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      setMedicationResult({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });
    } catch (err: any) {
      setError(`Medication API Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCookies = () => {
    // Check document.cookie to see what cookies are accessible from JavaScript
    const cookies = document.cookie;
    alert(`Browser cookies: ${cookies || 'No cookies found'}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testPatientApi}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Patient API
          </button>
          
          <button
            onClick={testMedicationApi}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Medication API
          </button>

          <button
            onClick={checkCookies}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Check Cookies
          </button>
        </div>

        {loading && (
          <div className="text-gray-600">Loading...</div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
            {error}
          </div>
        )}

        {patientResult && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Patient API Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(patientResult, null, 2)}
            </pre>
          </div>
        )}

        {medicationResult && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Medication API Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(medicationResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 