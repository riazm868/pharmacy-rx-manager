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

// This component is designed for a 3-inch by 2-inch label
const PrescriptionLabel = forwardRef<HTMLTableElement, PrescriptionLabelProps>(
  ({ prescription, patient, doctor, medication, prescriptionMedication, pharmacyName, pharmacyAddress, pharmacyPhone }, ref) => {
    // Format the prescription instructions (SIG)
    const formatSig = () => {
      const { dose, frequency, days, route } = prescriptionMedication;
      
      // Check if we have all the necessary information
      if (dose && frequency) {
        let sig = `TAKE ${dose} ${prescriptionMedication.unit.toUpperCase()}`;
        
        // Add route if available
        if (route) {
          sig += ` ${route.toUpperCase()}`;
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
    const rxNumber = `${prescription.id.substring(0, 7)}-${prescription.id.substring(7, 12)}`.toUpperCase();
    
    // Format the expiration date (1 year from prescription date)
    const expirationDate = new Date(prescription.date);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
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
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: '10pt',
          borderCollapse: 'collapse',
          border: '2px solid #000',
          tableLayout: 'fixed',
          pageBreakInside: 'avoid',
          backgroundColor: 'white'
        }}
      >
        <tbody>
          {/* Header Row: Patient Name and Date */}
          <tr>
            <td style={{ 
              padding: '0.08in 0.1in', 
              fontWeight: 'bold', 
              fontSize: '14pt', 
              width: '60%',
              borderBottom: '1px solid #000'
            }}>
              {patient.name.toUpperCase()}
            </td>
            <td style={{ 
              padding: '0.08in 0.1in', 
              textAlign: 'right', 
              fontSize: '10pt', 
              width: '40%',
              borderBottom: '1px solid #000'
            }}>
              DATE: {formatDateDDMMYY(new Date(prescription.date))}
            </td>
          </tr>
          
          {/* RX Number and Strength Row */}
          <tr>
            <td style={{ 
              padding: '0.05in 0.1in',
              fontSize: '11pt',
              borderBottom: '1px solid #000'
            }}>
              <span style={{ fontWeight: 'bold' }}>Rx: </span>
              <span>{rxNumber}</span>
            </td>
            <td style={{ 
              padding: '0.05in 0.1in',
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: '11pt',
              borderBottom: '1px solid #000'
            }}>
              {medication.strength || 'N/A'}
            </td>
          </tr>
          
          {/* Doctor Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              fontSize: '11pt',
              borderBottom: '1px solid #000'
            }}>
              <span style={{ fontWeight: 'bold' }}>Dr. </span>
              <span>{doctor.name}</span>
            </td>
          </tr>
          
          {/* Medication Name Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '12pt',
            }}>
              {medication.name.toUpperCase()}
            </td>
          </tr>
          
          {/* Medication Instructions Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.08in 0.1in',
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '13pt',
              borderBottom: '1px solid #000'
            }}>
              {formatSig()}
            </td>
          </tr>
          
          {/* Quantity and Expiration Row */}
          <tr>
            <td style={{ 
              padding: '0.05in 0.1in',
              fontSize: '10pt',
            }}>
              <span style={{ fontWeight: 'bold' }}>QTY: </span>
              <span>{prescriptionMedication.quantity} {prescriptionMedication.unit}</span>
            </td>
            <td style={{ 
              padding: '0.05in 0.1in',
              textAlign: 'right',
              fontSize: '10pt',
            }}>
              {formatDateDDMMYY(expirationDate)}
            </td>
          </tr>
          
          {/* Refills Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              fontSize: '10pt',
              borderBottom: '1px solid #000'
            }}>
              {prescriptionMedication.refills > 0 
                ? `REFILLS: ${prescriptionMedication.refills}` 
                : 'NO REFILLS. DR. AUTH REQUIRED'}
            </td>
          </tr>
          
          {/* Pharmacy Name Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              fontWeight: 'bold',
              fontSize: '12pt',
            }}>
              {pharmacyName}
            </td>
          </tr>
          
          {/* Pharmacy Address Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.03in 0.1in',
              fontSize: '10pt',
            }}>
              72 Aranguez Main Rd, San Juan
            </td>
          </tr>
          
          {/* Pharmacy Contact Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.03in 0.1in',
              fontSize: '10pt',
              borderBottom: '1px solid #000'
            }}>
              Tel: 638-2889  Whatsapp: 352-2676
            </td>
          </tr>
          
          {/* Pharmacist Signature Row */}
          <tr>
            <td colSpan={2} style={{ 
              padding: '0.05in 0.1in',
              fontSize: '10pt',
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
