import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, Customer, Invoice } from '@/types';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface OfflineData {
  jobs: Job[];
  customers: Customer[];
  invoices: Invoice[];
  photos: { [key: string]: string };
  signatures: { [key: string]: string };
  lastSync: string;
  version: number;
}

export interface PendingSync {
  id: string;
  type: 'job_update' | 'job_create' | 'invoice_update' | 'invoice_create' | 'photo_upload' | 'signature_upload' | 'customer_create' | 'customer_update';
  data: any;
  timestamp: string;
  retryCount: number;
  priority: 'high' | 'normal' | 'low';
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
  lastAttempt?: string;
}

export interface SyncConflict {
  id: string;
  type: 'job' | 'invoice' | 'customer';
  localData: any;
  serverData: any;
  timestamp: string;
  resolved: boolean;
  resolution?: 'local' | 'server' | 'merge';
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingCount: number;
  failedCount: number;
  conflictCount: number;
  nextSyncTime?: string;
}

const STORAGE_KEYS = {
  OFFLINE_DATA: '@oliva_offline_data',
  PENDING_SYNC: '@oliva_pending_sync',
  LAST_SYNC: '@oliva_last_sync',
  SYNC_CONFLICTS: '@oliva_sync_conflicts',
  SYNC_STATUS: '@oliva_sync_status',
  NETWORK_QUEUE: '@oliva_network_queue',
} as const;

const SYNC_INTERVAL = 5 * 60 * 1000;
const MAX_RETRY_COUNT = 3;

class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private isSyncing: boolean = false;
  private isOnline: boolean = true;
  private syncListeners: ((status: SyncStatus) => void)[] = [];

  private constructor() {
    this.initializeNetworkListener();
    this.startBackgroundSync();
  }

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  private async initializeNetworkListener(): Promise<void> {
    try {
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected ?? false;
      console.log('Initial network state:', this.isOnline ? 'online' : 'offline');

      NetInfo.addEventListener((state: NetInfoState) => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected ?? false;
        console.log('Network state changed:', this.isOnline ? 'online' : 'offline');

        if (!wasOnline && this.isOnline) {
          console.log('Connection restored, triggering sync...');
          this.syncPendingOperations();
        }

        this.notifySyncListeners();
      });
    } catch (error) {
      console.error('Error initializing network listener:', error);
    }
  }

  private startBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        console.log('Background sync triggered');
        this.syncPendingOperations();
      }
    }, SYNC_INTERVAL);

    console.log('Background sync started with interval:', SYNC_INTERVAL / 1000, 'seconds');
  }

  public stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Background sync stopped');
    }
  }

  public addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    this.notifySyncListeners();
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private async notifySyncListeners(): Promise<void> {
    const status = await this.getSyncStatus();
    this.syncListeners.forEach(listener => listener(status));
  }

  public async getSyncStatus(): Promise<SyncStatus> {
    try {
      const pendingOps = await this.getPendingSync();
      const conflicts = await this.getSyncConflicts();
      const lastSync = await this.getLastSyncTime();

      return {
        isOnline: this.isOnline,
        isSyncing: this.isSyncing,
        lastSyncTime: lastSync,
        pendingCount: pendingOps.filter(op => op.status === 'pending').length,
        failedCount: pendingOps.filter(op => op.status === 'failed').length,
        conflictCount: conflicts.filter(c => !c.resolved).length,
        nextSyncTime: this.syncInterval ? new Date(Date.now() + SYNC_INTERVAL).toISOString() : undefined,
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        isOnline: this.isOnline,
        isSyncing: false,
        lastSyncTime: null,
        pendingCount: 0,
        failedCount: 0,
        conflictCount: 0,
      };
    }
  }

  async saveOfflineData(data: Partial<OfflineData>): Promise<void> {
    try {
      const existingData = await this.getOfflineData();
      const updatedData: OfflineData = {
        ...existingData,
        ...data,
        lastSync: new Date().toISOString(),
        version: (existingData.version || 0) + 1,
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(updatedData));
      console.log('Offline data saved successfully, version:', updatedData.version);
    } catch (error) {
      console.error('Error saving offline data:', error);
      throw error;
    }
  }

  async getOfflineData(): Promise<OfflineData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
      if (data) {
        return JSON.parse(data);
      }
      
      return {
        jobs: [],
        customers: [],
        invoices: [],
        photos: {},
        signatures: {},
        lastSync: new Date().toISOString(),
        version: 0,
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
        version: 0,
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
        priority: 'normal',
        status: 'pending',
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
        priority: 'normal',
        status: 'pending',
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

  async updateJobOffline(job: Job, isNew: boolean = false): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      const jobIndex = offlineData.jobs.findIndex(j => j.id === job.id);
      
      if (jobIndex >= 0) {
        offlineData.jobs[jobIndex] = job;
      } else {
        offlineData.jobs.push(job);
      }
      
      await this.saveOfflineData(offlineData);
      
      await this.addToPendingSync({
        id: `job_${job.id}_${Date.now()}`,
        type: isNew ? 'job_create' : 'job_update',
        data: job,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: job.priority === 'emergency' ? 'high' : 'normal',
        status: 'pending',
      });

      console.log(`Job ${isNew ? 'created' : 'updated'} offline:`, job.id);
    } catch (error) {
      console.error('Error updating job offline:', error);
      throw error;
    }
  }

  async updateInvoiceOffline(invoice: Invoice, isNew: boolean = false): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      const invoiceIndex = offlineData.invoices.findIndex(i => i.id === invoice.id);
      
      if (invoiceIndex >= 0) {
        offlineData.invoices[invoiceIndex] = invoice;
      } else {
        offlineData.invoices.push(invoice);
      }
      
      await this.saveOfflineData(offlineData);
      
      await this.addToPendingSync({
        id: `invoice_${invoice.id}_${Date.now()}`,
        type: isNew ? 'invoice_create' : 'invoice_update',
        data: invoice,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: 'normal',
        status: 'pending',
      });

      console.log(`Invoice ${isNew ? 'created' : 'updated'} offline:`, invoice.id);
    } catch (error) {
      console.error('Error updating invoice offline:', error);
      throw error;
    }
  }

  async addCustomerOffline(customer: Customer, isNew: boolean = true): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      const existingIndex = offlineData.customers.findIndex(c => c.id === customer.id);
      
      if (existingIndex >= 0) {
        offlineData.customers[existingIndex] = customer;
      } else {
        offlineData.customers.push(customer);
      }
      
      await this.saveOfflineData(offlineData);
      
      await this.addToPendingSync({
        id: `customer_${customer.id}_${Date.now()}`,
        type: isNew ? 'customer_create' : 'customer_update',
        data: customer,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: 'normal',
        status: 'pending',
      });

      console.log(`Customer ${isNew ? 'created' : 'updated'} offline:`, customer.id);
    } catch (error) {
      console.error('Error adding customer offline:', error);
      throw error;
    }
  }

  async addToPendingSync(operation: PendingSync): Promise<void> {
    try {
      const pendingOps = await this.getPendingSync();
      pendingOps.push(operation);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pendingOps));
      console.log('Added to pending sync:', operation.type, operation.id);
      
      this.notifySyncListeners();
      
      if (this.isOnline && !this.isSyncing) {
        setTimeout(() => this.syncPendingOperations(), 1000);
      }
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
      console.log('Removed from pending sync:', operationId);
      this.notifySyncListeners();
    } catch (error) {
      console.error('Error removing pending sync:', error);
    }
  }

  async updatePendingSyncStatus(operationId: string, status: PendingSync['status'], error?: string): Promise<void> {
    try {
      const pendingOps = await this.getPendingSync();
      const operation = pendingOps.find(op => op.id === operationId);
      
      if (operation) {
        operation.status = status;
        operation.lastAttempt = new Date().toISOString();
        if (error) {
          operation.error = error;
        }
        if (status === 'failed') {
          operation.retryCount++;
        }
        
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pendingOps));
        console.log('Updated pending sync status:', operationId, status);
        this.notifySyncListeners();
      }
    } catch (error) {
      console.error('Error updating pending sync status:', error);
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

  async getStorageInfo(): Promise<{
    offlineDataSize: number;
    pendingSyncCount: number;
    lastSync: string | null;
    conflictCount: number;
    isOnline: boolean;
    isSyncing: boolean;
  }> {
    try {
      const offlineData = await this.getOfflineData();
      const pendingSync = await this.getPendingSync();
      const conflicts = await this.getSyncConflicts();
      const lastSync = await this.getLastSyncTime();
      
      return {
        offlineDataSize: JSON.stringify(offlineData).length,
        pendingSyncCount: pendingSync.length,
        lastSync,
        conflictCount: conflicts.filter(c => !c.resolved).length,
        isOnline: this.isOnline,
        isSyncing: this.isSyncing,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        offlineDataSize: 0,
        pendingSyncCount: 0,
        lastSync: null,
        conflictCount: 0,
        isOnline: this.isOnline,
        isSyncing: false,
      };
    }
  }

  async syncPendingOperations(): Promise<void> {
    if (this.isSyncing || !this.isOnline) {
      console.log('Sync skipped:', this.isSyncing ? 'already syncing' : 'offline');
      return;
    }

    this.isSyncing = true;
    this.notifySyncListeners();
    console.log('Starting sync of pending operations...');

    try {
      const pendingOps = await this.getPendingSync();
      const sortedOps = pendingOps
        .filter(op => op.status === 'pending' || (op.status === 'failed' && op.retryCount < MAX_RETRY_COUNT))
        .sort((a, b) => {
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

      console.log(`Found ${sortedOps.length} operations to sync`);

      for (const operation of sortedOps) {
        try {
          await this.updatePendingSyncStatus(operation.id, 'syncing');
          
          await this.syncOperation(operation);
          
          await this.removePendingSync(operation.id);
          console.log('Successfully synced operation:', operation.id);
        } catch (error) {
          console.error('Error syncing operation:', operation.id, error);
          await this.updatePendingSyncStatus(
            operation.id,
            'failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      await this.setLastSyncTime(new Date().toISOString());
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.isSyncing = false;
      this.notifySyncListeners();
    }
  }

  private async syncOperation(operation: PendingSync): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Simulating sync for operation:', operation.type, operation.id);
    
    const shouldFail = Math.random() < 0.1;
    if (shouldFail) {
      throw new Error('Simulated sync failure');
    }
  }

  async getSyncConflicts(): Promise<SyncConflict[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_CONFLICTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sync conflicts:', error);
      return [];
    }
  }

  async addSyncConflict(conflict: Omit<SyncConflict, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    try {
      const conflicts = await this.getSyncConflicts();
      const newConflict: SyncConflict = {
        ...conflict,
        id: `conflict_${Date.now()}`,
        timestamp: new Date().toISOString(),
        resolved: false,
      };
      
      conflicts.push(newConflict);
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_CONFLICTS, JSON.stringify(conflicts));
      console.log('Added sync conflict:', newConflict.id);
      this.notifySyncListeners();
    } catch (error) {
      console.error('Error adding sync conflict:', error);
    }
  }

  async resolveSyncConflict(
    conflictId: string,
    resolution: 'local' | 'server' | 'merge',
    mergedData?: any
  ): Promise<void> {
    try {
      const conflicts = await this.getSyncConflicts();
      const conflict = conflicts.find(c => c.id === conflictId);
      
      if (!conflict) {
        throw new Error('Conflict not found');
      }

      conflict.resolved = true;
      conflict.resolution = resolution;

      const dataToUse = resolution === 'local' ? conflict.localData :
                        resolution === 'server' ? conflict.serverData :
                        mergedData;

      if (conflict.type === 'job') {
        await this.updateJobOffline(dataToUse, false);
      } else if (conflict.type === 'invoice') {
        await this.updateInvoiceOffline(dataToUse, false);
      } else if (conflict.type === 'customer') {
        await this.addCustomerOffline(dataToUse, false);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_CONFLICTS, JSON.stringify(conflicts));
      console.log('Resolved sync conflict:', conflictId, 'using', resolution);
      this.notifySyncListeners();
    } catch (error) {
      console.error('Error resolving sync conflict:', error);
      throw error;
    }
  }

  async clearResolvedConflicts(): Promise<void> {
    try {
      const conflicts = await this.getSyncConflicts();
      const unresolvedConflicts = conflicts.filter(c => !c.resolved);
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_CONFLICTS, JSON.stringify(unresolvedConflicts));
      console.log('Cleared resolved conflicts');
      this.notifySyncListeners();
    } catch (error) {
      console.error('Error clearing resolved conflicts:', error);
    }
  }

  async forceSyncNow(): Promise<void> {
    console.log('Force sync requested');
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    await this.syncPendingOperations();
  }

  async retryFailedOperations(): Promise<void> {
    try {
      const pendingOps = await this.getPendingSync();
      const failedOps = pendingOps.filter(op => op.status === 'failed');
      
      for (const op of failedOps) {
        op.status = 'pending';
        op.retryCount = 0;
        op.error = undefined;
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pendingOps));
      console.log('Reset failed operations for retry:', failedOps.length);
      this.notifySyncListeners();
      
      if (this.isOnline) {
        await this.syncPendingOperations();
      }
    } catch (error) {
      console.error('Error retrying failed operations:', error);
    }
  }
}

export default OfflineStorageManager;