import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LightspeedClient } from '@/lib/lightspeed/client';
import { Medication } from '@/types/database';
import { LightspeedProduct } from '@/types/lightspeed';

export type DisplayMedication = Medication & {
  is_lightspeed_product?: boolean;
  lightspeed_id?: number;
};

const mapLightspeedProductToMedication = (product: LightspeedProduct): DisplayMedication => ({
  id: product.id.toString(),
  name: product.name,
  strength: '', // Lightspeed products don't have a 'strength' field
  count: product.quantity ?? 0,
  manufacturer: '', // Or map from a custom field if you have one
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_lightspeed_product: true,
  lightspeed_id: product.id,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const page = Math.floor(offset / limit) + 1;

    const cookieStore = cookies();
    const accessToken = cookieStore.get('lightspeed_access_token')?.value;
    const domainPrefix = cookieStore.get('lightspeed_domain_prefix')?.value;

    if (!accessToken || !domainPrefix) {
      return NextResponse.json({ data: [], total: 0 });
    }

    const lightspeedClient = new LightspeedClient({
      clientId: process.env.LIGHTSPEED_CLIENT_ID!,
      clientSecret: process.env.LIGHTSPEED_CLIENT_SECRET!,
      redirectUri: process.env.NEXT_PUBLIC_LIGHTSPEED_REDIRECT_URI!,
      domainPrefix: domainPrefix,
      baseUrl: `https://${domainPrefix}.retail.lightspeed.app/api`,
    });

    lightspeedClient.setAccessToken(accessToken, domainPrefix);

    const response = await lightspeedClient.getProducts(search, page, limit);

    const medications: DisplayMedication[] = response.data.map(mapLightspeedProductToMedication);

    return NextResponse.json({
      data: medications,
      total: response.pagination?.count ?? 0,
    });

  } catch (error: any) {
    console.error('Error fetching medications from Lightspeed:', error.message);
    if (error.message.includes('token')) {
      return NextResponse.json({ error: 'Lightspeed authentication error.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch medications.' }, { status: 500 });
  }
} 