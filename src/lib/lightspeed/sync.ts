import { LightspeedClient } from './client';
import { LightspeedProduct, LightspeedCustomer } from '@/types/lightspeed';
import { Medication, Patient } from '@/types/database';
import { memoryStore } from '@/lib/storage/memory-store';

export class LightspeedSyncService {
  private client: LightspeedClient;

  constructor(client: LightspeedClient) {
    this.client = client;
  }

  async syncProducts(): Promise<number> {
    let page = 1;
    let hasMore = true;
    let totalSynced = 0;

    // Clear only medications before sync
    memoryStore.clearMedications();

    while (hasMore) {
      const response = await this.client.getProducts(page);
      const products = response.data;

      for (const product of products) {
        // Map Lightspeed product to our medication
        const medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'> = {
          name: product.name,
          strength: '', // Default empty, can be parsed from name if needed
          count: product.quantity || 0,
          manufacturer: product.description || '',
        };

        try {
          await memoryStore.createMedication(medication);
          console.log('Synced product:', medication);
          totalSynced++;
        } catch (error) {
          console.error('Failed to sync product:', error);
        }
      }

      // Check if we have more pages
      hasMore = Boolean(response.pagination && page < response.pagination.pages);
      if (hasMore) {
      page++;
    }
  }

    return totalSynced;
  }

  async syncCustomers(): Promise<number> {
    let page = 1;
    let hasMore = true;
    let totalSynced = 0;

    // Clear only patients before sync
    memoryStore.clearPatients();

    while (hasMore) {
      const response = await this.client.getCustomers(page);
      const customers = response.data;

      for (const customer of customers) {
        // Debug: Log the actual customer object to see the field names
        console.log('Raw customer data:', JSON.stringify(customer, null, 2));
        
        // Map Lightspeed customer to our patient
        const patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'> = {
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.name || 'Unknown',
          phone: customer.mobile || customer.phone || '',
          email: customer.email || '',
          dob: customer.date_of_birth || '',
          gender: customer.gender || '',
          id_number: customer.customer_code || '',
          dp_number: '',
          birth_cert_pin: '',
          phone2: customer.phone || '',
          address: customer.physical_address_1 || '',
          city: customer.physical_city || '',
          state: customer.physical_state || '',
          zip: customer.physical_postcode || '',
        };

        try {
          await memoryStore.createPatient(patient);
          console.log('Synced customer:', patient);
          totalSynced++;
        } catch (error) {
          console.error('Failed to sync customer:', error);
        }
      }

      // Check if we have more pages
      hasMore = Boolean(response.pagination && page < response.pagination.pages);
      if (hasMore) {
      page++;
      }
    }
    
    return totalSynced;
  }
} 