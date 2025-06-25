import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LightspeedClient } from '@/lib/lightspeed/client';
import { Patient } from '@/types/database';
import { LightspeedCustomer } from '@/types/lightspeed';

// This type can be used on the frontend. It extends the base Patient type
// with fields that are relevant for the UI when dealing with Lightspeed data.
export type DisplayPatient = Patient & {
  is_lightspeed_customer?: boolean;
  lightspeed_id?: string;
};

// Helper to map Lightspeed customer to our Patient format
const mapLightspeedCustomerToPatient = (customer: LightspeedCustomer): DisplayPatient => ({
  id: customer.id,
  name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
  email: customer.email ?? '',
  phone: customer.phone ?? customer.mobile ?? '',
  address: [customer.physical_address_1, customer.physical_city, customer.physical_state, customer.physical_postcode]
    .filter(Boolean)
    .join(', '),
  dob: customer.date_of_birth ?? '',
  id_number: customer.id.toString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_lightspeed_customer: true,
  lightspeed_id: customer.id,
  // Default values for fields not in Lightspeed
  gender: customer.gender ?? 'Unknown',
  dp_number: '',
  birth_cert_pin: '',
  phone2: '',
  city: customer.physical_city ?? '',
  state: customer.physical_state ?? '',
  zip: customer.physical_postcode ?? '',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const page = Math.floor(offset / limit) + 1;

    console.log('Patient API called with:', { search, limit, offset, page });

    const cookieStore = cookies();
    const accessToken = cookieStore.get('lightspeed_access_token')?.value;
    const domainPrefix = cookieStore.get('lightspeed_domain_prefix')?.value;

    console.log('Cookies found:', { 
      hasAccessToken: !!accessToken, 
      hasDomainPrefix: !!domainPrefix,
      domainPrefix 
    });

    if (!accessToken || !domainPrefix) {
      console.log('No Lightspeed credentials found in cookies');
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

    console.log('Calling Lightspeed API...');
    const response = await lightspeedClient.getCustomers(search, page, limit);
    console.log('Lightspeed response:', { 
      dataCount: response.data?.length || 0, 
      total: response.pagination?.count || 0 
    });

    const patients: DisplayPatient[] = response.data.map(mapLightspeedCustomerToPatient);

    return NextResponse.json({
      data: patients,
      total: response.pagination?.count ?? 0,
    });

  } catch (error: any) {
    console.error('Error fetching patients from Lightspeed:', error.message);
    console.error('Full error:', error);
    if (error.message.includes('token')) {
      return NextResponse.json({ error: 'Lightspeed authentication error.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch patients.' }, { status: 500 });
  }
} 