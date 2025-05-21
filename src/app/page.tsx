import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome to your pharmacy management system</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              href="/prescriptions/new"
              className="flex items-center text-indigo-600 hover:text-indigo-900"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Prescription
            </Link>
            <Link 
              href="/patients/new"
              className="flex items-center text-indigo-600 hover:text-indigo-900"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Patient
            </Link>
            <Link 
              href="/medications/new"
              className="flex items-center text-indigo-600 hover:text-indigo-900"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Medication
            </Link>
          </div>
        </div>

        {/* Recent Prescriptions Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Prescriptions</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 italic">Connect to Supabase to view recent prescriptions</p>
            <Link 
              href="/prescriptions"
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              View all prescriptions →
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Patients</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Prescriptions</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Doctors</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Medications</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm mr-3">
              1
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Connect to Supabase</h3>
              <p className="mt-1 text-sm text-gray-500">
                Set up your Supabase project and add your API keys to the environment variables.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm mr-3">
              2
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Add your first patient</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a patient record to get started with prescription management.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm mr-3">
              3
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Create your first prescription</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add medications and create a prescription for a patient.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
