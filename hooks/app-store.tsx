import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { Customer, Equipment, Job, Invoice, Technician } from '@/types';
import { mockCustomers, mockEquipment, mockJobs, mockInvoices, mockTechnicians } from '@/mocks/data';
import OfflineStorageManager from '@/utils/OfflineStorageManager';

interface AppState {
  customers: Customer[];
  equipment: Equipment[];
  jobs: Job[];
  invoices: Invoice[];
  technicians: Technician[];
  currentTechnicianId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPin: boolean;
  addJob: (job: Omit<Job, 'id'>) => void;
  updateJobStatus: (jobId: string, status: Job['status']) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'equipment' | 'serviceHistory'>) => void;
  deleteCustomer: (customerId: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  getTodaysJobs: () => Job[];
  getUpcomingJobs: () => Job[];
  getJobsByStatus: (status: Job['status']) => Job[];
  getCustomerById: (id: string) => Customer | undefined;
  getEquipmentByCustomer: (customerId: string) => Equipment[];
  getInvoicesByCustomer: (customerId: string) => Invoice[];
  setPin: (pin: string) => void;
  authenticatePin: (pin: string) => boolean;
  logout: () => void;
}

export const [AppProvider, useAppStore] = createContextHook<AppState>(() => {
  const queryClient = useQueryClient();
  const offlineStorage = OfflineStorageManager.getInstance();
  const [currentTechnicianId] = useState<string | null>('tech1');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);

  // Load data from AsyncStorage or use mock data
  const { data: customers = mockCustomers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('customers');
      return stored ? JSON.parse(stored) : mockCustomers;
    },
  });

  const { data: equipment = mockEquipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('equipment');
      return stored ? JSON.parse(stored) : mockEquipment;
    },
  });

  const { data: jobs = mockJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('jobs');
      return stored ? JSON.parse(stored) : mockJobs;
    },
  });

  const { data: invoices = mockInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('invoices');
      return stored ? JSON.parse(stored) : mockInvoices;
    },
  });

  const { data: technicians = mockTechnicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('technicians');
      return stored ? JSON.parse(stored) : mockTechnicians;
    },
  });

  // Check for existing PIN on app start
  useQuery({
    queryKey: ['pin'],
    queryFn: async () => {
      const pin = await AsyncStorage.getItem('userPin');
      if (pin) {
        setHasPin(true);
        setStoredPin(pin);
      }
      return pin;
    },
  });

  // Mutations for updating data
  const jobsMutation = useMutation({
    mutationFn: async (newJobs: Job[]) => {
      await AsyncStorage.setItem('jobs', JSON.stringify(newJobs));
      return newJobs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
  const { mutate: mutateJobs } = jobsMutation;

  const customersMutation = useMutation({
    mutationFn: async (newCustomers: Customer[]) => {
      await AsyncStorage.setItem('customers', JSON.stringify(newCustomers));
      return newCustomers;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
  const { mutate: mutateCustomers } = customersMutation;

  const invoicesMutation = useMutation({
    mutationFn: async (newInvoices: Invoice[]) => {
      await AsyncStorage.setItem('invoices', JSON.stringify(newInvoices));
      return newInvoices;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
  const { mutate: mutateInvoices } = invoicesMutation;

  useMutation({
    mutationFn: async (newTechnicians: Technician[]) => {
      await AsyncStorage.setItem('technicians', JSON.stringify(newTechnicians));
      return newTechnicians;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  // Helper functions
  const addJob = useCallback((job: Omit<Job, 'id'>) => {
    const newJob: Job = {
      ...job,
      id: `job${Date.now()}`,
    };
    mutateJobs([...jobs, newJob]);
  }, [jobs, mutateJobs]);

  const updateJobStatus = useCallback(async (jobId: string, status: Job['status']) => {
    const updatedJobs = jobs.map((job: Job) => {
      if (job.id === jobId) {
        const updatedJob = { ...job, status };
        if (status === 'completed') {
          updatedJob.completedAt = new Date().toISOString();
        }
        return updatedJob;
      }
      return job;
    });
    
    // Save to offline storage first
    const updatedJob = updatedJobs.find((job: Job) => job.id === jobId);
    if (updatedJob) {
      try {
        await offlineStorage.updateJobOffline(updatedJob);
      } catch (error) {
        console.error('Error saving job offline:', error);
      }
    }
    
    // Then update local state
    mutateJobs(updatedJobs);
  }, [jobs, mutateJobs, offlineStorage]);

  const setPin = useCallback(async (pin: string) => {
    await AsyncStorage.setItem('userPin', pin);
    setStoredPin(pin);
    setHasPin(true);
    setIsAuthenticated(true);
  }, []);

  const authenticatePin = useCallback((pin: string): boolean => {
    if (storedPin === pin) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [storedPin]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt' | 'equipment' | 'serviceHistory'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      equipment: [],
      serviceHistory: [],
    };
    mutateCustomers([...customers, newCustomer]);
  }, [customers, mutateCustomers]);

  const deleteCustomer = useCallback((customerId: string) => {
    const updatedCustomers = customers.filter((customer: Customer) => customer.id !== customerId);
    mutateCustomers(updatedCustomers);
  }, [customers, mutateCustomers]);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv${Date.now()}`,
    };
    mutateInvoices([...invoices, newInvoice]);
  }, [invoices, mutateInvoices]);

  const updateInvoiceStatus = useCallback((invoiceId: string, status: Invoice['status']) => {
    const updatedInvoices = invoices.map((invoice: Invoice) =>
      invoice.id === invoiceId ? { ...invoice, status } : invoice
    );
    mutateInvoices(updatedInvoices);
  }, [invoices, mutateInvoices]);

  const getTodaysJobs = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return jobs.filter((job: Job) => job.scheduledDate === today);
  }, [jobs]);

  const getUpcomingJobs = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return jobs.filter((job: Job) => job.scheduledDate >= today && job.status !== 'completed');
  }, [jobs]);

  const getJobsByStatus = useCallback((status: Job['status']) => {
    return jobs.filter((job: Job) => job.status === status);
  }, [jobs]);

  const getCustomerById = useCallback((id: string) => {
    return customers.find((customer: Customer) => customer.id === id);
  }, [customers]);

  const getEquipmentByCustomer = useCallback((customerId: string) => {
    return equipment.filter((eq: Equipment) => eq.customerId === customerId);
  }, [equipment]);

  const getInvoicesByCustomer = useCallback((customerId: string) => {
    return invoices.filter((invoice: Invoice) => invoice.customerId === customerId);
  }, [invoices]);

  const isLoading = customersLoading || equipmentLoading || jobsLoading || invoicesLoading;

  return useMemo(() => ({
    customers,
    equipment,
    jobs,
    invoices,
    technicians,
    currentTechnicianId,
    isLoading,
    isAuthenticated,
    hasPin,
    addJob,
    updateJobStatus,
    addCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoiceStatus,
    getTodaysJobs,
    getUpcomingJobs,
    getJobsByStatus,
    getCustomerById,
    getEquipmentByCustomer,
    getInvoicesByCustomer,
    setPin,
    authenticatePin,
    logout,
  }), [
    customers,
    equipment,
    jobs,
    invoices,
    technicians,
    currentTechnicianId,
    isLoading,
    isAuthenticated,
    hasPin,
    addJob,
    updateJobStatus,
    addCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoiceStatus,
    getTodaysJobs,
    getUpcomingJobs,
    getJobsByStatus,
    getCustomerById,
    getEquipmentByCustomer,
    getInvoicesByCustomer,
    setPin,
    authenticatePin,
    logout,
  ]);
});

// Helper hooks
export function useTodaysJobs() {
  const { jobs } = useAppStore();
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return jobs.filter(job => job.scheduledDate === today);
  }, [jobs]);
}

export function useJobStats() {
  const { jobs } = useAppStore();
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysJobs = jobs.filter(job => job.scheduledDate === today);
    
    return {
      total: todaysJobs.length,
      completed: todaysJobs.filter(job => job.status === 'completed').length,
      inProgress: todaysJobs.filter(job => job.status === 'inProgress').length,
      scheduled: todaysJobs.filter(job => job.status === 'scheduled').length,
      emergency: todaysJobs.filter(job => job.priority === 'emergency').length,
    };
  }, [jobs]);
}

export function useRevenueStats() {
  const { invoices } = useAppStore();
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);
    
    const monthlyInvoices = invoices.filter(inv => inv.date.startsWith(thisMonth));
    const paidInvoices = monthlyInvoices.filter(inv => inv.status === 'paid');
    
    return {
      monthlyTotal: monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0),
      monthlyPaid: paidInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
      pending: monthlyInvoices.filter(inv => inv.status === 'sent').length,
      overdue: monthlyInvoices.filter(inv => inv.status === 'overdue').length,
    };
  }, [invoices]);
}