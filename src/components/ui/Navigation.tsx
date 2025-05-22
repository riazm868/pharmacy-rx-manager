'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                Pharmacy RX Manager
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/patients"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/patients')
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  Patients
                </Link>
                <Link
                  href="/doctors"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/doctors')
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  Doctors
                </Link>
                <Link
                  href="/medications"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/medications')
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  Medications
                </Link>
                <Link
                  href="/prescriptions"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/prescriptions')
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  Prescriptions
                </Link>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/patients"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/patients')
                ? 'bg-indigo-700 text-white'
                : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Patients
          </Link>
          <Link
            href="/doctors"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/doctors')
                ? 'bg-indigo-700 text-white'
                : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Doctors
          </Link>
          <Link
            href="/medications"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/medications')
                ? 'bg-indigo-700 text-white'
                : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Medications
          </Link>
          <Link
            href="/prescriptions"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/prescriptions')
                ? 'bg-indigo-700 text-white'
                : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Prescriptions
          </Link>
        </div>
      </div>
    </nav>
  );
}
