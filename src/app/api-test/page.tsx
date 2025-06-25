'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ApiTestPage() {
  const [patientResult, setPatientResult] = useState<any>(null);
  const [medicationResult, setMedicationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [sampleDataStatus, setSampleDataStatus] = useState<string>('');

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

  const runMigration = async () => {
    setIsRunning(true);
    setMigrationStatus('Running migration...');
    
    try {
      // Check if columns already exist first
      const { data: checkMedications, error: checkMedError } = await supabase
        .from('medications')
        .select('lightspeed_id, price')
        .limit(1);
      
      if (!checkMedError) {
        setMigrationStatus('Migration already completed - columns exist!');
        setIsRunning(false);
        return;
      }
      
      // Run the migration SQL
      const migrationSQL = `
        -- Add lightspeed_id and price columns to medications table
        ALTER TABLE medications 
        ADD COLUMN IF NOT EXISTS lightspeed_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;

        -- Add index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_medications_lightspeed_id ON medications(lightspeed_id);

        -- Add to patients table (for consistency)
        ALTER TABLE patients 
        ADD COLUMN IF NOT EXISTS lightspeed_id VARCHAR(255);

        -- Add index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_patients_lightspeed_id ON patients(lightspeed_id);
      `;
      
      // Split and execute each statement
      const statements = migrationSQL.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { query: statement.trim() });
          if (error) {
            console.error('SQL Error:', error);
            throw error;
          }
        }
      }
      
      setMigrationStatus('Migration completed successfully!');
    } catch (error: any) {
      console.error('Migration error:', error);
      setMigrationStatus(`Migration failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const createSampleData = async () => {
    setSampleDataStatus('Creating sample data...');
    
    try {
      // Sample patients
      const samplePatients = [
        {
          name: 'John Smith',
          dob: '1985-06-15',
          gender: 'male',
          id_number: 'ID123456789',
          phone: '868-123-4567',
          email: 'john.smith@email.com',
          address: '123 Main Street, Port of Spain',
          city: 'Port of Spain',
          state: 'Trinidad',
          zip: '12345'
        },
        {
          name: 'Maria Rodriguez',
          dob: '1990-03-22',
          gender: 'female',
          id_number: 'ID987654321',
          phone: '868-987-6543',
          email: 'maria.rodriguez@email.com',
          address: '456 Queen Street, San Fernando',
          city: 'San Fernando',
          state: 'Trinidad',
          zip: '54321'
        },
        {
          name: 'Dr. Michael Johnson',
          dob: '1978-11-08',
          gender: 'male',
          id_number: 'ID456789123',
          phone: '868-456-7890',
          email: 'dr.johnson@hospital.com',
          address: '789 Hospital Road, Chaguanas',
          city: 'Chaguanas',
          state: 'Trinidad',
          zip: '67890'
        }
      ];

      // Sample medications
      const sampleMedications = [
        {
          name: 'Paracetamol 500mg',
          strength: '500mg',
          count: 100,
          price: 25.00
        },
        {
          name: 'Ibuprofen 400mg',
          strength: '400mg',
          count: 75,
          price: 35.00
        },
        {
          name: 'Amoxicillin 250mg',
          strength: '250mg',
          count: 50,
          price: 45.00
        }
      ];

      // Sample doctors
      const sampleDoctors = [
        {
          name: 'Dr. Sarah Williams',
          specialization: 'General Practice',
          license_number: 'GP001234',
          phone: '868-111-2222',
          email: 'dr.williams@clinic.com',
          address: '100 Medical Center, Port of Spain'
        },
        {
          name: 'Dr. Robert Brown',
          specialization: 'Cardiology',
          license_number: 'CD005678',
          phone: '868-333-4444',
          email: 'dr.brown@cardio.com',
          address: '200 Heart Center, San Fernando'
        }
      ];

      // Insert patients
      const { error: patientsError } = await supabase
        .from('patients')
        .insert(samplePatients);
      
      if (patientsError) throw patientsError;

      // Insert medications
      const { error: medicationsError } = await supabase
        .from('medications')
        .insert(sampleMedications);
      
      if (medicationsError) throw medicationsError;

      // Insert doctors
      const { error: doctorsError } = await supabase
        .from('doctors')
        .insert(sampleDoctors);
      
      if (doctorsError) throw doctorsError;

      setSampleDataStatus('Sample data created successfully!');
    } catch (error: any) {
      console.error('Sample data error:', error);
      setSampleDataStatus(`Failed to create sample data: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">API Test & Setup</h1>
      
      <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Database Migration</h2>
        <p className="text-gray-600">
          Run this to add Lightspeed ID columns to your database tables.
        </p>
        
        <button
          onClick={runMigration}
          disabled={isRunning}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Migration...' : 'Run Migration'}
        </button>
        
        {migrationStatus && (
          <div className={`p-3 rounded-md ${migrationStatus.includes('failed') || migrationStatus.includes('error') 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'}`}>
            {migrationStatus}
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Sample Data</h2>
        <p className="text-gray-600">
          Create sample patients, medications, and doctors for testing.
        </p>
        
        <button
          onClick={createSampleData}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Create Sample Data
        </button>
        
        {sampleDataStatus && (
          <div className={`p-3 rounded-md ${sampleDataStatus.includes('Failed') 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'}`}>
            {sampleDataStatus}
          </div>
        )}
      </div>
    </div>
  );
} 