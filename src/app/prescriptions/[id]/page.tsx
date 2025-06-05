'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Prescription, Patient, Doctor, Medication, PrescriptionMedication } from '@/types/database';
import { format } from 'date-fns';
import PrintLabelModal from '@/components/modals/PrintLabelModal';

type PrescriptionWithDetails = Prescription & {
  patient: Patient;
  doctor: Doctor;
};

type PrescriptionMedicationWithDetails = PrescriptionMedication & {
  medication: Medication;
};

export default function PrescriptionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [prescription, setPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [medications, setMedications] = useState<PrescriptionMedicationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        // Fetch prescription with patient and doctor details
        const { data: prescriptionData, error: prescriptionError } = await supabase
          .from('prescriptions')
          .select(`
            *,
            patient:patient_id(*),
            doctor:doctor_id(*)
          `)
          .eq('id', params.id)
          .single();

        if (prescriptionError) {
          throw prescriptionError;
        }

        setPrescription(prescriptionData);

        // Fetch prescription medications with medication details
        const { data: medicationsData, error: medicationsError } = await supabase
          .from('prescription_medications')
          .select(`
            *,
            medication:medication_id(*)
          `)
          .eq('prescription_id', params.id);

        if (medicationsError) {
          throw medicationsError;
        }

        setMedications(medicationsData || []);
      } catch (error: any) {
        console.error('Error fetching prescription details:', error);
        setError(error.message || 'Failed to load prescription details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescription();
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete the prescription (cascade will delete prescription_medications)
      const { error: deleteError } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', params.id);

      if (deleteError) {
        throw deleteError;
      }

      router.push('/prescriptions');
    } catch (error: any) {
      console.error('Error deleting prescription:', error);
      setError(error.message || 'Failed to delete prescription.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <Link
                  href="/prescriptions"
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Back to Prescriptions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Prescription not found.</p>
              <div className="mt-4">
                <Link
                  href="/prescriptions"
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
                >
                  Back to Prescriptions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {prescription.prescription_number 
            ? `Prescription: ${prescription.prescription_number}` 
            : `Prescription Reference: ${prescription.id.substring(0, 8).toUpperCase()}`
          }
        </h1>
        <div className="flex space-x-2">
          <Link
            href={`/prescriptions/edit/${prescription.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Print Labels
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
          <Link
            href="/prescriptions"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Prescription Information */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Prescription Information</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{prescription.prescription_number ? 'RX Number' : 'Reference ID'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{prescription.prescription_number || prescription.id.substring(0, 8).toUpperCase()}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(prescription.date), 'dd/MM/yyyy')}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Patient</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link href={`/patients/${prescription.patient.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {prescription.patient.name}
                </Link>
                {prescription.patient.phone && (
                  <span className="ml-2 text-gray-500">({prescription.patient.phone})</span>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Doctor</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link href={`/doctors/${prescription.doctor.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {prescription.doctor.name}
                </Link>
                {prescription.doctor.clinic_name && (
                  <span className="ml-2 text-gray-500">({prescription.doctor.clinic_name})</span>
                )}
              </dd>
            </div>
            {prescription.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{prescription.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Medications */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Medications</h3>
        </div>
        <div className="border-t border-gray-200">
          {medications.length === 0 ? (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              No medications added to this prescription.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {medications.map((item, index) => {
                // Generate SIG preview
                const generateSIGPreview = () => {
                  const routeMap: { [key: string]: string } = {
                    'PO': 'by mouth',
                    'IV': 'intravenously',
                    'IM': 'intramuscularly',
                    'SC': 'subcutaneously',
                    'SL': 'sublingually',
                    'TOP': 'topically',
                    'INH': 'by inhalation',
                    'PR': 'rectally',
                    'OPH': 'in the eye',
                    'OT': 'in the ear'
                  };

                  const frequencyMap: { [key: string]: string } = {
                    'QD': 'once daily',
                    'BID': 'twice daily',
                    'TID': 'three times daily',
                    'QID': 'four times daily',
                    'Q4H': 'every 4 hours',
                    'Q6H': 'every 6 hours',
                    'Q8H': 'every 8 hours',
                    'Q12H': 'every 12 hours',
                    'PRN': 'as needed',
                    'QHS': 'at bedtime',
                    'AC': 'before meals',
                    'PC': 'after meals'
                  };

                  let sig = `Take ${item.dose} ${item.unit}`;
                  if (item.route) {
                    sig += ` ${routeMap[item.route] || item.route}`;
                  }
                  if (item.frequency) {
                    sig += ` ${frequencyMap[item.frequency] || item.frequency}`;
                  }
                  if (item.days) {
                    sig += ` for ${item.days} days`;
                  }
                  if (item.notes) {
                    sig += `. ${item.notes}`;
                  }
                  return sig;
                };

                return (
                  <div key={item.id} className="p-6 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors">
                    {/* Medication Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                          {index + 1}
                        </span>
                        <h4 className="text-lg font-medium text-indigo-600">
                          <Link href={`/medications/${item.medication.id}`} className="hover:underline">
                            {item.medication.name}
                            {item.medication.strength !== 'N/A' && (
                              <span className="ml-1">{item.medication.strength}</span>
                            )}
                          </Link>
                        </h4>
                      </div>
                    </div>

                    {/* Medication Details Grid */}
                    <div className="grid grid-cols-12 gap-4 mb-4">
                      {/* Row 1 */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Dose</label>
                        <p className="text-sm font-semibold text-gray-900">{item.dose}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                        <p className="text-sm font-semibold text-gray-900">{item.unit}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Route</label>
                        <p className="text-sm font-semibold text-gray-900">{item.route || 'PO'}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                        <p className="text-sm font-semibold text-gray-900">{item.frequency}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Days Supply</label>
                        <p className="text-sm font-semibold text-gray-900">{item.days}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                        <p className="text-sm font-semibold text-gray-900">{item.quantity}</p>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-12 gap-4 mb-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Refills</label>
                        <p className="text-sm font-semibold text-gray-900">{item.refills || 0}</p>
                      </div>
                      {item.notes && (
                        <div className="col-span-10">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                          <p className="text-sm text-gray-900">{item.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* SIG Preview */}
                    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Instructions:</span> {generateSIGPreview()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Prescription</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this prescription? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {prescription && showPrintModal && (
        <PrintLabelModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          prescription={prescription}
          patient={prescription.patient}
          doctor={prescription.doctor}
          medications={medications.map(m => ({
            medication: m.medication,
            prescriptionMedication: m
          }))}
        />
      )}
    </div>
  );
}
