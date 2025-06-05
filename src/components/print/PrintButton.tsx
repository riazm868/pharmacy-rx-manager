'use client';

import React, { useState, useEffect } from 'react';
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
    medications: Array<{
      medication: Medication;
      prescriptionMedication: PrescriptionMedication;
    }>;
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
      
      // Fetch all prescription medications
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
      
      // Map the medications data
      const medications = prescriptionMedications.map(pm => ({
        medication: pm.medication,
        prescriptionMedication: {
          id: pm.id,
          prescription_id: pm.prescription_id,
          medication_id: pm.medication_id,
          dose: pm.dose,
          unit: pm.unit,
          frequency: pm.frequency,
          days: pm.days,
          quantity: pm.quantity,
          refills: pm.refills,
          route: pm.route,
          notes: pm.notes,
          created_at: pm.created_at,
          updated_at: pm.updated_at
        }
      }));
      
      setPrescriptionData({
        prescription,
        patient: prescription.patient,
        doctor: prescription.doctor,
        medications
      });
      
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching prescription data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prescription data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePrintClick}
        disabled={isLoading}
        className={className || "inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"}
        title="Print prescription labels"
      >
        {isLoading ? 'Loading...' : 'Print'}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm mt-1">{error}</div>
      )}
      
      {prescriptionData && (
        <PrintLabelModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          prescription={prescriptionData.prescription}
          patient={prescriptionData.patient}
          doctor={prescriptionData.doctor}
          medications={prescriptionData.medications}
        />
      )}
    </>
  );
};

export default PrintButton;
