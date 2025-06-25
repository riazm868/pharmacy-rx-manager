import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LightspeedClient } from '@/lib/lightspeed/client';
import { LightspeedParkSaleService } from '@/lib/lightspeed/parkSale';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('lightspeed_access_token')?.value;
    const domainPrefix = cookieStore.get('lightspeed_domain_prefix')?.value;

    if (!accessToken || !domainPrefix) {
      return NextResponse.json(
        { error: 'Lightspeed not connected. Please connect first.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      prescription,
      medications,
      patient,
      doctor,
      lightspeedCustomerId,
      lightspeedProductIds,
      lightspeedProductPrices,
    } = body;

    // Validate required data
    if (!prescription || !medications || !patient || !doctor) {
      return NextResponse.json(
        { error: 'Missing required prescription data' },
        { status: 400 }
      );
    }

    if (!lightspeedCustomerId) {
      return NextResponse.json(
        { error: 'Patient does not have a Lightspeed customer ID' },
        { status: 400 }
      );
    }

    if (!lightspeedProductIds || Object.keys(lightspeedProductIds).length === 0) {
      return NextResponse.json(
        { error: 'No medications have Lightspeed product IDs' },
        { status: 400 }
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
    await parkSaleService.initialize();

    // Create the parked sale
    const result = await parkSaleService.parkPrescriptionAsSale(
      prescription,
      medications,
      patient,
      doctor,
      lightspeedCustomerId,
      lightspeedProductIds,
      lightspeedProductPrices
    );

    console.log('Parked sale result:', result);

    return NextResponse.json({
      success: true,
      saleId: result.register_sale?.id,
      message: 'Prescription successfully parked as a sale in Lightspeed',
    });
  } catch (error: any) {
    console.error('Error creating parked sale:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create parked sale' },
      { status: 500 }
    );
  }
} 