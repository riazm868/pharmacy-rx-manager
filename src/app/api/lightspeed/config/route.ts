import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LightspeedClient } from '@/lib/lightspeed/client';
import { LightspeedParkSaleService } from '@/lib/lightspeed/parkSale';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('lightspeed_access_token')?.value;
    const domainPrefix = cookieStore.get('lightspeed_domain_prefix')?.value;
    
    // Get saved preferences
    const preferredRegisterName = cookieStore.get('lightspeed_register_name')?.value || 'Dispensary';
    const preferredUserName = cookieStore.get('lightspeed_user_name')?.value || 'Venetta Pitamber';

    if (!accessToken || !domainPrefix) {
      return NextResponse.json({
        isConfigured: false,
        preferredRegisterName,
        preferredUserName,
        error: 'Lightspeed not connected. Please connect first.'
      });
    }

    const client = new LightspeedClient({
      clientId: process.env.LIGHTSPEED_CLIENT_ID!,
      clientSecret: process.env.LIGHTSPEED_CLIENT_SECRET!,
      redirectUri: process.env.NEXT_PUBLIC_LIGHTSPEED_REDIRECT_URI!,
      domainPrefix: domainPrefix,
      baseUrl: `https://${domainPrefix}.retail.lightspeed.app/api`,
    });

    client.setAccessToken(accessToken, domainPrefix);

    const parkSaleService = new LightspeedParkSaleService(client);
    const config = await parkSaleService.initialize();

    // Also fetch registers for the UI
    const registers = await client.getRegisters();

    return NextResponse.json({
      isConfigured: true,
      preferredRegisterName,
      preferredUserName,
      config: config,
      registers: registers.data.map((r: any) => ({
        id: r.id,
        name: r.name,
        outlet_name: r.outlet?.name || 'Unknown Outlet',
      })),
    });
  } catch (error: any) {
    console.error('Error fetching Lightspeed config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registerName, userName } = body;
    
    const cookieStore = await cookies();
    
    if (registerName) {
      cookieStore.set('lightspeed_register_name', registerName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
    if (userName) {
      cookieStore.set('lightspeed_user_name', userName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
    return NextResponse.json({ 
      success: true,
      config: {
        preferredRegisterName: registerName || cookieStore.get('lightspeed_register_name')?.value || 'Dispensary',
        preferredUserName: userName || cookieStore.get('lightspeed_user_name')?.value || 'Venetta Pitamber',
      }
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
} 