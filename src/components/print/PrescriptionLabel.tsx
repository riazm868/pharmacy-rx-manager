import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { Prescription, Patient, Doctor, Medication, PrescriptionMedication } from '@/types/database';

interface PrescriptionLabelProps {
  prescription: Prescription;
  patient: Patient;
  doctor: Doctor;
  medication: Medication;
  prescriptionMedication: PrescriptionMedication;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
}

// Route abbreviation mappings
const routeMap: { [key: string]: string } = {
  'PO': 'BY MOUTH',
  'IM': 'INTRAMUSCULAR',
  'IV': 'INTRAVENOUS',
  'SC': 'SUBCUTANEOUS',
  'SL': 'SUBLINGUAL',
  'PR': 'RECTALLY',
  'TOP': 'TOPICALLY',
  'INH': 'BY INHALATION',
  'NASAL': 'NASALLY',
  'OPTH': 'IN THE EYE',
  'OTIC': 'IN THE EAR'
};

// This component is designed for a 3-inch by 2-inch label
const PrescriptionLabel = forwardRef<HTMLTableElement, PrescriptionLabelProps>(
  ({ prescription, patient, doctor, medication, prescriptionMedication, pharmacyName, pharmacyAddress, pharmacyPhone }, ref) => {
    // Format the prescription instructions (SIG)
    const formatSig = () => {
      const { dose, frequency, days, route, unit } = prescriptionMedication;
      
      // Parse dose to check if it's singular or plural
      const doseNum = parseFloat(dose);
      const isPlural = doseNum > 1;
      
      // Determine the unit text (singular vs plural)
      let unitText = unit.toUpperCase();
      if (unitText === 'TABLETS' && !isPlural) {
        unitText = 'TABLET';
      } else if (unitText === 'TABLET' && isPlural) {
        unitText = 'TABLETS';
      } else if (unitText === 'CAPSULES' && !isPlural) {
        unitText = 'CAPSULE';
      } else if (unitText === 'CAPSULE' && isPlural) {
        unitText = 'CAPSULES';
      }
      
      // Check if we have all the necessary information
      if (dose && frequency) {
        let sig = `TAKE ${dose} ${unitText}`;
        
        // Add route - convert abbreviations to full text
        if (route) {
          const fullRoute = routeMap[route.toUpperCase()] || route.toUpperCase();
          sig += ` ${fullRoute}`;
        } else {
          sig += ` BY MOUTH`;
        }
        
        // Add frequency
        sig += ` ${frequency.toUpperCase()}`;
        
        // Add duration if available
        if (days > 0) {
          sig += ` FOR ${days} DAYS`;
        }
        
        return sig;
      } else {
        return `TAKE AS DIRECTED BY YOUR DOCTOR`;
      }
    };

    // Generate a prescription number from the prescription ID
    const rxNumber = prescription.prescription_number || `${prescription.id.substring(0, 7)}-${prescription.id.substring(7, 12)}`.toUpperCase();
    
    // Format dates as dd/mm/yy
    const formatDateDDMMYY = (date: Date): string => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    };

    return (
      <table 
        ref={ref} 
        className="prescription-label"
        style={{
          width: '3in',
          height: '2in',
          fontFamily: 'Arial, sans-serif',
          fontSize: '11pt',
          borderCollapse: 'collapse',
          border: '2px solid #000',
          tableLayout: 'fixed',
          pageBreakInside: 'avoid',
          backgroundColor: 'white',
          color: '#000',
          fontWeight: '500'
        }}
      >
        <tbody>
          {/* Header Row: Patient Name and Date */}
          <tr>
            <td style={{ 
              padding: '0.08in 0.1in', 
              fontWeight: 'bold', 
              fontSize: '15pt', 
              width: '60%',
              borderBottom: '1px solid #000',
              color: '#000'
            }}>
              {patient.name.toUpperCase()}
            </td>
            <td style={{ 
              padding: '0.08in 0.1in', 
              textAlign: 'right', 
              fontSize: '11pt', 
              width: '40%',
              borderBottom: '1px solid #000',
              fontWeight: '600'
            }}>
              DATE: {formatDateDDMMYY(new Date(prescription.date))}
            </td>
          </tr>
          
          {/* RX Number and Strength Row */}
          <tr>
            <td style={{ 
              padding: '0.05in 0.1in',
              fontSize: '12pt',
              borderBottom: '1px solid #000',
              fontWeight: '600'
            }}>
              <span style={{ fontWeight: 'bold' }}>Rx: </span>
              <span>{rxNumber}</span>
            </td>
            <td style={{ 
              padding: '0.05in 0.1in',
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: '12pt',
              borderBottom: '1px solid #000'
            }}>
              {medication.strength !== 'N/A' ? medication.strength : ''}
            </td>
          </tr>
          
          {/* Doctor Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              fontSize: '12pt',
              borderBottom: '1px solid #000',
              fontWeight: '600'
            }}>
              <span style={{ fontWeight: 'bold' }}>Dr. </span>
              <span>{doctor.name}</span>
            </td>
          </tr>
          
          {/* Medication Name Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.08in 0.1in',
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '14pt',
              color: '#000'
            }}>
              {medication.name.toUpperCase()} {medication.strength !== 'N/A' ? medication.strength : ''}
            </td>
          </tr>
          
          {/* Medication Instructions Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.1in 0.1in',
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '14pt',
              borderBottom: '1px solid #000',
              lineHeight: '1.2',
              color: '#000'
            }}>
              {formatSig()}
            </td>
          </tr>
          
          {/* Quantity Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              fontSize: '11pt',
              fontWeight: '600'
            }}>
              <span style={{ fontWeight: 'bold' }}>QTY: </span>
              <span>{prescriptionMedication.quantity} {prescriptionMedication.unit}</span>
            </td>
          </tr>
          
          {/* Refills Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              fontSize: '11pt',
              borderBottom: '1px solid #000',
              fontWeight: '600'
            }}>
              {prescriptionMedication.refills > 0 
                ? `${prescriptionMedication.refills} REFILLS` 
                : 'NO REFILLS'}
            </td>
          </tr>
          
          {/* Pharmacy Name Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              fontWeight: 'bold',
              fontSize: '13pt',
              color: '#000'
            }}>
              {pharmacyName}
            </td>
          </tr>
          
          {/* Pharmacy Address Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.02in 0.1in',
              fontSize: '10pt',
              fontWeight: '500'
            }}>
              {pharmacyAddress}
            </td>
          </tr>
          
          {/* Pharmacy Phone Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.02in 0.1in',
              fontSize: '10pt',
              fontWeight: '500'
            }}>
              Tel: {pharmacyPhone}
            </td>
          </tr>
          
          {/* Pharmacist Signature Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              fontSize: '10pt',
              borderTop: '1px solid #000',
              fontWeight: '500'
            }}>
              Pharmacist: _______________________
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
);

PrescriptionLabel.displayName = 'PrescriptionLabel';

export default PrescriptionLabel;
