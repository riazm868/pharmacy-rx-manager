'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Prescription, Patient, Doctor, Medication, PrescriptionMedication } from '@/types/database';
import { format } from 'date-fns';
import PrintButton from '@/components/print/PrintButton';

type PrescriptionWithDetails = Prescription & {
  patient: Pick<Patient, 'id' | 'name'>;
  doctor: Pick<Doctor, 'id' | 'name'>;
  medications: Array<PrescriptionMedication & { medication: Pick<Medication, 'id' | 'name' | 'strength'> }>;
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const { data, error } = await supabase
          .from('prescriptions')
          .select(`
            *,
            patient:patient_id(id, name),
            doctor:doctor_id(id, name),
            medications:prescription_medications(id, medication_id, dose, frequency, days, quantity, unit, medication:medication_id(id, name, strength))
          `)
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }

        setPrescriptions(data || []);
      } catch (error: any) {
        console.error('Error fetching prescriptions:', error);
        setError(error.message || 'Failed to load prescriptions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const searchLower = searchTerm.toLowerCase();
    const searchableFields = [
      prescription.patient?.name?.toLowerCase() || '',
      prescription.doctor?.name?.toLowerCase() || '',
      format(new Date(prescription.date), 'dd/MM/yyyy')
    ];
    
    return searchableFields.some(field => field.includes(searchLower));
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <Link
          href="/prescriptions/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Prescription
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by RX number, patient name, doctor name, or date..."
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
          {searchTerm ? 'No prescriptions found matching your search.' : 'No prescriptions found. Add a new prescription to get started.'}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:block bg-gray-50 rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">RX Number</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-2">Patient</div>
              <div className="col-span-2">Doctor</div>
              <div className="col-span-4">Medications</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
          </div>

          {/* Prescription Rows */}
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/prescriptions/${prescription.id}`} className="block">
                <div className="p-4">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-indigo-600">
                          {prescription.prescription_number 
                            ? `RX: ${prescription.prescription_number}` 
                            : `Ref: ${prescription.id.substring(0, 8).toUpperCase()}`
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(prescription.date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div className="flex space-x-2" onClick={(e) => e.preventDefault()}>
                        <PrintButton prescriptionId={prescription.id} className="text-green-600 hover:text-green-900 text-sm font-medium" />
                        <Link
                          href={`/prescriptions/edit/${prescription.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Patient:</span>
                        <p className="font-medium text-gray-900">{prescription.patient?.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Doctor:</span>
                        <p className="text-gray-900">{prescription.doctor?.name}</p>
                      </div>
                    </div>

                    {prescription.medications && prescription.medications.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Medications</p>
                        <div className="space-y-1">
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <div key={med.id} className="flex items-start space-x-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium flex-shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium">{med.medication.name}</span>
                                  {med.medication.strength !== 'N/A' && (
                                    <span className="text-gray-500 ml-1">{med.medication.strength}</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {med.dose} {med.unit} • {med.frequency} • {med.days} days
                                </p>
                              </div>
                            </div>
                          ))}
                          {prescription.medications.length > 2 && (
                            <p className="text-xs text-gray-500 pl-7">
                              +{prescription.medications.length - 2} more medication{prescription.medications.length - 2 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    {/* RX Number */}
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-indigo-600">
                        {prescription.prescription_number 
                          ? `RX: ${prescription.prescription_number}` 
                          : `Ref: ${prescription.id.substring(0, 8).toUpperCase()}`
                        }
                      </p>
                    </div>

                    {/* Date */}
                    <div className="col-span-1">
                      <p className="text-sm text-gray-900">
                        {format(new Date(prescription.date), 'dd/MM/yyyy')}
                      </p>
                    </div>

                    {/* Patient */}
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {prescription.patient?.name}
                      </p>
                    </div>

                    {/* Doctor */}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-900">
                        {prescription.doctor?.name}
                      </p>
                    </div>

                    {/* Medications */}
                    <div className="col-span-4">
                      {prescription.medications && prescription.medications.length > 0 ? (
                        <div className="space-y-1">
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <div key={med.id} className="flex items-center space-x-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate">
                                  <span className="font-medium">{med.medication.name}</span>
                                  {med.medication.strength !== 'N/A' && (
                                    <span className="text-gray-500 ml-1">{med.medication.strength}</span>
                                  )}
                                  <span className="text-gray-500 ml-2">
                                    • {med.dose} {med.unit} • {med.frequency} • {med.days} days
                                  </span>
                                </p>
                              </div>
                            </div>
                          ))}
                          {prescription.medications.length > 2 && (
                            <p className="text-xs text-gray-500 pl-7">
                              +{prescription.medications.length - 2} more medication{prescription.medications.length - 2 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No medications</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end space-x-2" onClick={(e) => e.preventDefault()}>
                      <PrintButton prescriptionId={prescription.id} className="text-green-600 hover:text-green-900 text-sm font-medium" />
                      <Link
                        href={`/prescriptions/edit/${prescription.id}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
