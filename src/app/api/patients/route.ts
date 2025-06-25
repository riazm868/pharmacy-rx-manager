import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Patient } from '@/types/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    console.log('Patient API called with:', { search, limit, offset });

    // Fetch from local database
    let query = supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,id_number.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: patients, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }

    return NextResponse.json(patients || []);

  } catch (error: any) {
    console.error('Error fetching patients:', error.message);
    return NextResponse.json({ error: 'Failed to fetch patients.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const patientData = await request.json();
    
    // Create new patient
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating patient:', error.message);
    return NextResponse.json({ error: 'Failed to create patient.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
    }

    const patientData = await request.json();

    // Check if this is a Lightspeed-synced patient
    const { data: existingPatient, error: fetchError } = await supabase
      .from('patients')
      .select('lightspeed_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching patient:', fetchError);
      throw fetchError;
    }

    // Prevent editing core Lightspeed data
    if (existingPatient?.lightspeed_id) {
      // Remove lightspeed_id from update data to prevent tampering
      const { lightspeed_id, ...safeUpdateData } = patientData;
      
      console.log('Updating Lightspeed-synced patient with protected fields');
      
      const { data, error } = await supabase
        .from('patients')
        .update(safeUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(data);
    } else {
      // Regular patient - allow full updates
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(data);
    }

  } catch (error: any) {
    console.error('Error updating patient:', error.message);
    return NextResponse.json({ error: 'Failed to update patient.' }, { status: 500 });
  }
} 