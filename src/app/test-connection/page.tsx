'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Testing connection to Supabase...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/test-connection');
        const result = await response.json();
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
        
        setDetails(result);
      } catch (error) {
        setStatus('error');
        setMessage('Error testing connection');
        setDetails({ error: String(error) });
      }
    };

    testConnection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className={`p-4 rounded-lg mb-6 ${
        status === 'loading' ? 'bg-gray-100' :
        status === 'success' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <div className="flex items-center mb-2">
          {status === 'loading' && (
            <svg className="animate-spin h-5 w-5 mr-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {status === 'success' && (
            <svg className="h-5 w-5 mr-3 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {status === 'error' && (
            <svg className="h-5 w-5 mr-3 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <h2 className={`text-lg font-medium ${
            status === 'loading' ? 'text-gray-700' :
            status === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {message}
          </h2>
        </div>
        
        {details && (
          <div className="mt-4 bg-white p-4 rounded border overflow-auto">
            <pre className="text-sm">{JSON.stringify(details, null, 2)}</pre>
          </div>
        )}
      </div>

      {status !== 'loading' && (
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Test Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      )}

      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Troubleshooting</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Make sure your <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file exists with the correct Supabase credentials</li>
          <li>Check that your Supabase project is running and accessible</li>
          <li>Verify that the database tables have been created correctly</li>
          <li>Ensure that the Supabase client is properly installed</li>
        </ul>
      </div>
    </div>
  );
}
