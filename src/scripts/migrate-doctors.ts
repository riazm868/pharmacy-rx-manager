import { supabase } from '../lib/supabase';

async function migrateDoctorsTable() {
  console.log('Starting migration for doctors table...');
  
  try {
    // Add new columns to the doctors table
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE doctors
        ADD COLUMN IF NOT EXISTS phone2 TEXT,
        ADD COLUMN IF NOT EXISTS email TEXT,
        ADD COLUMN IF NOT EXISTS registration_number TEXT,
        ADD COLUMN IF NOT EXISTS clinic_name TEXT,
        ADD COLUMN IF NOT EXISTS clinic_address TEXT;
      `
    });
    
    if (error) {
      console.error('Migration failed:', error);
      return;
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error during migration:', err);
  }
}

migrateDoctorsTable();
