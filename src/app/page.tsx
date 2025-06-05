import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome to your pharmacy management system</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 ml-3">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link 
              href="/prescriptions/new"
              className="flex items-center p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200 group"
            >
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors duration-200">
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="ml-3 text-gray-700 font-medium group-hover:text-indigo-600 transition-colors duration-200">New Prescription</span>
            </Link>
            <Link 
              href="/patients/new"
              className="flex items-center p-3 rounded-lg hover:bg-green-50 transition-colors duration-200 group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="ml-3 text-gray-700 font-medium group-hover:text-green-600 transition-colors duration-200">Add Patient</span>
            </Link>
            <Link 
              href="/medications/new"
              className="flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors duration-200 group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="ml-3 text-gray-700 font-medium group-hover:text-purple-600 transition-colors duration-200">Add Medication</span>
            </Link>
          </div>
        </div>

        {/* Recent Prescriptions Card */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Recent Prescriptions</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 italic">Connect to Supabase to view recent prescriptions</p>
            </div>
            <Link 
              href="/prescriptions"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              View all prescriptions
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 ml-3">Statistics</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-600">Patients</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">--</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-600">Prescriptions</p>
              <p className="text-2xl font-bold text-green-900 mt-1">--</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-600">Doctors</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">--</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-600">Medications</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">--</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
