import { SigCalculation } from '@/types/database';

// Frequency mapping for common pharmacy terms
const frequencyMap: Record<string, number> = {
  'once daily': 1,
  'daily': 1,
  'every day': 1,
  'qd': 1,
  'once a day': 1,
  'twice daily': 2,
  'bid': 2,
  'two times a day': 2,
  'three times daily': 3,
  'tid': 3,
  'three times a day': 3,
  'four times daily': 4,
  'qid': 4,
  'four times a day': 4,
  'every other day': 0.5,
  'qod': 0.5,
  'weekly': 1/7,
  'once a week': 1/7,
  'twice weekly': 2/7,
  'three times a week': 3/7,
  'four times a week': 4/7,
  'five times a week': 5/7,
  'every 4 hours': 6,
  'q4h': 6,
  'every 6 hours': 4,
  'q6h': 4,
  'every 8 hours': 3,
  'q8h': 3,
  'every 12 hours': 2,
  'q12h': 2,
  'as needed': 0, // PRN - requires manual entry
  'prn': 0,
};

/**
 * Calculates the quantity to dispense based on SIG fields
 * @param dose - Number of units per dose (e.g., 1 tablet)
 * @param frequency - How often medication is taken (e.g., "twice daily")
 * @param days - Number of days supplied
 * @returns The calculated quantity to dispense
 */
export function calculateQuantityToDispense(
  dose: number | string,
  frequency: string,
  days: number | string
): SigCalculation {
  // Convert inputs to numbers
  const doseNum = typeof dose === 'string' ? parseFloat(dose) : dose;
  const daysNum = typeof days === 'string' ? parseFloat(days) : days;
  
  // Get frequency multiplier
  let frequencyNum = 0;
  const normalizedFreq = frequency.toLowerCase().trim();
  
  if (normalizedFreq in frequencyMap) {
    frequencyNum = frequencyMap[normalizedFreq];
  } else {
    // Try to parse a number from the frequency string
    const matches = normalizedFreq.match(/(\d+)/);
    if (matches && matches[1]) {
      frequencyNum = parseInt(matches[1], 10);
    }
  }
  
  // Calculate total quantity
  const result = doseNum * frequencyNum * daysNum;
  
  return {
    dose: doseNum,
    frequency: frequencyNum,
    days: daysNum,
    result: Math.ceil(result) // Round up to ensure patient has enough medication
  };
}

/**
 * Parse a SIG string to extract dose, frequency, and duration
 * This is a simplified version - a real implementation would be more complex
 * @param sigString - The SIG string to parse
 * @returns Parsed components or null if parsing fails
 */
export function parseSigString(sigString: string): Partial<SigCalculation> | null {
  try {
    // Example pattern: "Take 1 tablet twice daily for 7 days"
    const doseMatch = sigString.match(/(\d+(?:\.\d+)?)\s+(?:tablet|capsule|pill|unit|ml|mg)/i);
    const dose = doseMatch ? parseFloat(doseMatch[1]) : null;
    
    // Look for frequency terms
    let frequency = 0;
    for (const [term, value] of Object.entries(frequencyMap)) {
      if (sigString.toLowerCase().includes(term)) {
        frequency = value;
        break;
      }
    }
    
    // Look for duration
    const daysMatch = sigString.match(/for\s+(\d+)\s+days?/i);
    const days = daysMatch ? parseInt(daysMatch[1], 10) : null;
    
    if (dose && frequency && days) {
      return {
        dose,
        frequency,
        days,
        result: Math.ceil(dose * frequency * days)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing SIG string:', error);
    return null;
  }
}
