import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LightspeedClient } from '@/lib/lightspeed/client';
import { LightspeedParkSaleService } from '@/lib/lightspeed/parkSale';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('lightspeed_access_token')?.value;
    const domainPrefix = cookieStore.get('lightspeed_domain_prefix')?.value;

    if (!accessToken || !domainPrefix) {
      return NextResponse.json(
        { error: 'Lightspeed not connected. Please connect first.' },
        { status: 401 }
      );
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