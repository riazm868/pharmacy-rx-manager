import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Medication } from '@/types/database';

interface MedicationNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function MedicationNameInput({
  value,
  onChange,
  required = false
}: MedicationNameInputProps) {
  const [matches, setMatches] = useState<Medication[]>([]);
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

  // Search for matching medications
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (value.length < 2) {
        setMatches([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('medications')
          .select('*')
          .ilike('name', `%${value.trim()}%`)
          .limit(5);
        
        if (error) {
          console.error('Error searching medications:', error);
          return;
        }
        
        setMatches(data || []);
        setShowDropdown(data && data.length > 0);
      } catch (err) {
        console.error('Error searching medications:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => value.length >= 2 && matches.length > 0 && setShowDropdown(true)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-3">
          <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {showDropdown && matches.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto"
        >
          <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-100">
            Similar medications found (view only)
          </div>
          {matches.map((medication) => (
            <div
              key={medication.id}
              className="px-3 py-2 hover:bg-gray-50"
            >
              <div className="font-medium">{medication.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
