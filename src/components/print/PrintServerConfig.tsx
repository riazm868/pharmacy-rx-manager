import React, { useState, useEffect } from 'react';
import { checkPrintServerStatus, getAvailablePrinters, setPrintServerUrl, getPrintServerUrl, setSelectedPrinter, getSelectedPrinter } from '@/utils/printService';

interface PrintServerConfigProps {
  onClose?: () => void;
}

const PrintServerConfig: React.FC<PrintServerConfigProps> = ({ onClose }) => {
  const [serverUrl, setServerUrl] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [testPrintResult, setTestPrintResult] = useState<{success: boolean; message: string} | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Load the saved URL and printer from localStorage on component mount
  useEffect(() => {
    const savedUrl = getPrintServerUrl();
    const savedPrinter = getSelectedPrinter();
    
    if (savedUrl) {
      setServerUrl(savedUrl);
      checkServer(savedUrl);
    }
    
    if (savedPrinter) {
      setSelectedPrinter(savedPrinter);
    }
  }, []);

  // Function to check the print server status
  const checkServer = async (url: string) => {
    setIsChecking(true);
    setError(null);
    
    try {
      // Update the print server URL
      setPrintServerUrl(url);
      
      // Check if the server is online
      const isOnline = await checkPrintServerStatus();
      setServerStatus(isOnline ? 'online' : 'offline');
      
      if (isOnline) {
        // Get available printers
        const printers = await getAvailablePrinters();
        setAvailablePrinters(printers);
        
        // Set the first printer as selected by default
        if (printers.length > 0) {
          // Try to find a Zebra printer first
          const zebraPrinter = printers.find(p => p.toLowerCase().includes('zebra'));
          setSelectedPrinter(zebraPrinter || printers[0]);
        }
      } else {
        setAvailablePrinters([]);
        setSelectedPrinter('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while checking the print server');
      setServerStatus('offline');
      setAvailablePrinters([]);
    } finally {
      setIsChecking(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkServer(serverUrl);
  };
  
  // Handle test print
  const handleTestPrint = async () => {
    if (!selectedPrinter) {
      setError('Please select a printer first');
      return;
    }
    
    setIsTesting(true);
    setTestPrintResult(null);
    setError(null);
    
    try {
      const response = await fetch(`${serverUrl}/test_print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printer: selectedPrinter
        }),
      });
      
      const data = await response.json();
      
      setTestPrintResult({
        success: data.success,
        message: data.success ? 
          `Test print sent successfully to ${selectedPrinter}` : 
          `Failed to send test print: ${data.error || 'Unknown error'}`
      });
    } catch (err: any) {
      setTestPrintResult({
        success: false,
        message: `Error: ${err.message || 'Failed to connect to print server'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Zebra Print Server Configuration</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Print Server URL
          </label>
          <div className="flex">
            <input
              type="text"
              id="serverUrl"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://192.168.30.106:5000"
              className="flex-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              type="submit"
              disabled={isChecking || !serverUrl}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Check'}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter the URL of the Windows PC running the Zebra print server (HTTP protocol required)
          </p>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {testPrintResult && (
        <div className={`mt-4 p-3 rounded-md ${testPrintResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center">
            {testPrintResult.success ? (
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{testPrintResult.message}</span>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Server Status</h3>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${
            serverStatus === 'online' ? 'bg-green-500' : 
            serverStatus === 'offline' ? 'bg-red-500' : 'bg-gray-300'
          }`}></div>
          <span className="text-sm text-gray-600">
            {serverStatus === 'online' ? 'Online' : 
             serverStatus === 'offline' ? 'Offline' : 'Unknown'}
          </span>
        </div>
      </div>
      
      {availablePrinters.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Available Printers</h3>
          <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
            {availablePrinters.map((printer, index) => (
              <div key={index} className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`printer-${index}`}
                    name="printer"
                    value={printer}
                    checked={selectedPrinter === printer}
                    onChange={() => {
                      // Update local state and save to localStorage
                      setSelectedPrinter(printer);
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor={`printer-${index}`} className="ml-2 text-sm text-gray-600">
                    {printer}
                  </label>
                </div>
                {selectedPrinter === printer && (
                  <button
                    type="button"
                    onClick={handleTestPrint}
                    disabled={isTesting || serverStatus !== 'online'}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isTesting ? 'Sending...' : 'Test Print'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default PrintServerConfig;
