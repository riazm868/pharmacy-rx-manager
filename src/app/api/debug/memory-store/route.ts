import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/storage/memory-store';

export async function GET() {
  const stats = memoryStore.getStats();
  const patients = await memoryStore.getPatients();
  const medications = await memoryStore.getMedications();
  
  return NextResponse.json({
    stats,
    patients: patients.slice(0, 5), // First 5 patients
    medications: medications.slice(0, 5), // First 5 medications
    totalPatients: patients.length,
    totalMedications: medications.length,
  });
} 