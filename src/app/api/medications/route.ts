import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/storage/memory-store';
import { getMedications } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Use the unified getMedications function that handles both Supabase and memory store
    const allMedications = await getMedications(search);
    
    // Apply pagination
    const paginatedMedications = allMedications.slice(offset, offset + limit);
    
    return NextResponse.json({
      data: paginatedMedications,
      total: allMedications.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medications' },
      { status: 500 }
    );
  }
} 