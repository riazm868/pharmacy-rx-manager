import React, { useState } from 'react';
import { Prescription, Patient, Doctor, Medication, PrescriptionMedication } from '@/types/database';
import PrintLabelModal from '../modals/PrintLabelModal';
import { supabase } from '@/lib/supabase';

interface PrintButtonProps {
  prescriptionId: string;
  className?: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({ prescriptionId, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<{
    prescription: Prescription;
    patient: Patient;
    doctor: Doctor;
    medication: Medication;
    prescriptionMedication: PrescriptionMedication;
  } | null>(null);

  const handlePrintClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch prescription details
      const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patient_id(*),
          doctor:doctor_id(*)
        `)
        .eq('id', prescriptionId)
        .single();
      
      if (prescriptionError) throw prescriptionError;
      
      // Fetch prescription medications
      const { data: prescriptionMedications, error: medicationsError } = await supabase
        .from('prescription_medications')
        .select(`
          *,
          medication:medication_id(*)
        `)
        .eq('prescription_id', prescriptionId);
      
      if (medicationsError) throw medicationsError;
      
      if (!prescriptionMedications || prescriptionMedications.length === 0) {
        throw new Error('No medications found for this prescription');
      }
      
      // Use the first medication for printing
      const firstMedication = prescriptionMedications[0];
      
      setPrescriptionData({
        prescription,
        patient: prescription.patient,
        doctor: prescription.doctor,
        medication: firstMedication.medication,
        prescriptionMedication: firstMedication
      });
      
      setIsModalOpen(true);
    } catch (err: any) {
      console.error('Error fetching prescription details for printing:', err);
      setError(err.message || 'Failed to load prescription details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePrintClick}
        className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${className || ''}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        )}
        Print Label
      </button>
      
      {prescriptionData && (
        <PrintLabelModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          prescription={prescriptionData.prescription}
          patient={prescriptionData.patient}
          doctor={prescriptionData.doctor}
          medication={prescriptionData.medication}
          prescriptionMedication={prescriptionData.prescriptionMedication}
        />
      )}
      
      {error && (
        <div className="text-xs text-red-600 mt-1">
          {error}
        </div>
      )}
    </>
  );
};

export default PrintButton;
