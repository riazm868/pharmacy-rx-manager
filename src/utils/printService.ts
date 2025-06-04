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
  },
  // Default printer - will be overridden by localStorage if available
  selectedPrinter: 'ZDesigner GK420d (Copy 1)'
};

// Initialize the print server URL and selected printer from localStorage if available
if (typeof window !== 'undefined' && window.localStorage) {
  const savedUrl = localStorage.getItem('zebra_print_server_url');
  if (savedUrl) {
    PRINT_SERVER_CONFIG.url = savedUrl;
  }
  
  const savedPrinter = localStorage.getItem('zebra_selected_printer');
  if (savedPrinter) {
    PRINT_SERVER_CONFIG.selectedPrinter = savedPrinter;
  }
}

/**
 * Normalize URL to ensure it uses HTTP protocol
 * @param url The URL to normalize
 * @returns The normalized URL with HTTP protocol
 */
export const normalizeUrl = (url: string): string => {
  if (!url) return url;
  
  // Replace https:// with http://
  if (url.toLowerCase().startsWith('https://')) {
    return url.replace(/^https:\/\//i, 'http://');
  }
  
  // Add http:// if no protocol is specified
  if (!url.toLowerCase().startsWith('http://')) {
    return `http://${url}`;
  }
  
  return url;
};

/**
 * Set the print server URL
 * @param url The URL of the print server (e.g., http://192.168.1.100:5000)
 */
export const setPrintServerUrl = (url: string): void => {
  if (url) {
    // Normalize URL to ensure HTTP protocol
    const normalizedUrl = normalizeUrl(url);
    PRINT_SERVER_CONFIG.url = normalizedUrl;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('zebra_print_server_url', normalizedUrl);
    }
  }
};

/**
 * Get the current print server URL
 * @returns string The current print server URL
 */
export const getPrintServerUrl = (): string => {
  // Ensure the URL uses HTTP protocol
  return normalizeUrl(PRINT_SERVER_CONFIG.url);
};

/**
 * Set the selected printer
 * @param printerName The name of the printer to use
 */
export const setSelectedPrinter = (printerName: string): void => {
  if (printerName) {
    PRINT_SERVER_CONFIG.selectedPrinter = printerName;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('zebra_selected_printer', printerName);
    }
  }
};

/**
 * Get the currently selected printer
 * @returns string The name of the selected printer
 */
export const getSelectedPrinter = (): string => {
  return PRINT_SERVER_CONFIG.selectedPrinter;
};

/**
 * Check if the print server is online
 * @returns Promise<boolean> True if the server is online, false otherwise
 */
export const checkPrintServerStatus = async (): Promise<boolean> => {
  try {
    // Ensure the URL uses HTTP protocol
    const url = normalizeUrl(PRINT_SERVER_CONFIG.url);
    const response = await fetch(`${url}${PRINT_SERVER_CONFIG.endpoints.status}`, {
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
    // Ensure the URL uses HTTP protocol
    const url = normalizeUrl(PRINT_SERVER_CONFIG.url);
    const response = await fetch(`${url}${PRINT_SERVER_CONFIG.endpoints.printers}`, {
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
  // Optimized for 3" x 2" thermal label on Zebra GK420d printer
  // Adjusted to start from the left edge of the label with Zebra Font D
  
  // Format date as dd/mm/yy
  const formatDateDDMMYY = (dateStr: string): string => {
    // If no date provided, use today's date
    if (!dateStr) {
      const today = new Date();
      return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;
    }
    
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // If invalid, use today's date
        const today = new Date();
        return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;
      }
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      // If error, use today's date
      const today = new Date();
      return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;
    }
  };
  
  const formattedDate = formatDateDDMMYY(labelData.date);
  
  // Process instructions for multi-line support
  const processInstructions = (sig: string): { line1: string; line2: string; needsTwoLines: boolean } => {
    if (!sig) return { line1: '', line2: '', needsTwoLines: false };
    
    if (sig.length <= 25) { // Reduced character limit to ensure better word wrapping
      return { line1: sig, line2: '', needsTwoLines: false };
    }
    
    // Try to find a good breaking point around the middle of the string
    const midPoint = Math.floor(sig.length / 2);
    let breakPoint = sig.indexOf(' ', midPoint);
    
    // If no space found after midpoint, try to find one before midpoint
    if (breakPoint === -1) {
      breakPoint = sig.lastIndexOf(' ', midPoint);
    }
    
    // If still no good breaking point, just split at character 25
    if (breakPoint === -1) {
      return {
        line1: sig.substring(0, 25),
        line2: sig.substring(25),
        needsTwoLines: true
      };
    }
    
    // Split at the found breaking point
    return {
      line1: sig.substring(0, breakPoint),
      line2: sig.substring(breakPoint + 1), // +1 to skip the space
      needsTwoLines: true
    };
  };
  
  // Process the instructions
  const instructionInfo = processInstructions(labelData.sig);
  
  // Build the ZPL code based on whether we have one or two lines of instructions
  let zpl = `^XA
^PW609
^LL406
^LS0
^LH0,0

^FO10,20^GB589,380,2^FS

^ADN,30,15
^FO20,40^FD${labelData.patientName}^FS

^ADN,24,12
^FO400,45^FDDATE: ${formattedDate}^FS

^ADN,26,13
^FO20,70^FDRx: ${labelData.rxNumber}^FS
^ADN,26,13
^FO300,70^FDDr. ${labelData.doctor?.name ? labelData.doctor.name.toUpperCase() : ''}^FS

^FO20,90^GB569,1,2^FS

^ACN,36,20
^FO20,105^FD${labelData.medicationName}^FS

^ADN,32,16
^FO20,150^FD${instructionInfo.line1}^FS
`;

  // Add second line of instructions if needed
  if (instructionInfo.needsTwoLines) {
    zpl += `^ADN,32,16
^FO20,185^FD${instructionInfo.line2}^FS

^ADN,26,13
^FO20,220^FDQTY: ${labelData.quantity} ${labelData.unit}^FS
`;
  } else {
    zpl += `^ADN,26,13
^FO20,185^FDQTY: ${labelData.quantity} ${labelData.unit}^FS
`;
  }
  
  // Add refills on the appropriate line based on instruction length
  const refillsY = instructionInfo.needsTwoLines ? 250 : 215;
  zpl += `^ADN,26,13
^FO20,${refillsY}^FD${labelData.refills}^FS

`;
  
  // Add the bottom divider and pharmacy information
  const dividerY = instructionInfo.needsTwoLines ? 270 : 235;
  zpl += `^FO20,${dividerY}^GB569,1,1^FS

^ADN,26,13
^FO20,${dividerY + 20}^FDPersonal Care Pharmacy Ltd^FS

^ADN,26,13
^FO20,${dividerY + 45}^FD72 Aranguez Main Rd, San Juan^FS
^ADN,26,13
^FO20,${dividerY + 70}^FDTel: 638-2889  Whatsapp: 352-2676^FS

^ADN,28,14
^FO20,${dividerY + 100}^FDPharmacist: _______________________^FS

^XZ`;
  
  return zpl;
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
    
    // Get the selected printer
    const selectedPrinter = getSelectedPrinter();
    
    // Debug log
    console.log('Sending to print server:', {
      url: `${normalizeUrl(PRINT_SERVER_CONFIG.url)}${PRINT_SERVER_CONFIG.endpoints.print}`,
      zplCode,
      printer: selectedPrinter
    });
    
    // Send the ZPL code to the print server
    const response = await fetch(`${normalizeUrl(PRINT_SERVER_CONFIG.url)}${PRINT_SERVER_CONFIG.endpoints.print}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zpl: zplCode,
        printer: selectedPrinter // Use the selected printer from configuration
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
  
  // Format dates as DD/MM/YY
  const formatDate = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };
  
  // Generate prescription number from ID
  const rxNumber = `${prescription.id.substring(0, 7)}-${prescription.id.substring(7, 12)}`.toUpperCase();
  
  // Format SIG (prescription instructions)
  let sig = '';
  
  // Check if we have all the necessary information
  if (prescriptionMedication.dose && prescriptionMedication.frequency) {
    sig = `TAKE ${prescriptionMedication.dose} ${prescriptionMedication.unit.toUpperCase()}`;
    
    // Add route if available
    if (prescriptionMedication.route) {
      sig += ` ${prescriptionMedication.route.toUpperCase()}`;
    } else {
      sig += ` BY MOUTH`;
    }
    
    // Add frequency
    sig += ` ${prescriptionMedication.frequency.toUpperCase()}`;
    
    // Add duration if available
    if (prescriptionMedication.days > 0) {
      sig += ` FOR ${prescriptionMedication.days} DAYS`;
    }
  } else {
    sig = `TAKE AS DIRECTED BY YOUR DOCTOR`;
  }
  
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
    doctor: doctor,
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
