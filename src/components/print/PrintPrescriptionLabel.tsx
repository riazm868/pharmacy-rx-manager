import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrescriptionLabel from './PrescriptionLabel';
import { Prescription, Patient, Doctor, Medication, PrescriptionMedication } from '@/types/database';
import { prepareLabelData, printToZebra, checkPrintServerStatus } from '@/utils/printService';
import PrintServerConfigModal from '../modals/PrintServerConfigModal';

interface PrintPrescriptionLabelProps {
  prescription: Prescription;
  patient: Patient;
  doctor: Doctor;
  medications: Array<{
    medication: Medication;
    prescriptionMedication: PrescriptionMedication;
  }>;
  onClose: () => void;
}

const PHARMACY_INFO = {
  name: 'Personal Care Pharmacy Ltd',
  address: '72 Aranguez Main Rd, San Juan',
  phone: 'Tel: 638-2889  Whatsapp: 352-2676'
};

const PrintPrescriptionLabel: React.FC<PrintPrescriptionLabelProps> = ({
  prescription,
  patient,
  doctor,
  medications,
  onClose
}) => {
  const labelRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printResult, setPrintResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  // Handler for browser printing
  const handlePrint = useReactToPrint({
    documentTitle: `Prescription_${prescription.id}`,
    onAfterPrint: () => {
      console.log('Print completed');
    },
    // Use the contentRef prop instead of content
    contentRef: labelRef,
  });

  // Check print server status on component mount and periodically
  React.useEffect(() => {
    const checkServer = async () => {
      try {
        const isOnline = await checkPrintServerStatus();
        setServerStatus(isOnline ? 'online' : 'offline');
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Handler for Zebra printing
  const handleZebraPrint = async () => {
    setIsPrinting(true);
    setPrintResult(null);

    try {
      // Print each medication on a separate label
      let successCount = 0;
      for (const { medication, prescriptionMedication } of medications) {
        const labelData = prepareLabelData(
          prescription,
          patient,
          doctor,
          medication,
          prescriptionMedication,
          PHARMACY_INFO
        );

        const success = await printToZebra(labelData);
        
        if (!success) {
          setPrintResult({
            success: false,
            message: `Failed to print label ${successCount + 1} of ${medications.length}`
          });
          break;
        }
        successCount++;
      }
      
      if (successCount === medications.length) {
        setPrintResult({ success: true, message: `Successfully printed ${medications.length} label(s)` });
      }
    } catch (error) {
      console.error('Print error:', error);
      setPrintResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Print Preview - Multiple Labels */}
      <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
        <div ref={labelRef}>
          {medications.map(({ medication, prescriptionMedication }, index) => (
            <div key={prescriptionMedication.id} style={{ pageBreakAfter: index < medications.length - 1 ? 'always' : 'auto' }}>
              <PrescriptionLabel
                prescription={prescription}
                patient={patient}
                doctor={doctor}
                medication={medication}
                prescriptionMedication={prescriptionMedication}
                pharmacyName={PHARMACY_INFO.name}
                pharmacyAddress={PHARMACY_INFO.address}
                pharmacyPhone={PHARMACY_INFO.phone}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Print Server Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Print Server:</span>
          <span className={`flex items-center ${
            serverStatus === 'online' ? 'text-green-600' : 
            serverStatus === 'offline' ? 'text-red-600' : 'text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${
              serverStatus === 'online' ? 'bg-green-600' : 
              serverStatus === 'offline' ? 'bg-red-600' : 'bg-gray-400'
            }`} />
            {serverStatus === 'online' ? 'Online' : 
             serverStatus === 'offline' ? 'Offline' : 'Checking...'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="text-indigo-600 hover:text-indigo-500"
        >
          Configure
        </button>
      </div>

      {/* Print Result Message */}
      {printResult && (
        <div className={`p-3 rounded-md ${
          printResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p className="text-sm">{printResult.message}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Print (Browser)
        </button>
        
        <button
          type="button"
          onClick={handleZebraPrint}
          disabled={isPrinting || serverStatus !== 'online'}
          className={`flex-1 px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isPrinting || serverStatus !== 'online'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          {isPrinting ? 'Printing...' : 'Print (Zebra)'}
        </button>
        
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>

      {/* Print Server Config Modal */}
      {showConfigModal && (
        <PrintServerConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
};

export default PrintPrescriptionLabel;
