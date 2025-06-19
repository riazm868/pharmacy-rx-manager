import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LightspeedClient } from '@/lib/lightspeed/client';
import { LightspeedSyncService } from '@/lib/lightspeed/sync';

export async function POST(request: Request) {
  try {
    // Make the request body optional
    let type: string | undefined;
    try {
      const body = await request.json();
      type = body.type;
    } catch {
      // No body provided, sync both
      type = undefined;
    }
    
    // Get the stored tokens from cookies or session
    const cookieStore = await cookies();
    const tokenData = cookieStore.get('lightspeed_token');
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Not authenticated with Lightspeed' },
        { status: 401 }
      );
    }
    
    // Parse the token data
    const { access_token, domain_prefix } = JSON.parse(tokenData.value);
    
    // Initialize the Lightspeed client with the stored token
    const client = new LightspeedClient({
      clientId: process.env.LIGHTSPEED_CLIENT_ID || '',
      clientSecret: process.env.LIGHTSPEED_CLIENT_SECRET || '',
      redirectUri: process.env.LIGHTSPEED_REDIRECT_URI || '',
      domainPrefix: domain_prefix,
      baseUrl: '',
    });
    
    // Set the access token directly
    client.setAccessToken(access_token, domain_prefix);
    
    const syncService = new LightspeedSyncService(client);
    
    let products = 0;
    let customers = 0;
    
    if (!type || type === 'products') {
      products = await syncService.syncProducts();
    }
    
    if (!type || type === 'customers') {
      customers = await syncService.syncCustomers();
    }
    
    if (type && type !== 'products' && type !== 'customers') {
      return NextResponse.json(
        { error: 'Invalid sync type. Must be "products" or "customers"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      products,
      customers,
      count: products + customers 
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Lightspeed' },
      { status: 500 }
    );
  }
} 