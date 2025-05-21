import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Simple query to test the connection
    const { data, error, count } = await supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to connect to Supabase', 
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to Supabase', 
      data 
    });
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing Supabase connection', 
      error: String(error) 
    }, { status: 500 });
  }
}
