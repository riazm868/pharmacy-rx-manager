import { LightspeedOAuthConfig, LightspeedApiResponse, LightspeedProduct, LightspeedCustomer, LightspeedTokenResponse } from '@/types/lightspeed';

export class LightspeedClient {
  private config: LightspeedOAuthConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;
  private domainPrefix: string | null = null;

  constructor(config: LightspeedOAuthConfig) {
    this.config = config;
  }

  // Set access token directly (for when we already have a token)
  public setAccessToken(token: string, domainPrefix: string): void {
    this.accessToken = token;
    this.domainPrefix = domainPrefix;
    this.tokenExpiry = Date.now() + (60 * 60 * 1000); // Assume 1 hour expiry
  }

  // Step 1: Get the authorization URL
  public getAuthUrl(state: string = ''): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
    });
    return `https://secure.retail.lightspeed.app/connect?${params.toString()}`;
  }

  // Step 2: Exchange code for token
  public async exchangeCodeForToken(code: string, domainPrefix: string): Promise<LightspeedTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    });
    
    // Use the domain-specific token endpoint for Lightspeed X-Series
    const url = `https://${domainPrefix}.retail.lightspeed.app/api/1.0/token`;
    
    console.log('Exchanging code for token:', {
      url,
      params: {
        grant_type: params.get('grant_type'),
        code: params.get('code'),
        client_id: params.get('client_id'),
        redirect_uri: params.get('redirect_uri'),
        // Don't log the secret
      },
      domainPrefix
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Lightspeed token error:');
      console.error('Status:', response.status, response.statusText);
      console.error('Headers:', Object.fromEntries(response.headers.entries()));
      console.error('Body:', responseText);
      throw new Error(`Failed to exchange code for token: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse token response:', responseText);
      throw new Error('Invalid JSON response from token endpoint');
    }
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
    this.domainPrefix = domainPrefix;
    return tokenData;
  }

  // Step 3: Refresh token
  public async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken || !this.domainPrefix) {
      throw new Error('No refresh token or domain prefix available');
    }
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    });
    const url = `https://${this.domainPrefix}.retail.lightspeed.app/api/1.0/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lightspeed refresh token error:', errorText);
      throw new Error('Failed to refresh token');
    }
    const tokenData = await response.json();
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }
  }

  private getApiBase(): string {
    if (!this.domainPrefix) throw new Error('Domain prefix not set');
    return `https://${this.domainPrefix}.retail.lightspeed.app/api/2.0`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.ensureValidToken();
    const url = `${this.getApiBase()}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const response = await fetch(url, {
      ...options,
      headers,
    });
    if (!response.ok) {
      throw new Error(`Lightspeed API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getProducts(page: number = 1, limit: number = 100): Promise<LightspeedApiResponse<LightspeedProduct>> {
    return this.request<LightspeedApiResponse<LightspeedProduct>>(
      `/products?page=${page}&limit=${limit}`
    );
  }

  async getCustomers(page: number = 1, limit: number = 100): Promise<LightspeedApiResponse<LightspeedCustomer>> {
    return this.request<LightspeedApiResponse<LightspeedCustomer>>(
      `/customers?page=${page}&limit=${limit}`
    );
  }
} 