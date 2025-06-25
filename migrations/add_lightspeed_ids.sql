-- Add lightspeed_id columns to track the original Lightspeed IDs
-- This allows us to map back to Lightspeed when creating parked sales

-- Add to medications table
ALTER TABLE medications 
ADD COLUMN lightspeed_id VARCHAR(255),
ADD COLUMN price DECIMAL(10,2) DEFAULT 0;

-- Add index for faster lookups
CREATE INDEX idx_medications_lightspeed_id ON medications(lightspeed_id);

-- Add to patients table (for consistency)
ALTER TABLE patients 
ADD COLUMN lightspeed_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX idx_patients_lightspeed_id ON patients(lightspeed_id);

-- Comments for documentation
COMMENT ON COLUMN medications.lightspeed_id IS 'Original Lightspeed product ID for medications imported from Lightspeed';
COMMENT ON COLUMN medications.price IS 'Unit price for the medication';
COMMENT ON COLUMN patients.lightspeed_id IS 'Original Lightspeed customer ID for patients imported from Lightspeed'; 