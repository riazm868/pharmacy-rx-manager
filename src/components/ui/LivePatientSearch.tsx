'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientSearch } from '@/hooks/useApiSearch';
import { Patient } from '@/types/database';

interface LivePatientSearchProps {
  onSelectPatient?: (patient: Patient) => void;
  placeholder?: string;
  className?: string;
}

export default function LivePatientSearch({
  onSelectPatient,
  placeholder = "Search patients by name, ID, or phone...",
  className = ""
}: LivePatientSearchProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: patients, isLoading, error } = usePatientSearch(searchTerm, {
    minSearchLength: 2,
    debounceMs: 300,
    limit: 8
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show dropdown when we have results
  useEffect(() => {
    if (patients.length > 0 && searchTerm.length >= 2) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [patients, searchTerm]);

  const handleSelectPatient = (patient: Patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
      setSearchTerm('');
      setShowDropdown(false);
    } else {
      // Default behavior: navigate to patient detail
      router.push(`/patients/${patient.id}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => patients.length > 0 && setShowDropdown(true)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={placeholder}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {showDropdown && patients.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto"
        >
          {patients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handleSelectPatient(patient)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-gray-500 text-xs">
                    ID: {patient.id_number} • Phone: {patient.phone}
                  </div>
                </div>
                <div className="text-gray-400 text-xs">
                  {patient.city}, {patient.state}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && searchTerm.length >= 2 && patients.length === 0 && !isLoading && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-3 text-sm ring-1 ring-black ring-opacity-5"
        >
          <p className="text-center text-gray-500">No patients found</p>
        </div>
      )}
    </div>
  );
} 