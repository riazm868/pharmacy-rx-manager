'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LightspeedSync() {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSync = async (type: 'products' | 'customers') => {
    setSyncing(true);
    setError('');
    setSyncStatus(`Starting ${type} sync...`);

    try {
      const response = await fetch('/api/lightspeed/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      setSyncStatus(`Successfully synced ${result.count} ${type}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Lightspeed Sync
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Sync your Lightspeed data with the pharmacy management system.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Product Sync</h2>
              <p className="text-sm text-gray-600 mb-4">
                Sync Lightspeed products to medications in the pharmacy system.
              </p>
              <button
                onClick={() => handleSync('products')}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? 'Syncing...' : 'Sync Products'}
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Customer Sync</h2>
              <p className="text-sm text-gray-600 mb-4">
                Sync Lightspeed customers to patients in the pharmacy system.
              </p>
              <button
                onClick={() => handleSync('customers')}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? 'Syncing...' : 'Sync Customers'}
              </button>
            </div>
          </div>

          {syncStatus && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">{syncStatus}</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 