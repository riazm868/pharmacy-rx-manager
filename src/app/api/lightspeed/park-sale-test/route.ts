import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LightspeedClient } from '@/lib/lightspeed/client';
import { LightspeedParkSaleService } from '@/lib/lightspeed/parkSale';

export async function POST(request: Request) {
  try {
    const { registerId } = await request.json();
    
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

    // First, get a real product to use in the test
    console.log('Fetching products for test...');
    const products = await client.getProducts('', 1, 1); // Get first product
    
    if (!products.data || products.data.length === 0) {
      return NextResponse.json(
        { error: 'No products found in Lightspeed. Please add products first.' },
        { status: 400 }
      );
    }

    const testProduct = products.data[0];
    console.log('Using product for test:', testProduct);

    // Get tax info from config
    const parkSaleService = new LightspeedParkSaleService(client);
    const config = await parkSaleService.initialize();

    // Create test data for a parked sale
    const testSaleData = {
      register_id: registerId || config.registerId,
      user_id: config.userId,
      sale_date: new Date().toISOString(),
      status: "SAVED", // This parks the sale
      note: "Test prescription from pharmacy system\nThis is a test - please void this sale",
      register_sale_products: [
        {
          product_id: testProduct.id,
          quantity: 1,
          price: testProduct.price || 10.00,
          tax: config.taxExclusive 
            ? (testProduct.price || 10.00) * config.taxRate 
            : ((testProduct.price || 10.00) / (1 + config.taxRate)) * config.taxRate,
          tax_id: config.taxId,
        }
      ],
      register_sale_payments: [] // No payments for parked sales
    };

    console.log('Creating test parked sale:', testSaleData);

    const result = await client.createParkedSale(testSaleData);

    return NextResponse.json({
      success: true,
      sale: result,
      message: 'Test sale parked successfully!'
    });
  } catch (error: any) {
    console.error('Error parking test sale:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to park test sale' },
      { status: 500 }
    );
  }
} 