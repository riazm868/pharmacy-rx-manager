import { LightspeedClient } from './client';
import { Prescription, PrescriptionMedication, Patient, Doctor } from '@/types/database';

export interface ParkSaleConfig {
  registerId: string;
  userId: string;
  taxId: string;
  taxRate: number;
  taxName: string;
  taxExclusive: boolean;
}

export class LightspeedParkSaleService {
  private client: LightspeedClient;
  private config: ParkSaleConfig | null = null;

  constructor(client: LightspeedClient) {
    this.client = client;
  }

  async initialize(): Promise<ParkSaleConfig> {
    try {
      console.log('Initializing park sale configuration...');
      
      // Get retailer info for tax settings
      let taxExclusive = false;
      try {
        console.log('Fetching retailer info...');
        const retailer = await this.client.getRetailer();
        console.log('Retailer response:', retailer);
        taxExclusive = retailer.data?.tax_exclusive || retailer.tax_exclusive || false;
      } catch (retailerError) {
        console.warn('Failed to fetch retailer info, using defaults:', retailerError);
        // Continue with default tax exclusive setting
      }

      // Get registers - user should configure which one to use
      console.log('Fetching registers...');
      const registers = await this.client.getRegisters();
      console.log('Registers response:', registers);
      if (!registers.data || registers.data.length === 0) {
        throw new Error('No registers found in Lightspeed');
      }

      // Get primary user
      console.log('Fetching users...');
      const users = await this.client.getUsers();
      console.log('Users response:', users);
      const primaryUser = users.data?.find((u: any) => u.is_primary_user) || users.data?.[0];
      if (!primaryUser) {
        throw new Error('No users found in Lightspeed');
      }

      // Get default tax
      console.log('Fetching taxes...');
      let defaultTax = null;
      try {
        const taxes = await this.client.getTaxes();
        console.log('Taxes response:', taxes);
        defaultTax = taxes.data?.find((t: any) => t.is_default) || taxes.data?.[0];
      } catch (taxError) {
        console.warn('Failed to fetch taxes, using defaults:', taxError);
        // Use default values if tax endpoint fails
        defaultTax = {
          id: 'default',
          name: 'No Tax',
          rate: 0,
        };
      }

      this.config = {
        registerId: registers.data[0].id, // Use first register by default
        userId: primaryUser.id,
        taxId: defaultTax?.id || 'default',
        taxRate: parseFloat(defaultTax?.rate || '0'),
        taxName: defaultTax?.name || 'No Tax',
        taxExclusive: taxExclusive,
      };

      console.log('Park sale configuration initialized:', this.config);
      return this.config;
    } catch (error) {
      console.error('Error initializing park sale config:', error);
      throw error;
    }
  }

  async parkPrescriptionAsSale(
    prescription: Prescription,
    medications: PrescriptionMedication[],
    patient: Patient,
    doctor: Doctor,
    lightspeedCustomerId?: string,
    lightspeedProductIds?: Record<string, string>
  ): Promise<any> {
    if (!this.config) {
      await this.initialize();
    }

    const config = this.config!;
    const saleDate = new Date().toISOString();

    // Build line items
    const lineItems = medications.map((med, index) => {
      const productId = lightspeedProductIds?.[med.medication_id];
      if (!productId) {
        throw new Error(`Lightspeed product ID not found for medication ${med.medication_id}`);
      }

      // Calculate tax based on retailer settings
      const price = med.quantity * 10; // You'll need to determine actual pricing
      const tax = config.taxExclusive 
        ? price * config.taxRate 
        : (price / (1 + config.taxRate)) * config.taxRate;

      return {
        product_id: productId,
        quantity: med.quantity,
        price: price,
        tax: tax,
        tax_id: config.taxId,
        attributes: [
          {
            name: "line_note",
            value: `${med.dose} ${med.route} ${med.frequency} for ${med.days} days. ${med.notes || ''}`
          }
        ]
      };
    });

    // Build sale payload
    const salePayload = {
      register_id: config.registerId,
      user_id: config.userId,
      customer_id: lightspeedCustomerId,
      sale_date: saleDate,
      status: "SAVED", // This parks the sale
      note: `Prescription #${prescription.prescription_number || prescription.id}\nDoctor: ${doctor.name}\nPatient: ${patient.name}`,
      register_sale_products: lineItems,
      // No payments for parked sales
      register_sale_payments: []
    };

    try {
      const result = await this.client.createParkedSale(salePayload);
      console.log('Successfully parked prescription as sale:', result);
      return result;
    } catch (error) {
      console.error('Error parking prescription as sale:', error);
      throw error;
    }
  }
} 