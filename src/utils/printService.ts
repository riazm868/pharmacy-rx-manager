/**
 * Print service utility for handling prescription label printing
 * Specifically designed for Zebra GK420D printer via Windows print server
 */

// Configuration for the Windows print server
const PRINT_SERVER_CONFIG = {
  // Default URL - will be overridden by localStorage if available
  url: 'http://192.168.30.106:5000',  // Updated to match the running print server
  endpoints: {
    status: '/status',
    printers: '/printers',
    print: '/print'
  }
};

// Initialize the print server URL from localStorage if available
if (typeof window !== 'undefined' && window.localStorage) {
  const savedUrl = localStorage.getItem('zebra_print_server_url');
  if (savedUrl) {
    PRINT_SERVER_CONFIG.url = savedUrl;
  }
}

/**
 * Set the print server URL
 * @param url The URL of the print server (e.g., http://192.168.1.100:5000)
 */
export const setPrintServerUrl = (url: string): void => {
  if (url) {
    PRINT_SERVER_CONFIG.url = url;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('zebra_print_server_url', url);
    }
  }
};

/**
 * Get the current print server URL
 * @returns string The current print server URL
 */
export const getPrintServerUrl = (): string => {
  return PRINT_SERVER_CONFIG.url;
};

/**
 * Check if the print server is online
 * @returns Promise<boolean> True if the server is online, false otherwise
 */
export const checkPrintServerStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${PRINT_SERVER_CONFIG.url}${PRINT_SERVER_CONFIG.endpoints.status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout to prevent long waits
      signal: AbortSignal.timeout(5000), // 5 second timeout
      mode: 'cors', // Enable CORS
      credentials: 'omit' // Don't send cookies
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    const data = await response.json();
    return data.status === 'online';
  } catch (error) {
    console.error('Error checking print server status:', error);
    return false;
  }
};

/**
 * Get a list of available printers from the print server
 * @returns Promise<string[]> Array of printer names
 */
export const getAvailablePrinters = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${PRINT_SERVER_CONFIG.url}${PRINT_SERVER_CONFIG.endpoints.printers}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout to prevent long waits
      signal: AbortSignal.timeout(5000), // 5 second timeout
      mode: 'cors', // Enable CORS
      credentials: 'omit' // Don't send cookies
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    const data = await response.json();
    return data.printers || [];
  } catch (error) {
    console.error('Error getting available printers:', error);
    return [];
  }
};

/**
 * Generate ZPL (Zebra Programming Language) code for a prescription label
 * @param labelData Data for the prescription label
 * @returns string ZPL code
 */
const generateZPL = (labelData: any): string => {
  // Create a more structured and visually appealing label with ZPL
  return `^XA

^CF0,30
^FO50,50^FD${labelData.patientName}^FS

^CF0,24
^FO500,50^FDDATE: ${labelData.date}^FS

^FO50,120^GB700,300,3,1,0^FS

^CF0,28
^FO60,140^BY3^BCN,100,Y,N,N^FD${labelData.rxNumber}^FS

^CF0,30
^FO400,140^FD${labelData.strength}^FS

^CF0,28
^FO60,240^FD${labelData.sig}^FS

^CF0,24
^FO60,300^FDQTY: ${labelData.quantity} ${labelData.unit}^FS
^FO350,300^FDUSE BEFORE: ${labelData.expirationDate}^FS

^CF0,24
^FO60,340^FD${labelData.refills}^FS

^CF0,30
^FO60,400^FR^FD${labelData.pharmacyName}^FS

^CF0,20
^FO500,400^FD${labelData.pharmacyPhone}^FS

^XZ`;
};

/**
 * Send a print job to the Zebra GK420D printer via the Windows print server
 * @param labelData Data for the prescription label
 * @returns Promise<boolean> True if printing was successful, false otherwise
 */
export const printToZebra = async (labelData: any): Promise<boolean> => {
  try {
    // First check if the server is online
    const isServerOnline = await checkPrintServerStatus();
    if (!isServerOnline) {
      throw new Error('Print server is offline. Please check the connection.');
    }
    
    // Generate ZPL code for the label
    const zplCode = generateZPL(labelData);
    
    // Debug log
    console.log('Sending to print server:', {
      url: `${PRINT_SERVER_CONFIG.url}${PRINT_SERVER_CONFIG.endpoints.print}`,
      zplCode,
      printer: 'ZDesigner GK420d (Copy 1)'
    });
    
    // Send the ZPL code to the print server
    const response = await fetch(`${PRINT_SERVER_CONFIG.url}${PRINT_SERVER_CONFIG.endpoints.print}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zpl: zplCode,
        printer: 'ZDesigner GK420d (Copy 1)' // Updated to match the actual printer name detected on the Windows PC
      }),
      // Add a timeout to prevent long waits
      signal: AbortSignal.timeout(10000), // 10 second timeout for printing
      mode: 'cors', // Enable CORS
      credentials: 'omit' // Don't send cookies
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error printing to Zebra:', error);
    throw error; // Re-throw to allow the component to handle the error
  }
};

/**
 * Prepare label data from prescription information
 * @param prescription Prescription object
 * @param patient Patient object
 * @param doctor Doctor object
 * @param medication Medication object
 * @param prescriptionMedication PrescriptionMedication object
 * @param pharmacyInfo Pharmacy information object
 * @returns Object containing formatted label data
 */
export const prepareLabelData = (
  prescription: any,
  patient: any,
  doctor: any,
  medication: any,
  prescriptionMedication: any,
  pharmacyInfo: any
) => {
  // Format the expiration date (1 year from prescription date)
  const prescriptionDate = new Date(prescription.date);
  const expirationDate = new Date(prescription.date);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  
  // Format dates as MM/DD/YY
  const formatDate = (date: Date): string => {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };
  
  // Generate prescription number from ID
  const rxNumber = `${prescription.id.substring(0, 7)}-${prescription.id.substring(7, 12)}`.toUpperCase();
  
  // Format SIG (prescription instructions)
  const sig = `TAKE ${prescriptionMedication.dose} ${prescriptionMedication.unit.toUpperCase()} BY MOUTH ${prescriptionMedication.frequency.toUpperCase()} AS NEEDED FOR PAIN`;
  
  // Format refills text
  const refillsText = prescriptionMedication.refills > 0 
    ? `REFILLS: ${prescriptionMedication.refills}` 
    : 'NO REFILLS. DR. AUTH REQUIRED';
  
  return {
    patientName: patient.name.toUpperCase(),
    patientAddress: `${patient.address}, ${patient.city}, ${patient.state} ${patient.zip}`,
    date: formatDate(prescriptionDate),
    medicationName: medication.name.toUpperCase(),
    strength: medication.strength,
    manufacturer: medication.manufacturer || 'GENERIC',
    sig,
    rxNumber,
    quantity: prescriptionMedication.quantity,
    unit: prescriptionMedication.unit,
    expirationDate: formatDate(expirationDate),
    refills: refillsText,
    pharmacyName: pharmacyInfo.name,
    pharmacyAddress: pharmacyInfo.address,
    pharmacyPhone: pharmacyInfo.phone
  };
};

export default {
  printToZebra,
  prepareLabelData,
  checkPrintServerStatus,
  getAvailablePrinters,
  setPrintServerUrl,
  getPrintServerUrl
};
