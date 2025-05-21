import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export const getPatients = async (searchTerm = '') => {
  const query = supabase
    .from('patients')
    .select('*');
  
  if (searchTerm) {
    query.or(`name.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`);
  }
  
  return query.order('name');
};

export const getPatientById = async (id: string) => {
  return supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
};

export const createPatient = async (patient: Omit<any, 'id' | 'created_at' | 'updated_at'>) => {
  return supabase
    .from('patients')
    .insert(patient)
    .select()
    .single();
};

export const getDoctors = async (searchTerm = '') => {
  const query = supabase
    .from('doctors')
    .select('*');
  
  if (searchTerm) {
    query.ilike('name', `%${searchTerm}%`);
  }
  
  return query.order('name');
};

export const getDoctorById = async (id: string) => {
  return supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single();
};

export const createDoctor = async (doctor: Omit<any, 'id' | 'created_at' | 'updated_at'>) => {
  return supabase
    .from('doctors')
    .insert(doctor)
    .select()
    .single();
};

export const getMedications = async (searchTerm = '') => {
  const query = supabase
    .from('medications')
    .select('*');
  
  if (searchTerm) {
    query.ilike('name', `%${searchTerm}%`);
  }
  
  return query.order('name');
};

export const getMedicationById = async (id: string) => {
  return supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .single();
};

export const createMedication = async (medication: Omit<any, 'id' | 'created_at' | 'updated_at'>) => {
  return supabase
    .from('medications')
    .insert(medication)
    .select()
    .single();
};

export const createPrescription = async (
  prescription: Omit<any, 'id' | 'created_at' | 'updated_at'>,
  medications: Array<Omit<any, 'id' | 'prescription_id' | 'created_at' | 'updated_at'>>
) => {
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

export const getPrescriptionsByPatientId = async (patientId: string) => {
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
