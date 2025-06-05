import React from 'react';
import { Dialog } from '@headlessui/react';
import PrintPrescriptionLabel from '../print/PrintPrescriptionLabel';
import { Prescription, Patient, Doctor, Medication, PrescriptionMedication } from '@/types/database';

interface PrintLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription;
  patient: Patient;
  doctor: Doctor;
  medications: Array<{
    medication: Medication;
    prescriptionMedication: PrescriptionMedication;
  }>;
}

const PrintLabelModal: React.FC<PrintLabelModalProps> = ({
  isOpen,
  onClose,
  prescription,
  patient,
  doctor,
  medications
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Full-screen container for centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl rounded bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Print Prescription Labels ({medications.length} medication{medications.length !== 1 ? 's' : ''})
          </Dialog.Title>
          
          <PrintPrescriptionLabel
            prescription={prescription}
            patient={patient}
            doctor={doctor}
            medications={medications}
            onClose={onClose}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PrintLabelModal;
