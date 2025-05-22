import { format } from 'date-fns';
import { Prescription, PrescriptionMedication, Patient, Doctor, Medication } from '@/types/database';

/**
 * Formats a date string to a human-readable format (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Formats prescription data for display
 */
export function formatPrescriptionData(
  prescription: Prescription,
  patient?: Patient,
  doctor?: Doctor
): {
  id: string;
  rxNumber: string;
  patientName: string;
  doctorName: string;
  date: string;
  notes: string;
} {
  return {
    id: prescription.id,
    rxNumber: prescription.rx_number,
    patientName: patient?.name || 'Unknown Patient',
    doctorName: doctor?.name || 'Unknown Doctor',
    date: formatDate(prescription.prescription_date),
    notes: prescription.notes || '',
  };
}

/**
 * Formats prescription medication data for display
 */
export function formatPrescriptionMedicationData(
  prescriptionMedication: PrescriptionMedication,
  medication?: Medication
): {
  id: string;
  medicationName: string;
  dosage: string;
  quantity: number;
} {
  return {
    id: prescriptionMedication.id,
    medicationName: medication?.name || 'Unknown Medication',
    dosage: prescriptionMedication.dosage,
    quantity: prescriptionMedication.quantity,
  };
}
