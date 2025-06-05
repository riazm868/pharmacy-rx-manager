'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>Pharmacy RX Manager</title>
        <meta name="description" content="Prescription management system for independent pharmacies" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <div className={`${sidebarExpanded ? 'w-64' : 'w-16'} bg-indigo-700 text-white transition-all duration-300 ease-in-out relative`}>
            {/* Expand/Collapse Button */}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="absolute -right-3 top-9 bg-indigo-700 rounded-full p-1 border-2 border-white hover:bg-indigo-800 transition-colors"
            >
              <svg 
                className={`h-4 w-4 text-white transform transition-transform ${sidebarExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className={`p-6 ${!sidebarExpanded && 'px-4'}`}>
              <h1 className={`text-2xl font-semibold ${!sidebarExpanded && 'hidden'}`}>Pharmacy RX</h1>
              <p className={`text-indigo-200 text-sm ${!sidebarExpanded && 'hidden'}`}>Prescription Manager</p>
              {!sidebarExpanded && (
                <div className="text-2xl font-bold text-center">RX</div>
              )}
            </div>
            <nav className="mt-6">
              <ul>
                <li>
                  <Link 
                    href="/"
                    className={`flex items-center ${sidebarExpanded ? 'px-6' : 'px-4 justify-center'} py-3 text-indigo-100 hover:bg-indigo-800 transition-colors`}
                    title={!sidebarExpanded ? "Dashboard" : ""}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className={`ml-3 ${!sidebarExpanded && 'hidden'}`}>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/prescriptions"
                    className={`flex items-center ${sidebarExpanded ? 'px-6' : 'px-4 justify-center'} py-3 text-indigo-100 hover:bg-indigo-800 transition-colors`}
                    title={!sidebarExpanded ? "Prescriptions" : ""}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={`ml-3 ${!sidebarExpanded && 'hidden'}`}>Prescriptions</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/patients"
                    className={`flex items-center ${sidebarExpanded ? 'px-6' : 'px-4 justify-center'} py-3 text-indigo-100 hover:bg-indigo-800 transition-colors`}
                    title={!sidebarExpanded ? "Patients" : ""}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className={`ml-3 ${!sidebarExpanded && 'hidden'}`}>Patients</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/doctors"
                    className={`flex items-center ${sidebarExpanded ? 'px-6' : 'px-4 justify-center'} py-3 text-indigo-100 hover:bg-indigo-800 transition-colors`}
                    title={!sidebarExpanded ? "Doctors" : ""}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span className={`ml-3 ${!sidebarExpanded && 'hidden'}`}>Doctors</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/medications"
                    className={`flex items-center ${sidebarExpanded ? 'px-6' : 'px-4 justify-center'} py-3 text-indigo-100 hover:bg-indigo-800 transition-colors`}
                    title={!sidebarExpanded ? "Medications" : ""}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className={`ml-3 ${!sidebarExpanded && 'hidden'}`}>Medications</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-auto">
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
