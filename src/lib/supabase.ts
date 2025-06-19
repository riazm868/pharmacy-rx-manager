import { createClient } from '@supabase/supabase-js';
import { Prescription, Patient, Doctor, Medication } from '@/types/database';
import { memoryStore } from './storage/memory-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if credentials are provided
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
}

export { supabase };

// Helper functions for database operations
export const getPatients = async (searchTerm = ''): Promise<Patient[]> => {
  if (!supabase) {
    console.warn('Supabase is not configured. Using memory store.');
    const patients = await memoryStore.getPatients();
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return patients.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.id_number?.toLowerCase().includes(term)
      );
    }
    return patients;
  }
  
  const query = supabase
    .from('patients')
    .select('*');
  
  if (searchTerm) {
    query.or(`name.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`);
  }
  
  const { data, error } = await query.order('name');
  if (error) throw error;
  return data || [];
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  if (!supabase) {
    console.warn('Supabase is not configured. Using memory store.');
    return memoryStore.getPatientById(id);
  }
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

export const createPatient = async (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> => {
  if (!supabase) {
    console.warn('Supabase is not configured. Using memory store.');
    return memoryStore.createPatient(patient);
  }
  
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getDoctors = async (searchTerm = ''): Promise<Doctor[]> => {
  if (!supabase) {
    console.warn('Supabase is not configured. Using memory store.');
    // Memory store doesn't have doctors yet, return empty array
    return [];
  }
  
  const query = supabase
    .from('doctors')
    .select('*');
  
  if (searchTerm) {
    query.ilike('name', `%${searchTerm}%`);
  }
  
  const { data, error } = await query.order('name');
  if (error) throw error;
  return data || [];
};

export const getDoctorById = async (id: string): Promise<Doctor | null> => {
  if (!supabase) {
    console.warn('Supabase is not configured. Using memory store.');
    return null;
  }
  
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

export const createDoctor = async (doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> => {
  if (!supabase) {
    throw new Error('Cannot create doctor without Supabase configured.');
  }
  
  const { data, error } = await supabase
    .from('doctors')
    .insert(doctor)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getMedications = async (searchTerm = ''): Promise<Medication[]> => {
  if (!supabase) {
    console.warn('Supabase is not configured. Using memory store.');
    const medications = await memoryStore.getMedications();
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return medications.filter(m => 
        m.name.toLowerCase().includes(term)
      );
    }
    return medications;
  }
  
  const query = supabase
    .from('medications')
    .select('*');
  
  if (searchTerm) {
    query.ilike('name', `%${searchTerm}%`);
  }
  
  const { data, error } = await query.order('name');
  if (error) throw error;
  return data || [];
};

export const getMedicationById = async (id: string): Promise<Medication | null> => {
  if (!supabase) {
    console.warn('Supabase is not configured. Using memory store.');
    return memoryStore.getMedicationById(id);
  }
  
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

export const createMedication = async (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication> => {
  if (!supabase) {
    console.warn('Supabase is not configured. Using memory store.');
    return memoryStore.createMedication(medication);
  }
  
  const { data, error } = await supabase
    .from('medications')
    .insert(medication)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const createPrescription = async (
  prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>,
  medications: Array<Omit<Medication, 'id' | 'prescription_id' | 'created_at' | 'updated_at'>>
): Promise<{ prescription: Prescription, medications: Medication[] }> => {
  // First create the prescription
  const { data: prescriptionData, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert(prescription)
    .select()
    .single();

  if (prescriptionError || !prescriptionData) {
    throw prescriptionError || new Error('Failed to create prescription');
  }

  // Then create the prescription medications
  const prescriptionMedications = medications.map(med => ({
    ...med,
    prescription_id: prescriptionData.id
  }));

  const { data: medicationsData, error: medicationsError } = await supabase
    .from('prescription_medications')
    .insert(prescriptionMedications)
    .select();

  if (medicationsError) {
    throw medicationsError;
  }

  return { prescription: prescriptionData, medications: medicationsData };
};

export const getPrescriptionsByPatientId = async (patientId: string): Promise<Prescription[]> => {
  const { data: prescriptions, error: prescriptionsError } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:doctors(*),
      medications:prescription_medications(
        *,
        medication:medications(*)
      )
    `)
    .eq('patient_id', patientId)
    .order('date', { ascending: false });

  if (prescriptionsError) {
    throw prescriptionsError;
  }

  return prescriptions;
};
