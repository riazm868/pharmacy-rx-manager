export type Patient = {
  id: string;
  name: string;
  dob: string;
  gender: string;
  id_number: string;
  dp_number: string;
  birth_cert_pin: string;
  phone: string;
  phone2?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  created_at: string;
  updated_at: string;
};

export type Doctor = {
  id: string;
  name: string;
  phone: string;
  phone2?: string;
  email?: string;
  registration_number?: string;
  clinic_name?: string;
  address: string; // This will be used for clinic address
  created_at: string;
  updated_at: string;
};

export type Medication = {
  id: string;
  name: string;
  strength: string;
  count: number;
  created_at: string;
  updated_at: string;
};

export type Prescription = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type PrescriptionMedication = {
  id: string;
  prescription_id: string;
  medication_id: string;
  dose: string;
  route: string;
  frequency: string;
  days: number;
  quantity: number;
  unit: string;
  refills: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type SigCalculation = {
  dose: number;
  frequency: number;
  days: number;
  result: number;
};
