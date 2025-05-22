'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MigratePrescriptionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleMigration = async () => {
    setIsLoading(true);
    setMessage('Starting migration...');
    setError(null);
    setSuccess(false);

    try {
      // Check if the prescriptions table exists
      setMessage('Checking if prescriptions table exists...');
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('prescriptions')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (tableCheckError && !tableCheckError.message.includes('relation "prescriptions" does not exist')) {
        throw tableCheckError;
      }

      // Create the prescriptions table if it doesn't exist
      if (tableExists === null) {
        setMessage('Creating prescriptions table...');
        const { error: createPrescriptionsError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS prescriptions (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              rx_number TEXT NOT NULL,
              patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
              doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
              prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
              notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Create updated_at trigger function if it doesn't exist
            CREATE OR REPLACE FUNCTION update_modified_column()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            
            -- Create trigger for prescriptions table
            DROP TRIGGER IF EXISTS set_prescriptions_updated_at ON prescriptions;
            CREATE TRIGGER set_prescriptions_updated_at
            BEFORE UPDATE ON prescriptions
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
          `
        });

        if (createPrescriptionsError) throw createPrescriptionsError;
      } else {
        setMessage('Prescriptions table already exists. Checking for required columns...');
        
        // Check if rx_number column exists and add it if needed
        const { error: rxNumberColumnCheckError } = await supabase.rpc('check_column_exists', {
          table_name: 'prescriptions',
          column_name: 'rx_number'
        });

        if (rxNumberColumnCheckError) {
          setMessage('Adding rx_number column to prescriptions table...');
          const { error: alterError } = await supabase.rpc('execute_sql', {
            sql_query: 'ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS rx_number TEXT NOT NULL DEFAULT CONCAT(\'RX-\', FLOOR(RANDOM() * 1000000)::TEXT)'
          });
          
          if (alterError) throw alterError;
        }
      }

      // Check if the prescription_medications table exists
      setMessage('Checking if prescription_medications table exists...');
      const { data: junctionTableExists, error: junctionTableCheckError } = await supabase
        .from('prescription_medications')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (junctionTableCheckError && !junctionTableCheckError.message.includes('relation "prescription_medications" does not exist')) {
        throw junctionTableCheckError;
      }

      // Create the prescription_medications junction table if it doesn't exist
      if (junctionTableExists === null) {
        setMessage('Creating prescription_medications table...');
        const { error: createJunctionError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS prescription_medications (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
              medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE RESTRICT,
              dosage TEXT NOT NULL,
              quantity INTEGER NOT NULL DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(prescription_id, medication_id)
            );
            
            -- Create trigger for prescription_medications table
            DROP TRIGGER IF EXISTS set_prescription_medications_updated_at ON prescription_medications;
            CREATE TRIGGER set_prescription_medications_updated_at
            BEFORE UPDATE ON prescription_medications
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
          `
        });

        if (createJunctionError) throw createJunctionError;
      }

      // Enable Row Level Security
      setMessage('Enabling Row Level Security on prescriptions tables...');
      const { error: rlsError } = await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
          
          -- Create policy for authenticated users
          DROP POLICY IF EXISTS "Authenticated users can CRUD prescriptions" ON prescriptions;
          CREATE POLICY "Authenticated users can CRUD prescriptions"
          ON prescriptions
          USING (auth.role() = 'authenticated')
          WITH CHECK (auth.role() = 'authenticated');
          
          ALTER TABLE prescription_medications ENABLE ROW LEVEL SECURITY;
          
          -- Create policy for authenticated users
          DROP POLICY IF EXISTS "Authenticated users can CRUD prescription_medications" ON prescription_medications;
          CREATE POLICY "Authenticated users can CRUD prescription_medications"
          ON prescription_medications
          USING (auth.role() = 'authenticated')
          WITH CHECK (auth.role() = 'authenticated');
        `
      });

      if (rlsError) throw rlsError;

      setMessage('Migration completed successfully!');
      setSuccess(true);
    } catch (err: any) {
      console.error('Migration error:', err);
      setError(err.message || 'An unknown error occurred during migration.');
      setMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Migrate Prescriptions Tables</h1>
        <Link
          href="/"
          className="text-indigo-600 hover:text-indigo-900"
        >
          Back to Home
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Database Migration for Prescriptions
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              This will create the prescriptions and prescription_medications tables in your Supabase database if they don't exist.
              It will also set up the necessary columns and enable Row Level Security.
            </p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleMigration}
              disabled={isLoading || success}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                success
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? 'Migrating...' : success ? 'Migration Successful' : 'Run Migration'}
            </button>
          </div>

          {message && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">{message}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Migration completed successfully!</p>
                  <div className="mt-4">
                    <Link
                      href="/prescriptions"
                      className="text-sm font-medium text-green-700 hover:text-green-600"
                    >
                      Go to Prescriptions
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
