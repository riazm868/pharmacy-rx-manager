import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Doctor } from '@/types/database';
import Link from 'next/link';

interface DoctorListSearchProps {
  onSelectDoctor?: (doctor: Doctor) => void;
  showViewButton?: boolean;
}

export default function DoctorListSearch({
  onSelectDoctor,
  showViewButton = true
}: DoctorListSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Search for doctors
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,clinic_name.ilike.%${searchTerm}%`)
          .order('name', { ascending: true })
          .limit(10);
        
        if (error) {
          console.error('Error searching doctors:', error);
          return;
        }
        
        setSearchResults(data || []);
        setShowDropdown(data && data.length > 0);
      } catch (err) {
        console.error('Error searching doctors:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  const handleSelectDoctor = (doctor: Doctor) => {
    if (onSelectDoctor) {
      onSelectDoctor(doctor);
      setSearchTerm('');
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex rounded-md shadow-sm">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search doctors by name, phone, or clinic..."
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-2">
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      
      {showDropdown && searchResults.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto"
        >
          {searchResults.map((doctor) => (
            <div
              key={doctor.id}
              className="px-3 py-2 hover:bg-gray-50 flex justify-between items-center cursor-pointer"
              onClick={() => handleSelectDoctor(doctor)}
            >
              <div>
                <div className="font-medium">{doctor.name}</div>
                <div className="text-xs text-gray-500">
                  {doctor.phone} {doctor.clinic_name && `• ${doctor.clinic_name}`}
                </div>
              </div>
              {showViewButton && (
                <Link 
                  href={`/doctors/${doctor.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
