'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Patient, Doctor, Medication, Prescription, PrescriptionMedication } from '@/types/database';
import PrescriptionForm from '@/components/forms/PrescriptionForm';
import MedicationAnalysis from '@/components/ai/MedicationAnalysis';
import { analyzePrescription, MedicationAnalysis as MedicationAnalysisType } from '@/services/aiService';
import { Brain } from 'lucide-react';

export default function NewPrescriptionPage() {
  console.log('Rendering NewPrescriptionPage');
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<MedicationAnalysisType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentMedications, setCurrentMedications] = useState<Array<{ name: string; dosage?: string }>>([]);

  // Search for patients
  const handleSearchPatient = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('name', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Error searching patients:', err);
    }
  };

  // Search for doctors
  const handleSearchDoctor = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,clinic_name.ilike.%${query}%`)
        .order('name', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      console.error('Error searching doctors:', err);
    }
  };

  // Search for medications
  const handleSearchMedication = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      setMedications(data || []);
    } catch (err) {
      console.error('Error searching medications:', err);
    }
  };

  // Add a new patient
  const handleAddPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error adding patient:', err);
      throw err;
    }
  };

  // Add a new doctor
  const handleAddDoctor = async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert(doctorData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error adding doctor:', err);
      throw err;
    }
  };

  // Add a new medication
  const handleAddMedication = async (medicationData: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Ensure strength field is set to 'N/A' if not provided
      const dataToInsert = {
        ...medicationData,
        strength: medicationData.strength || 'N/A'
      };
      
      const { data, error } = await supabase
        .from('medications')
        .insert(dataToInsert)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error adding medication:', err);
      throw err;
    }
  };

  // Handle AI analysis of medications
  const handleAnalyzeMedications = async () => {
    if (currentMedications.length === 0) {
      setAnalysisError('Please add medications to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const analysis = await analyzePrescription(currentMedications);
      setAiAnalysis(analysis);
    } catch (err: any) {
      console.error('Error analyzing medications:', err);
      setAnalysisError('Failed to analyze medications. AI service may be unavailable.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (
    prescriptionData: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>,
    medicationItems: Array<Omit<PrescriptionMedication, 'id' | 'prescription_id' | 'created_at' | 'updated_at'>>,
    callback?: (prescription: Prescription, medications: PrescriptionMedication[]) => void
  ) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create the prescription
      const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select()
        .single();
      
      if (prescriptionError) throw prescriptionError;
      
      // Add medications to the prescription
      let createdMedications: PrescriptionMedication[] = [];
      
      if (medicationItems.length > 0) {
        const prescriptionMedications = medicationItems.map(item => ({
          ...item,
          prescription_id: prescription.id
        }));
        
        const { data: medications, error: medicationsError } = await supabase
          .from('prescription_medications')
          .insert(prescriptionMedications)
          .select();
        
        if (medicationsError) throw medicationsError;
        
        if (medications) {
          createdMedications = medications;
        }
      }
      
      // Call the callback if provided (for printing)
      if (callback && typeof callback === 'function') {
        callback(prescription, createdMedications);
      } else {
        // Redirect to the prescription detail page if no callback
        router.push(`/prescriptions/${prescription.id}`);
      }
    } catch (err: any) {
      console.error('Error creating prescription:', err);
      setError(err.message || 'Failed to create prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('Rendering NewPrescriptionPage return');
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Prescription</h1>
        <Link
          href="/prescriptions"
          className="text-indigo-600 hover:text-indigo-900"
        >
          Back to Prescriptions
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <PrescriptionForm
                onSubmit={handleSubmit}
                onCancel={() => router.push('/prescriptions')}
                patients={patients}
                doctors={doctors}
                medications={medications}
                onSearchPatient={handleSearchPatient}
                onSearchDoctor={handleSearchDoctor}
                onSearchMedication={handleSearchMedication}
                onAddPatient={handleAddPatient}
                onAddDoctor={handleAddDoctor}
                onAddMedication={handleAddMedication}
                isSubmitting={isSubmitting}
                onMedicationsChange={(meds: any[]) => {
                  setCurrentMedications(meds.filter((m: any) => m.medication).map((m: any) => ({
                    name: m.medication!.name,
                    dosage: m.dose
                  })));
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Analysis Panel - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Brain className="h-5 w-5 mr-2 text-indigo-600" />
                AI Analysis
              </h3>
              <button
                onClick={handleAnalyzeMedications}
                disabled={isAnalyzing || currentMedications.length === 0}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            
            {currentMedications.length === 0 ? (
              <p className="text-gray-500 text-sm">Add medications to enable AI analysis</p>
            ) : (
              <MedicationAnalysis
                analysis={aiAnalysis}
                isLoading={isAnalyzing}
                error={analysisError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
