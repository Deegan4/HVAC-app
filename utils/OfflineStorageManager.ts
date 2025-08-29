import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, Customer, Invoice } from '@/types';

export interface OfflineData {
  jobs: Job[];
  customers: Customer[];
  invoices: Invoice[];
  photos: { [key: string]: string }; // jobId -> photo URI
  signatures: { [key: string]: string }; // jobId -> signature SVG
  lastSync: string;
}

export interface PendingSync {
  id: string;
  type: 'job_update' | 'photo_upload' | 'signature_upload' | 'new_job' | 'new_customer';
  data: any;
  timestamp: string;
  retryCount: number;
}

const STORAGE_KEYS = {
  OFFLINE_DATA: '@oliva_offline_data',
  PENDING_SYNC: '@oliva_pending_sync',
  LAST_SYNC: '@oliva_last_sync',
} as const;

class OfflineStorageManager {
  private static instance: OfflineStorageManager;

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  // Save offline data
  async saveOfflineData(data: Partial<OfflineData>): Promise<void> {
    try {
      const existingData = await this.getOfflineData();
      const updatedData: OfflineData = {
        ...existingData,
        ...data,
        lastSync: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(updatedData));
      console.log('Offline data saved successfully');
    } catch (error) {
      console.error('Error saving offline data:', error);
      throw error;
    }
  }

  // Get offline data
  async getOfflineData(): Promise<OfflineData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
      if (data) {
        return JSON.parse(data);
      }
      
      // Return default structure if no data exists
      return {
        jobs: [],
        customers: [],
        invoices: [],
        photos: {},
        signatures: {},
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting offline data:', error);
      return {
        jobs: [],
        customers: [],
        invoices: [],
        photos: {},
        signatures: {},
        lastSync: new Date().toISOString(),
      };
    }
  }

  // Save job photo
  async saveJobPhoto(jobId: string, photoUri: string): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      offlineData.photos[jobId] = photoUri;
      await this.saveOfflineData(offlineData);
      
      // Add to pending sync
      await this.addToPendingSync({
        id: `photo_${jobId}_${Date.now()}`,
        type: 'photo_upload',
        data: { jobId, photoUri },
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
    } catch (error) {
      console.error('Error saving job photo:', error);
      throw error;
    }
  }

  // Save job signature
  async saveJobSignature(jobId: string, signatureSvg: string): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      offlineData.signatures[jobId] = signatureSvg;
      await this.saveOfflineData(offlineData);
      
      // Add to pending sync
      await this.addToPendingSync({
        id: `signature_${jobId}_${Date.now()}`,
        type: 'signature_upload',
        data: { jobId, signatureSvg },
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
    } catch (error) {
      console.error('Error saving job signature:', error);
      throw error;
    }
  }

  // Get job photo
  async getJobPhoto(jobId: string): Promise<string | null> {
    try {
      const offlineData = await this.getOfflineData();
      return offlineData.photos[jobId] || null;
    } catch (error) {
      console.error('Error getting job photo:', error);
      return null;
    }
  }

  // Get job signature
  async getJobSignature(jobId: string): Promise<string | null> {
    try {
      const offlineData = await this.getOfflineData();
      return offlineData.signatures[jobId] || null;
    } catch (error) {
      console.error('Error getting job signature:', error);
      return null;
    }
  }

  // Update job offline
  async updateJobOffline(job: Job): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      const jobIndex = offlineData.jobs.findIndex(j => j.id === job.id);
      
      if (jobIndex >= 0) {
        offlineData.jobs[jobIndex] = job;
      } else {
        offlineData.jobs.push(job);
      }
      
      await this.saveOfflineData(offlineData);
      
      // Add to pending sync
      await this.addToPendingSync({
        id: `job_${job.id}_${Date.now()}`,
        type: 'job_update',
        data: job,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
    } catch (error) {
      console.error('Error updating job offline:', error);
      throw error;
    }
  }

  // Add customer offline
  async addCustomerOffline(customer: Customer): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      const existingIndex = offlineData.customers.findIndex(c => c.id === customer.id);
      
      if (existingIndex >= 0) {
        offlineData.customers[existingIndex] = customer;
      } else {
        offlineData.customers.push(customer);
      }
      
      await this.saveOfflineData(offlineData);
      
      // Add to pending sync
      await this.addToPendingSync({
        id: `customer_${customer.id}_${Date.now()}`,
        type: 'new_customer',
        data: customer,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
    } catch (error) {
      console.error('Error adding customer offline:', error);
      throw error;
    }
  }

  // Pending sync operations
  async addToPendingSync(operation: PendingSync): Promise<void> {
    try {
      const pendingOps = await this.getPendingSync();
      pendingOps.push(operation);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pendingOps));
    } catch (error) {
      console.error('Error adding to pending sync:', error);
    }
  }

  async getPendingSync(): Promise<PendingSync[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending sync:', error);
      return [];
    }
  }

  async removePendingSync(operationId: string): Promise<void> {
    try {
      const pendingOps = await this.getPendingSync();
      const filteredOps = pendingOps.filter(op => op.id !== operationId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(filteredOps));
    } catch (error) {
      console.error('Error removing pending sync:', error);
    }
  }

  async clearPendingSync(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    } catch (error) {
      console.error('Error clearing pending sync:', error);
    }
  }

  // Network status and sync
  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  async setLastSyncTime(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Error setting last sync time:', error);
    }
  }

  // Clear all offline data (for debugging or reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.OFFLINE_DATA,
        STORAGE_KEYS.PENDING_SYNC,
        STORAGE_KEYS.LAST_SYNC,
      ]);
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  // Get storage info for debugging
  async getStorageInfo(): Promise<{
    offlineDataSize: number;
    pendingSyncCount: number;
    lastSync: string | null;
  }> {
    try {
      const offlineData = await this.getOfflineData();
      const pendingSync = await this.getPendingSync();
      const lastSync = await this.getLastSyncTime();
      
      return {
        offlineDataSize: JSON.stringify(offlineData).length,
        pendingSyncCount: pendingSync.length,
        lastSync,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        offlineDataSize: 0,
        pendingSyncCount: 0,
        lastSync: null,
      };
    }
  }
}

export default OfflineStorageManager;