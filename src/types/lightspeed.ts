export type LightspeedProduct = {
  id: number;
  name: string;
  systemSku: string;
  description?: string;
  price?: number;
  quantity?: number;
};

export type LightspeedCustomer = {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  customer_code: string;
  phone?: string;
  mobile?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  physical_address_1?: string;
  physical_address_2?: string;
  physical_city?: string;
  physical_state?: string;
  physical_postcode?: string;
  // Legacy camelCase fields for backward compatibility
  firstName?: string;
  lastName?: string;
  customerCode?: string;
};

export type LightspeedOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  domainPrefix: string;
  baseUrl: string;
};

export type LightspeedTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export type LightspeedApiResponse<T> = {
  data: T[];
  pagination?: {
    count: number;
    page: number;
    pages: number;
  };
}; 