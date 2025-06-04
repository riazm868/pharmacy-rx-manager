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
  medication: Medication;
  prescriptionMedication: PrescriptionMedication;
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
  medication,
  prescriptionMedication,
  onClose
}) => {
  const labelRef = useRef<HTMLTableElement>(null);
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
        console.error('Error checking print server status:', error);
        setServerStatus('offline');
      }
    };
    
    // Initial check
    checkServer();
    
    // Set up periodic checking every 10 seconds
    const intervalId = setInterval(checkServer, 10000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handler for Zebra printer
  const handlePrintToZebra = async () => {
    try {
      setIsPrinting(true);
      setPrintResult(null);
      
      // Prepare label data for Zebra printer
      const labelData = prepareLabelData(
        prescription,
        patient,
        doctor,
        medication,
        prescriptionMedication,
        PHARMACY_INFO
      );
      
      // Send to Zebra printer
      const success = await printToZebra(labelData);
      
      if (success) {
        setPrintResult({
          success: true,
          message: 'Successfully sent to Zebra GK420D printer'
        });
        console.log('Successfully sent to Zebra GK420D printer');
      } else {
        setPrintResult({
          success: false,
          message: 'Failed to print to Zebra GK420D printer. Check printer connection.'
        });
        console.error('Failed to print to Zebra GK420D printer');
      }
    } catch (error: any) {
      setPrintResult({
        success: false,
        message: `Error: ${error.message || 'Unknown error occurred'}`
      });
      console.error('Error in printing to Zebra:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="print-prescription-container">
      {/* Hidden label for printing */}
      <div style={{ display: 'none' }}>
        <PrescriptionLabel
          ref={labelRef}
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
      
      {/* Preview */}
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4">Prescription Label Preview</h2>
        
        <div className="mb-4" style={{ 
          width: '3.2in', 
          height: '2.2in', 
          margin: '0 auto', 
          padding: '0.1in', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
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
        
        {printResult && (
          <div className={`mt-4 p-3 rounded-md ${printResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-center">
              {printResult.success ? (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{printResult.message}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-4">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Configure Printer
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Print (Browser)
            </button>
            
            <button
              type="button"
              onClick={handlePrintToZebra}
              disabled={isPrinting || serverStatus !== 'online'}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
              title={serverStatus !== 'online' ? 'Zebra printer is offline. Check connection.' : 'Print to Zebra GK420D thermal printer'}
            >
              {isPrinting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Printing...
                </>
              ) : (
                <>
                  <span className={`h-2 w-2 rounded-full mr-2 ${serverStatus === 'online' ? 'bg-green-300' : 'bg-red-400'}`}></span>
                  Print to Zebra {serverStatus !== 'online' && '(Offline)'}
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Print Server Configuration Modal */}
        <PrintServerConfigModal 
          isOpen={showConfigModal} 
          onClose={() => {
            setShowConfigModal(false);
            // Recheck server status after configuration
            checkPrintServerStatus().then(isOnline => {
              setServerStatus(isOnline ? 'online' : 'offline');
            });
          }} 
        />
      </div>
    </div>
  );
};

export default PrintPrescriptionLabel;
