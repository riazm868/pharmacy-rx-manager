'use client';

import { useState } from 'react';
import { cookies } from 'next/headers';
import { LightspeedClient } from '@/lib/lightspeed/client';
import { LightspeedParkSaleService } from '@/lib/lightspeed/parkSale';

export default function ParkSaleTestPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registers, setRegisters] = useState<any[]>([]);
  const [selectedRegisterId, setSelectedRegisterId] = useState<string>('');

  const initializeConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lightspeed/config');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load configuration');
      }

      setConfig(data.config);
      setRegisters(data.registers || []);
      setSelectedRegisterId(data.config?.registerId || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testParkSale = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lightspeed/park-sale-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registerId: selectedRegisterId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to park sale');
      }

      alert('Success! Sale parked in Lightspeed. Check your POS to complete the sale.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Lightspeed Park Sale Configuration</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">How it works:</h2>
        <ol className="list-decimal list-inside text-blue-800 space-y-1">
          <li>When a prescription is created, it will be "parked" as a sale in Lightspeed</li>
          <li>The parked sale will appear on your Lightspeed POS</li>
          <li>When the patient picks up their medication, complete the sale in Lightspeed</li>
          <li>Lightspeed will handle all inventory management automatically</li>
        </ol>
      </div>

      <div className="space-y-4">
        <button
          onClick={initializeConfig}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Configuration'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
            {error}
          </div>
        )}

        {config && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Register</label>
                <select
                  value={selectedRegisterId}
                  onChange={(e) => setSelectedRegisterId(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  {registers.map((register) => (
                    <option key={register.id} value={register.id}>
                      {register.name} ({register.outlet_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="mt-1 text-sm text-gray-600">{config.userName || 'Primary User'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Configuration</label>
                <p className="mt-1 text-sm text-gray-600">
                  {config.taxName} ({(config.taxRate * 100).toFixed(0)}%)
                  {config.taxExclusive ? ' - Tax Exclusive' : ' - Tax Inclusive'}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={testParkSale}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Test Park Sale
              </button>
              <p className="text-sm text-gray-600 mt-2">
                This will create a test parked sale in Lightspeed with dummy data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 