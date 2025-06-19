import { NextResponse } from 'next/server';
import { LightspeedClient } from '@/lib/lightspeed/client';

function generateState(length = 16) {
  return Array(length)
    .fill(0)
    .map(() => Math.random().toString(36).charAt(2))
    .join('');
}

export async function GET(request: Request) {
  // Debug: Log the environment variables
  console.log('Environment check:', {
    clientId: process.env.LIGHTSPEED_CLIENT_ID ? 'Set' : 'Not set',
    clientIdValue: process.env.LIGHTSPEED_CLIENT_ID?.substring(0, 10) + '...',
    clientSecret: process.env.LIGHTSPEED_CLIENT_SECRET ? 'Set' : 'Not set',
    redirectUri: process.env.LIGHTSPEED_REDIRECT_URI || 'Using default',
  });
  
const client = new LightspeedClient({
  clientId: process.env.LIGHTSPEED_CLIENT_ID || '',
  clientSecret: process.env.LIGHTSPEED_CLIENT_SECRET || '',
    redirectUri: process.env.LIGHTSPEED_REDIRECT_URI || 'http://localhost:3004/api/lightspeed/auth',
  domainPrefix: '', // Not needed for initial auth
  baseUrl: '', // Not needed for initial auth
});
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const domainPrefix = searchParams.get('domain_prefix');
    const state = searchParams.get('state');

    if (code && domainPrefix) {
      // (Optional) Verify state from cookie/session here for CSRF protection
      // ...
      const tokenData = await client.exchangeCodeForToken(code, domainPrefix);
      
      // Store the token in a cookie
      const response = NextResponse.redirect(new URL('/lightspeed/success', request.url));
      response.cookies.set('lightspeed_token', JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        domain_prefix: domainPrefix,
        expires_in: tokenData.expires_in,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokenData.expires_in || 3600, // Use token expiry or default to 1 hour
      });
      
      return response;
    } else {
      // Generate a secure random state
      const generatedState = generateState(16);
      // (Optional) Set state in cookie for later verification
      const authUrl = client.getAuthUrl(generatedState);
      const response = NextResponse.redirect(authUrl);
      response.headers.set('Set-Cookie', `lightspeed_state=${generatedState}; Path=/; HttpOnly; SameSite=Lax`);
      return response;
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Lightspeed' },
      { status: 500 }
    );
  }
} 