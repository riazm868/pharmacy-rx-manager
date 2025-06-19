import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/storage/memory-store';
import { getPatients } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Use the unified getPatients function that handles both Supabase and memory store
    const allPatients = await getPatients(search);
    
    // Apply pagination
    const paginatedPatients = allPatients.slice(offset, offset + limit);
    
    return NextResponse.json({
      data: paginatedPatients,
      total: allPatients.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
} 