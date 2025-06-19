import { NextResponse } from 'next/server';
import { getDoctors } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Use the unified getDoctors function that handles both Supabase and memory store
    const allDoctors = await getDoctors(search);
    
    // Apply pagination
    const paginatedDoctors = allDoctors.slice(offset, offset + limit);
    
    return NextResponse.json({
      data: paginatedDoctors,
      total: allDoctors.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
} 