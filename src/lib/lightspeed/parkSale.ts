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

      // Get registers and find "Dispensary"
      console.log('Fetching registers...');
      const registers = await this.client.getRegisters();
      console.log('Registers response:', registers);
      
      const dispensaryRegister = registers.data?.find((r: any) => 
        r.name === 'Dispensary' || r.register_name === 'Dispensary'
      );
      
      if (!dispensaryRegister) {
        console.error('Available registers:', registers.data?.map((r: any) => ({ id: r.id, name: r.name || r.register_name })));
        throw new Error('Dispensary register not found in Lightspeed');
      }
      
      console.log('Found Dispensary register:', dispensaryRegister);

      // Get users and find Venetta Pitamber
      console.log('Fetching users...');
      const users = await this.client.getUsers();
      console.log('Users response:', users);
      
      const venettaUser = users.data?.find((u: any) => 
        u.display_name === 'Venetta Pitamber' || 
        (u.first_name === 'Venetta' && u.last_name === 'Pitamber')
      );
      
      if (!venettaUser) {
        console.error('Available users:', users.data?.map((u: any) => ({ id: u.id, display_name: u.display_name })));
        throw new Error('User Venetta Pitamber not found in Lightspeed');
      }
      
      console.log('Found user Venetta Pitamber:', venettaUser);

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
        registerId: dispensaryRegister.id,
        userId: venettaUser.id,
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
    lightspeedProductIds?: Record<string, string>,
    lightspeedProductPrices?: Record<string, number>
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

      // Get price from Lightspeed product data or use a default
      const unitPrice = lightspeedProductPrices?.[med.medication_id] || 0;
      const totalPrice = med.quantity * unitPrice;
      
      // Calculate tax amount from tax-inclusive price
      // If tax is inclusive, we need to extract the tax amount from the total
      let taxAmount = 0;
      let priceExcludingTax = totalPrice;
      
      if (!config.taxExclusive && config.taxRate > 0) {
        // Tax is included in price, so extract it
        // Formula: tax = totalPrice - (totalPrice / (1 + taxRate))
        priceExcludingTax = totalPrice / (1 + config.taxRate);
        taxAmount = totalPrice - priceExcludingTax;
      } else if (config.taxExclusive && config.taxRate > 0) {
        // Tax is exclusive, add it on top
        taxAmount = totalPrice * config.taxRate;
      }

      return {
        product_id: productId,
        quantity: med.quantity,
        price: priceExcludingTax, // Price without tax for Lightspeed
        tax: taxAmount,
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