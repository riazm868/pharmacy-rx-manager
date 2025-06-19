'use client';

import { useRouter } from 'next/navigation';

export default function LightspeedConnect() {
  const router = useRouter();

  const handleConnect = () => {
    router.push('/api/lightspeed/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connect to Lightspeed
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Click the button below to connect your Lightspeed account
          </p>
        </div>
        <div>
          <button
            onClick={handleConnect}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Connect to Lightspeed
          </button>
        </div>
      </div>
    </div>
  );
} 