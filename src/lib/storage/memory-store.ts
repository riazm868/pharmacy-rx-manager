import { Patient, Medication } from '@/types/database';

// Simple in-memory storage for development with localStorage persistence
class MemoryStore {
  private patients: Map<string, Patient>;
  private medications: Map<string, Medication>;
  private isServer: boolean;
  private patientIdCounter = 1;
  private medicationIdCounter = 1;

  constructor() {
    this.patients = new Map();
    this.medications = new Map();
    this.isServer = typeof window === 'undefined';
    
    if (!this.isServer) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      // Load patients
      const storedPatients = localStorage.getItem('memoryStore_patients');
      if (storedPatients) {
        const patients = JSON.parse(storedPatients);
        this.patients = new Map(Object.entries(patients));
        this.patientIdCounter = Math.max(...Object.keys(patients).map(k => parseInt(k.split('_')[1])), 0) + 1;
      }

      // Load medications
      const storedMedications = localStorage.getItem('memoryStore_medications');
      if (storedMedications) {
        const medications = JSON.parse(storedMedications);
        this.medications = new Map(Object.entries(medications));
        this.medicationIdCounter = Math.max(...Object.keys(medications).map(k => parseInt(k.split('_')[1])), 0) + 1;
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.clearAll();
    }
  }

  private saveToStorage(): void {
    if (this.isServer) return;
    
    try {
      localStorage.setItem('memoryStore_patients', JSON.stringify(Object.fromEntries(this.patients)));
      localStorage.setItem('memoryStore_medications', JSON.stringify(Object.fromEntries(this.medications)));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Patient methods
  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    const id = `patient_${this.patientIdCounter++}`;
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...patient,
      id,
      created_at: now,
      updated_at: now,
    };
    this.patients.set(id, newPatient);
    this.saveToStorage();
    return newPatient;
  }

  async getPatients(searchTerm = ''): Promise<Patient[]> {
    const allPatients = Array.from(this.patients.values());
    if (!searchTerm) return allPatients;
    
    const search = searchTerm.toLowerCase();
    return allPatients.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.phone?.toLowerCase().includes(search) ||
      p.email?.toLowerCase().includes(search)
    );
  }

  async getPatientById(id: string): Promise<Patient | null> {
    return this.patients.get(id) || null;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    const patient = this.patients.get(id);
    if (!patient) return null;
    
    const updated = {
      ...patient,
      ...updates,
      id: patient.id, // Ensure ID doesn't change
      created_at: patient.created_at, // Ensure created_at doesn't change
      updated_at: new Date().toISOString(),
    };
    this.patients.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  // Medication methods
  async createMedication(medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication> {
    const id = `med_${this.medicationIdCounter++}`;
    const now = new Date().toISOString();
    const newMedication: Medication = {
      ...medication,
      id,
      created_at: now,
      updated_at: now,
    };
    this.medications.set(id, newMedication);
    this.saveToStorage();
    return newMedication;
  }

  async getMedications(searchTerm?: string): Promise<Medication[]> {
    let medications = Array.from(this.medications.values());
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      medications = medications.filter(med => 
        med.name.toLowerCase().includes(term)
      );
    }
    
    return medications.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getMedicationById(id: string): Promise<Medication | null> {
    return this.medications.get(id) || null;
  }

  // Utility methods
  clearAll(): void {
    this.patients.clear();
    this.medications.clear();
    this.patientIdCounter = 1;
    this.medicationIdCounter = 1;
    localStorage.removeItem('memoryStore_patients');
    localStorage.removeItem('memoryStore_medications');
  }

  clearPatients(): void {
    this.patients.clear();
    this.saveToStorage();
  }

  clearMedications(): void {
    this.medications.clear();
    this.saveToStorage();
  }

  getStats() {
    return {
      patients: this.patients.size,
      medications: this.medications.size,
    };
  }
}

// Export a singleton instance
export const memoryStore = new MemoryStore(); 