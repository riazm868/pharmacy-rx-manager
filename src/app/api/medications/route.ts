import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LightspeedClient } from '@/lib/lightspeed/client';
import { Medication } from '@/types/database';
import { LightspeedProduct } from '@/types/lightspeed';

export type DisplayMedication = {
  id: string;
  lightspeed_id?: string;
  name: string;
  strength: string;
  count: number;
  price?: number;
  created_at?: string;
  updated_at?: string;
};

const mapLightspeedProductToMedication = (product: LightspeedProduct): DisplayMedication => ({
  id: product.id.toString(),
  lightspeed_id: product.id.toString(),
  name: product.name,
  strength: '', // Lightspeed products don't have a 'strength' field
  count: product.quantity ?? 0,
  price: product.price || 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const page = Math.floor(offset / limit) + 1;

    const cookieStore = await cookies();
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

    const processedData = response.data.map((product: any) => ({
      id: product.id,
      lightspeed_id: product.id,
      name: product.name || 'Unknown Product',
      strength: product.sku || 'N/A',
      count: product.inventory_count || 0,
      price: parseFloat(product.price_including_tax || product.price || '0'), // Use retail price including tax
      created_at: product.created_at,
      updated_at: product.updated_at,
    } as DisplayMedication));

    return NextResponse.json({
      data: processedData,
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