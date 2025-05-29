/**
 * AI Service for medication analysis, tagging, and interaction checking
 */

// Configuration for the AI backend
const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:5001';

export interface MedicationTag {
  name: string;
  tag: string;
  category?: string;
}

export interface MedicationInteraction {
  medication1: string;
  medication2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface DosageRecommendation {
  medication: string;
  recommendedDose: string;
  frequency: string;
  warnings?: string[];
}

export interface MedicationAnalysis {
  medications: MedicationTag[];
  interactions: MedicationInteraction[];
  recommendations: DosageRecommendation[];
}

/**
 * Tag medications using AI service
 */
export async function tagMedications(medications: Array<{ name: string; dosage?: string }>): Promise<MedicationTag[]> {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patient: 'Anonymous', // Can be updated to use actual patient name
        medications: medications,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'AI analysis failed');
    }

    return data.medications.map((med: any) => ({
      name: med.name,
      tag: med.tag,
      category: getCategoryFromTag(med.tag),
    }));
  } catch (error) {
    console.error('Error tagging medications:', error);
    // Fallback to basic tagging if AI service is unavailable
    return medications.map(med => ({
      name: med.name,
      tag: 'unknown',
      category: 'Other',
    }));
  }
}

/**
 * Check for drug interactions between medications
 */
export async function checkInteractions(medications: string[]): Promise<MedicationInteraction[]> {
  // This is a mock implementation - in production, this would call a real drug interaction API
  const interactions: MedicationInteraction[] = [];
  
  // Common drug interactions database (mock)
  const knownInteractions: Record<string, Record<string, MedicationInteraction>> = {
    'warfarin': {
      'aspirin': {
        medication1: 'warfarin',
        medication2: 'aspirin',
        severity: 'severe',
        description: 'Increased risk of bleeding when taken together',
      },
      'ibuprofen': {
        medication1: 'warfarin',
        medication2: 'ibuprofen',
        severity: 'moderate',
        description: 'May increase anticoagulant effect',
      },
      'panadol': {
        medication1: 'warfarin',
        medication2: 'panadol',
        severity: 'moderate',
        description: 'May slightly increase anticoagulant effect',
      },
    },
    'lisinopril': {
      'ibuprofen': {
        medication1: 'lisinopril',
        medication2: 'ibuprofen',
        severity: 'moderate',
        description: 'NSAIDs may reduce the effectiveness of ACE inhibitors',
      },
    },
    'metformin': {
      'alcohol': {
        medication1: 'metformin',
        medication2: 'alcohol',
        severity: 'severe',
        description: 'Increased risk of lactic acidosis',
      },
    },
    'glucophage': {
      'alcohol': {
        medication1: 'glucophage',
        medication2: 'alcohol',
        severity: 'severe',
        description: 'Increased risk of lactic acidosis',
      },
      'panadol': {
        medication1: 'glucophage',
        medication2: 'panadol',
        severity: 'mild',
        description: 'May need to monitor blood glucose more closely',
      },
    },
  };

  // Check each pair of medications
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const med1 = medications[i].toLowerCase();
      const med2 = medications[j].toLowerCase();
      
      // Check if interaction exists in either direction
      if (knownInteractions[med1]?.[med2]) {
        interactions.push(knownInteractions[med1][med2]);
      } else if (knownInteractions[med2]?.[med1]) {
        interactions.push(knownInteractions[med2][med1]);
      }
    }
  }

  return interactions;
}

/**
 * Get dosage recommendations based on medication and patient factors
 */
export async function getDosageRecommendations(
  medications: Array<{ name: string; currentDose?: string }>,
  patientAge?: number,
  patientWeight?: number
): Promise<DosageRecommendation[]> {
  // Mock dosage recommendations - in production, this would use clinical guidelines
  const recommendations: DosageRecommendation[] = [];
  
  const standardDosages: Record<string, DosageRecommendation> = {
    'amoxicillin': {
      medication: 'amoxicillin',
      recommendedDose: '500mg',
      frequency: 'every 8 hours',
      warnings: ['Complete full course even if symptoms improve'],
    },
    'ibuprofen': {
      medication: 'ibuprofen',
      recommendedDose: '400mg',
      frequency: 'every 6-8 hours as needed',
      warnings: ['Take with food', 'Maximum 2400mg per day'],
    },
    'lisinopril': {
      medication: 'lisinopril',
      recommendedDose: '10mg',
      frequency: 'once daily',
      warnings: ['Monitor blood pressure regularly', 'May cause dry cough'],
    },
    'metformin': {
      medication: 'metformin',
      recommendedDose: '500mg',
      frequency: 'twice daily with meals',
      warnings: ['Take with food to reduce GI upset', 'Monitor blood sugar'],
    },
    'glucophage': {
      medication: 'glucophage',
      recommendedDose: '500mg',
      frequency: 'twice daily with meals',
      warnings: ['Take with food to reduce GI upset', 'Monitor blood sugar', 'Brand name for metformin'],
    },
    'panadol': {
      medication: 'panadol',
      recommendedDose: '500-1000mg',
      frequency: 'every 4-6 hours as needed',
      warnings: ['Do not exceed 4000mg per day', 'Brand name for paracetamol/acetaminophen'],
    },
  };

  for (const med of medications) {
    const medName = med.name.toLowerCase();
    if (standardDosages[medName]) {
      const recommendation = { ...standardDosages[medName] };
      
      // Adjust for age if applicable
      if (patientAge && patientAge > 65) {
        recommendation.warnings = recommendation.warnings || [];
        recommendation.warnings.push('Consider reduced dose for elderly patients');
      }
      
      recommendations.push(recommendation);
    }
  }

  return recommendations;
}

/**
 * Perform comprehensive medication analysis
 */
export async function analyzePrescription(
  medications: Array<{ name: string; dosage?: string }>,
  patientAge?: number,
  patientWeight?: number
): Promise<MedicationAnalysis> {
  try {
    // Run all analyses in parallel for better performance
    const [tags, interactions, recommendations] = await Promise.all([
      tagMedications(medications),
      checkInteractions(medications.map(m => m.name)),
      getDosageRecommendations(medications, patientAge, patientWeight),
    ]);

    return {
      medications: tags,
      interactions,
      recommendations,
    };
  } catch (error) {
    console.error('Error analyzing prescription:', error);
    throw error;
  }
}

/**
 * Helper function to categorize medications based on their tags
 */
function getCategoryFromTag(tag: string): string {
  const categoryMap: Record<string, string> = {
    'antibiotic': 'Antibiotics',
    'painkiller': 'Pain Management',
    'antidepressant': 'Mental Health',
    'antihypertensive': 'Cardiovascular',
    'antihistamine': 'Allergy',
    'statin': 'Cholesterol',
    'bronchodilator': 'Respiratory',
    'antidiabetic': 'Diabetes',
    'unknown': 'Other',
  };

  return categoryMap[tag] || 'Other';
}

/**
 * Check if AI backend is available
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    return response.ok;
  } catch (error) {
    console.error('AI service health check failed:', error);
    return false;
  }
}
