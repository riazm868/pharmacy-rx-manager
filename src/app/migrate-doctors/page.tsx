'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MigrateDoctorsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const runMigration = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      // Check if we can access the doctors table
      const { error: checkError } = await supabase.from('doctors').select('id').limit(1);
      
      if (checkError) {
        throw checkError;
      }
      
      // Run a raw SQL query to add all columns at once
      const { error } = await supabase.rpc('pg_alter_table', {
        table_name: 'doctors',
        sql_query: `
          ALTER TABLE doctors
          ADD COLUMN IF NOT EXISTS phone2 TEXT,
          ADD COLUMN IF NOT EXISTS email TEXT,
          ADD COLUMN IF NOT EXISTS registration_number TEXT,
          ADD COLUMN IF NOT EXISTS clinic_name TEXT,
          ADD COLUMN IF NOT EXISTS clinic_address TEXT;
        `
      });
      
      if (error) {
        console.error('Migration error:', error);
        throw error;
      }
      
      setResult({ 
        success: true, 
        message: 'Migration completed. The doctors table has been updated with the new fields.' 
      });
    } catch (err: any) {
      console.error('Migration failed:', err);
      setResult({ 
        success: false, 
        message: `Migration failed: ${err.message || 'Unknown error'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Migrate Doctors Table</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <p className="mb-4">
          This page will update the doctors table in your database to add the following fields:
        </p>
        
        <ul className="list-disc pl-5 mb-6">
          <li>phone2 (Secondary Phone Number)</li>
          <li>email (Email Address)</li>
          <li>registration_number (Doctor Registration Number)</li>
          <li>clinic_name (Clinic Name)</li>
          <li>clinic_address (Clinic Address)</li>
        </ul>
        
        {result && (
          <div className={`p-4 mb-6 rounded-md ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {result.message}
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            onClick={runMigration}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Running Migration...' : 'Run Migration'}
          </button>
          
          <Link
            href="/doctors"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Doctors
          </Link>
        </div>
      </div>
    </div>
  );
}
