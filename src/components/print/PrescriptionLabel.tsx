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
      const { dose, frequency, days } = prescriptionMedication;
      return `TAKE ${dose} ${prescriptionMedication.unit.toUpperCase()} BY MOUTH ${frequency.toUpperCase()} AS NEEDED FOR PAIN`;
    };

    // Generate a prescription number from the prescription ID
    const rxNumber = `${prescription.id.substring(0, 7)}-${prescription.id.substring(7, 12)}`.toUpperCase();
    
    // Format the expiration date (1 year from prescription date)
    const expirationDate = new Date(prescription.date);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    return (
      <table 
        ref={ref} 
        className="prescription-label"
        style={{
          width: '3in',
          height: '2in',
          fontFamily: 'Arial, sans-serif',
          fontSize: '10pt',
          borderCollapse: 'collapse',
          border: '1px solid #ddd',
          tableLayout: 'fixed',
          pageBreakInside: 'avoid',
          backgroundColor: 'white'
        }}
      >
        {/* Header Row: Patient Name and Date */}
        <tbody>
          <tr>
            <td style={{ padding: '0.1in', fontWeight: 'bold', fontSize: '14pt', width: '60%' }}>
              {patient.name.split(' ')[0].toUpperCase()}
            </td>
            <td style={{ padding: '0.1in', textAlign: 'right', fontSize: '10pt', width: '40%' }}>
              DATE: {format(new Date(prescription.date), 'MM/dd/yy')}
            </td>
          </tr>
          
          {/* Main Content Row with Red Border */}
          <tr>
            <td colSpan={2} style={{ padding: 0 }}>
              <table style={{ 
                width: '100%', 
                height: '1.6in',
                borderCollapse: 'collapse',
                border: '1px solid #ff0000',
                tableLayout: 'fixed'
              }}>
                <tbody>
                  {/* RX Number and Strength Row */}
                  <tr>
                    <td style={{ 
                      padding: '0.05in',
                      backgroundColor: '#ffff00',
                      width: '60%',
                      height: '0.3in'
                    }}>
                      <span style={{ fontSize: '10pt' }}>RX </span>
                      <span style={{ fontWeight: 'bold', fontSize: '12pt' }}>{rxNumber}</span>
                    </td>
                    <td style={{ 
                      padding: '0.05in',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      fontSize: '12pt',
                      width: '40%',
                      height: '0.3in'
                    }}>
                      {medication.strength || 'N/A'}
                    </td>
                  </tr>
                  
                  {/* Medication Instructions Row */}
                  <tr>
                    <td colSpan={2} style={{ 
                      padding: '0.1in',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '11pt',
                      height: '0.5in',
                      verticalAlign: 'middle'
                    }}>
                      {formatSig()}
                    </td>
                  </tr>
                  
                  {/* Quantity and Expiration Row */}
                  <tr>
                    <td colSpan={2} style={{ 
                      padding: '0.05in 0.1in',
                      fontSize: '10pt',
                      height: '0.3in'
                    }}>
                      QTY <span style={{ fontWeight: 'bold' }}>{prescriptionMedication.quantity}</span>
                      <span style={{ marginLeft: '0.3in' }}>
                        USE BEFORE {format(expirationDate, 'MM/dd/yy')}
                      </span>
                    </td>
                  </tr>
                  
                  {/* Refills Row */}
                  <tr>
                    <td colSpan={2} style={{ 
                      padding: '0.05in 0.1in',
                      fontSize: '10pt',
                      height: '0.2in'
                    }}>
                      {prescriptionMedication.refills > 0 
                        ? `REFILLS: ${prescriptionMedication.refills}` 
                        : 'NO REFILLS. DR. AUTH REQUIRED'}
                    </td>
                  </tr>
                  
                  {/* Pharmacy Name and Phone Row */}
                  <tr>
                    <td style={{ 
                      padding: '0.05in 0.1in',
                      color: '#ff0000',
                      fontWeight: 'bold',
                      fontSize: '14pt',
                      height: '0.3in',
                      verticalAlign: 'bottom'
                    }}>
                      {pharmacyName}
                    </td>
                    <td style={{ 
                      padding: '0.05in 0.1in',
                      textAlign: 'right',
                      fontSize: '9pt',
                      height: '0.3in',
                      verticalAlign: 'bottom'
                    }}>
                      {pharmacyPhone}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
);

PrescriptionLabel.displayName = 'PrescriptionLabel';

export default PrescriptionLabel;
