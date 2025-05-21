-- Add new columns to the doctors table
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS phone2 TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS clinic_name TEXT,
ADD COLUMN IF NOT EXISTS clinic_address TEXT;
