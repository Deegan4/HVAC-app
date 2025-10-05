import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useMemo, useCallback } from 'react';
import { Customer, Equipment, Job, Invoice, Technician, TechnicianStatus, LocationUpdate, Message, JobComment, CalendarEvent } from '@/types';
import { mockCustomers, mockEquipment, mockJobs, mockInvoices, mockTechnicians } from '@/mocks/data';
import OfflineStorageManager from '@/utils/OfflineStorageManager';
import { UserRole } from '@/components/RoleSelectionScreen';
import { Language } from '@/components/LanguageSelectionScreen';
import { supabase } from '@/utils/supabase';
import { supabaseQueries } from '@/utils/supabase-queries';

interface AppState {
  customers: Customer[];
  equipment: Equipment[];
  jobs: Job[];
  invoices: Invoice[];
  technicians: Technician[];
  messages: Message[];
  jobComments: JobComment[];
  events: CalendarEvent[];
  currentTechnicianId: string | null;
  currentUserId: string;
  currentUserName: string;
  userRole: UserRole | null;
  language: Language;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPin: boolean;
  hasRole: boolean;
  hasLanguage: boolean;
  hasCompletedOnboarding: boolean;
  profileUpdateTrigger: number;
  addJob: (job: Omit<Job, 'id'>) => void;
  updateJobStatus: (jobId: string, status: Job['status']) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'equipment' | 'serviceHistory'>) => void;
  deleteCustomer: (customerId: string) => void;
  addTechnician: (technician: Omit<Technician, 'id'>) => void;
  updateTechnician: (technicianId: string, updates: Partial<Technician>) => void;
  deleteTechnician: (technicianId: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (invoiceId: string) => void;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  importCustomers: (importedCustomers: Customer[]) => Promise<void>;
  exportCustomers: () => Customer[];
  getTodaysJobs: () => Job[];
  getUpcomingJobs: () => Job[];
  getJobsByStatus: (status: Job['status']) => Job[];
  getCustomerById: (id: string) => Customer | undefined;
  getEquipmentByCustomer: (customerId: string) => Equipment[];
  getInvoicesByCustomer: (customerId: string) => Invoice[];
  setPin: (pin: string) => void;
  setUserRole: (role: UserRole) => void;
  setLanguage: (language: Language) => void;
  authenticatePin: (pin: string) => boolean;
  logout: () => void;
  completeOnboarding: () => void;
  updateTechnicianLocation: (technicianId: string, locationUpdate: LocationUpdate) => void;
  updateTechnicianStatus: (technicianId: string, status: TechnicianStatus) => void;
  getTechniciansByStatus: (status: TechnicianStatus['status']) => Technician[];
  getActiveTechnicians: () => Technician[];
  triggerProfileUpdate: () => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  markMessageAsRead: (messageId: string) => void;
  getConversationMessages: (participantId: string) => Message[];
  getUnreadCount: () => number;
  addJobComment: (comment: Omit<JobComment, 'id' | 'timestamp'>) => void;
  getJobComments: (jobId: string) => JobComment[];
  deleteJobComment: (commentId: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: string) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
}

export const [AppProvider, useAppStore] = createContextHook<AppState>(() => {
  const queryClient = useQueryClient();
  const offlineStorage = OfflineStorageManager.getInstance();
  const [currentTechnicianId] = useState<string | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [language, setLanguageState] = useState<Language>('en');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [hasRole, setHasRole] = useState<boolean>(false);
  const [hasLanguage, setHasLanguage] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState<number>(0);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('owner-1');
  const [currentUserName, setCurrentUserName] = useState<string>('Owner');

  useQuery({
    queryKey: ['authSession'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user?.id ?? null;
      setAuthUserId(id);
      if (id) {
        setCurrentUserId(id);
        setCurrentUserName(data.session?.user?.email ?? 'User');
      }
      return id;
    },
  });

  const { data: customers = mockCustomers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers', authUserId ?? 'anon'],
    queryFn: async () => {
      try {
        if (authUserId) {
          const rows = await supabaseQueries.customers.getAll(authUserId);
          await AsyncStorage.setItem('customers', JSON.stringify(rows));
          return rows;
        }
      } catch (e) {
        console.error('customers fetch error', e);
      }
      const stored = await AsyncStorage.getItem('customers');
      return stored ? JSON.parse(stored) : mockCustomers;
    },
  });

  const { data: equipment = mockEquipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment', authUserId ?? 'anon'],
    queryFn: async () => {
      try {
        if (authUserId) {
          const rows = await supabaseQueries.equipment.getAll(authUserId);
          await AsyncStorage.setItem('equipment', JSON.stringify(rows));
          return rows;
        }
      } catch (e) {
        console.error('equipment fetch error', e);
      }
      const stored = await AsyncStorage.getItem('equipment');
      return stored ? JSON.parse(stored) : mockEquipment;
    },
  });

  const { data: jobs = mockJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', authUserId ?? 'anon'],
    queryFn: async () => {
      try {
        if (authUserId) {
          const rows = await supabaseQueries.jobs.getAll(authUserId);
          await AsyncStorage.setItem('jobs', JSON.stringify(rows));
          return rows;
        }
      } catch (e) {
        console.error('jobs fetch error', e);
      }
      const stored = await AsyncStorage.getItem('jobs');
      return stored ? JSON.parse(stored) : mockJobs;
    },
  });

  const { data: invoices = mockInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', authUserId ?? 'anon'],
    queryFn: async () => {
      try {
        if (authUserId) {
          const rows = await supabaseQueries.invoices.getAll(authUserId);
          await AsyncStorage.setItem('invoices', JSON.stringify(rows));
          return rows;
        }
      } catch (e) {
        console.error('invoices fetch error', e);
      }
      const stored = await AsyncStorage.getItem('invoices');
      return stored ? JSON.parse(stored) : mockInvoices;
    },
  });

  const { data: technicians = mockTechnicians, isLoading: techniciansLoading } = useQuery({
    queryKey: ['technicians', authUserId ?? 'anon'],
    queryFn: async () => {
      try {
        if (authUserId) {
          const rows = await supabaseQueries.technicians.getAll(authUserId);
          await AsyncStorage.setItem('technicians', JSON.stringify(rows));
          return rows;
        }
      } catch (e) {
        console.error('technicians fetch error', e);
      }
      const stored = await AsyncStorage.getItem('technicians');
      return stored ? JSON.parse(stored) : mockTechnicians;
    },
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', authUserId ?? 'anon'],
    queryFn: async () => {
      try {
        if (authUserId) {
          const rows = await supabaseQueries.messages.getAll();
          await AsyncStorage.setItem('messages', JSON.stringify(rows));
          return rows;
        }
      } catch (e) {
        console.error('messages fetch error', e);
      }
      const stored = await AsyncStorage.getItem('messages');
      return stored ? JSON.parse(stored) : [] as Message[];
    },
  });

  const { data: jobComments = [], isLoading: jobCommentsLoading } = useQuery({
    queryKey: ['jobComments', authUserId ?? 'anon'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('jobComments');
      return stored ? JSON.parse(stored) : [] as JobComment[];
    },
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events', authUserId ?? 'anon'],
    queryFn: async () => {
      try {
        if (authUserId) {
          const rows = await supabaseQueries.events.getAll(authUserId);
          await AsyncStorage.setItem('events', JSON.stringify(rows));
          return rows;
        }
      } catch (e) {
        console.error('events fetch error', e);
      }
      const stored = await AsyncStorage.getItem('events');
      return stored ? JSON.parse(stored) : [] as CalendarEvent[];
    },
  });

  const [localTechnicians, setLocalTechnicians] = useState<Technician[]>(technicians);

  React.useEffect(() => {
    setLocalTechnicians(technicians);
  }, [technicians]);

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

  useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (role) {
        setUserRoleState(role as UserRole);
        setHasRole(true);
      }
      return role;
    },
  });

  useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
      if (completed === 'true') {
        setHasCompletedOnboarding(true);
      }
      return completed;
    },
  });

  useQuery({
    queryKey: ['language'],
    queryFn: async () => {
      const lang = await AsyncStorage.getItem('language');
      if (lang) {
        setLanguageState(lang as Language);
        setHasLanguage(true);
      }
      return lang;
    },
  });

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
      await offlineStorage.saveOfflineData({ invoices: newInvoices });
      return newInvoices;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
  const { mutate: mutateInvoices } = invoicesMutation;

  const techniciansMutation = useMutation({
    mutationFn: async (newTechnicians: Technician[]) => {
      await AsyncStorage.setItem('technicians', JSON.stringify(newTechnicians));
      return newTechnicians;
    },
    onSuccess: (newTechnicians) => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      setLocalTechnicians(newTechnicians);
    },
  });
  const { mutate: saveTechnicians } = techniciansMutation;

  const messagesMutation = useMutation({
    mutationFn: async (newMessages: Message[]) => {
      await AsyncStorage.setItem('messages', JSON.stringify(newMessages));
      return newMessages;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
  const { mutate: mutateMessages } = messagesMutation;

  const jobCommentsMutation = useMutation({
    mutationFn: async (newComments: JobComment[]) => {
      await AsyncStorage.setItem('jobComments', JSON.stringify(newComments));
      return newComments;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobComments'] });
    },
  });
  const { mutate: mutateJobComments } = jobCommentsMutation;

  const eventsMutation = useMutation({
    mutationFn: async (newEvents: CalendarEvent[]) => {
      await AsyncStorage.setItem('events', JSON.stringify(newEvents));
      return newEvents;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
  const { mutate: mutateEvents } = eventsMutation;

  const addJob = useCallback((job: Omit<Job, 'id'>) => {
    if (authUserId) {
      (async () => {
        try {
          const created = await supabaseQueries.jobs.create(job, authUserId);
          const updated = [...jobs, created];
          await AsyncStorage.setItem('jobs', JSON.stringify(updated));
          queryClient.invalidateQueries({ queryKey: ['jobs', authUserId] });
        } catch (e) {
          console.error('addJob error', e);
          const fallback: Job = { ...job, id: `job${Date.now()}` } as Job;
          mutateJobs([...jobs, fallback]);
        }
      })();
      return;
    }
    const newJob: Job = { ...job, id: `job${Date.now()}` } as Job;
    mutateJobs([...jobs, newJob]);
  }, [authUserId, jobs, mutateJobs, queryClient]);

  const updateJobStatus = useCallback(async (jobId: string, status: Job['status']) => {
    const updatedJobs = jobs.map((job: Job) => {
      if (job.id === jobId) {
        const u = { ...job, status } as Job;
        if (status === 'completed') {
          u.completedAt = new Date().toISOString();
        }
        return u;
      }
      return job;
    });
    const updatedJob = updatedJobs.find((j: Job) => j.id === jobId);
    if (updatedJob) {
      try {
        await offlineStorage.updateJobOffline(updatedJob);
      } catch (error) {
        console.error('Error saving job offline:', error);
      }
    }
    if (authUserId) {
      try {
        await supabaseQueries.jobs.update(jobId, { status, completedAt: updatedJob?.completedAt });
        queryClient.invalidateQueries({ queryKey: ['jobs', authUserId] });
      } catch (e) {
        console.error('updateJobStatus remote error', e);
        mutateJobs(updatedJobs);
      }
      return;
    }
    mutateJobs(updatedJobs);
  }, [jobs, mutateJobs, offlineStorage, authUserId, queryClient]);

  const setPin = useCallback(async (pin: string) => {
    await AsyncStorage.setItem('userPin', pin);
    setStoredPin(pin);
    setHasPin(true);
    setIsAuthenticated(true);
  }, []);

  const setUserRole = useCallback(async (role: UserRole) => {
    await AsyncStorage.setItem('userRole', role);
    setUserRoleState(role);
    setHasRole(true);
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    await AsyncStorage.setItem('language', lang);
    setLanguageState(lang);
    setHasLanguage(true);
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

  const triggerProfileUpdate = useCallback(() => {
    setProfileUpdateTrigger((prev) => prev + 1);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
  }, []);

  const updateTechnicianLocation = useCallback((technicianId: string, locationUpdate: LocationUpdate) => {
    console.log('Updating technician location:', technicianId, locationUpdate);
  }, []);

  const updateTechnicianStatus = useCallback((technicianId: string, status: TechnicianStatus) => {
    console.log('Updating technician status:', technicianId, status);
  }, []);

  const getTechniciansByStatus = useCallback((status: TechnicianStatus['status']) => {
    return localTechnicians.filter((tech: Technician) => tech.status?.status === status);
  }, [localTechnicians]);

  const getActiveTechnicians = useCallback(() => {
    return localTechnicians.filter((tech: Technician) => tech.availability !== 'offline');
  }, [localTechnicians]);

  const addTechnician = useCallback((technician: Omit<Technician, 'id'>) => {
    if (authUserId) {
      (async () => {
        try {
          const created = await supabaseQueries.technicians.create(technician, authUserId);
          const updated = [...localTechnicians, created];
          await AsyncStorage.setItem('technicians', JSON.stringify(updated));
          queryClient.invalidateQueries({ queryKey: ['technicians', authUserId] });
        } catch (e) {
          console.error('addTechnician error', e);
          const fallback = { ...technician, id: `tech${Date.now()}` } as Technician;
          saveTechnicians([...localTechnicians, fallback]);
        }
      })();
      return;
    }
    const newTechnician: Technician = { ...technician, id: `tech${Date.now()}` } as Technician;
    saveTechnicians([...localTechnicians, newTechnician]);
  }, [authUserId, localTechnicians, saveTechnicians, queryClient]);

  const updateTechnician = useCallback((technicianId: string, updates: Partial<Technician>) => {
    const updatedTechnicians = localTechnicians.map((tech: Technician) => (tech.id === technicianId ? { ...tech, ...updates } : tech));
    if (authUserId) {
      (async () => {
        try {
          await supabaseQueries.technicians.update(technicianId, updates);
          await AsyncStorage.setItem('technicians', JSON.stringify(updatedTechnicians));
          queryClient.invalidateQueries({ queryKey: ['technicians', authUserId] });
        } catch (e) {
          console.error('updateTechnician error', e);
          saveTechnicians(updatedTechnicians);
        }
      })();
      return;
    }
    saveTechnicians(updatedTechnicians);
  }, [authUserId, localTechnicians, saveTechnicians, queryClient]);

  const deleteTechnician = useCallback((technicianId: string) => {
    const updated = localTechnicians.filter((tech: Technician) => tech.id !== technicianId);
    if (authUserId) {
      (async () => {
        try {
          await supabaseQueries.technicians.delete(technicianId);
          await AsyncStorage.setItem('technicians', JSON.stringify(updated));
          queryClient.invalidateQueries({ queryKey: ['technicians', authUserId] });
        } catch (e) {
          console.error('deleteTechnician error', e);
          saveTechnicians(updated);
        }
      })();
      return;
    }
    saveTechnicians(updated);
  }, [authUserId, localTechnicians, saveTechnicians, queryClient]);

  const importCustomers = useCallback(async (importedCustomers: Customer[]) => {
    mutateCustomers(importedCustomers);
  }, [mutateCustomers]);

  const exportCustomers = useCallback((): Customer[] => {
    return customers;
  }, [customers]);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt' | 'equipment' | 'serviceHistory'>) => {
    if (authUserId) {
      (async () => {
        try {
          const created = await supabaseQueries.customers.create(customer, authUserId);
          const updated = [...customers, created];
          await AsyncStorage.setItem('customers', JSON.stringify(updated));
          queryClient.invalidateQueries({ queryKey: ['customers', authUserId] });
        } catch (e) {
          console.error('addCustomer error', e);
          const newCustomer: Customer = { ...customer, id: `cust${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], equipment: [], serviceHistory: [] } as Customer;
          mutateCustomers([...customers, newCustomer]);
        }
      })();
      return;
    }
    const newCustomer: Customer = { ...customer, id: `cust${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], equipment: [], serviceHistory: [] } as Customer;
    mutateCustomers([...customers, newCustomer]);
  }, [authUserId, customers, mutateCustomers, queryClient]);

  const deleteCustomer = useCallback((customerId: string) => {
    const updatedCustomers = customers.filter((c: Customer) => c.id !== customerId);
    if (authUserId) {
      (async () => {
        try {
          await supabaseQueries.customers.delete(customerId);
          await AsyncStorage.setItem('customers', JSON.stringify(updatedCustomers));
          queryClient.invalidateQueries({ queryKey: ['customers', authUserId] });
        } catch (e) {
          console.error('deleteCustomer error', e);
          mutateCustomers(updatedCustomers);
        }
      })();
      return;
    }
    mutateCustomers(updatedCustomers);
  }, [authUserId, customers, mutateCustomers, queryClient]);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>) => {
    if (authUserId) {
      (async () => {
        try {
          const created = await supabaseQueries.invoices.create(invoice, authUserId);
          const updated = [...invoices, created];
          await AsyncStorage.setItem('invoices', JSON.stringify(updated));
          queryClient.invalidateQueries({ queryKey: ['invoices', authUserId] });
          try {
            await offlineStorage.updateInvoiceOffline(created, true);
          } catch (error) {
            console.error('Error saving invoice offline:', error);
          }
        } catch (e) {
          console.error('addInvoice error', e);
          const newInvoice: Invoice = { ...invoice, id: `inv${Date.now()}` } as Invoice;
          mutateInvoices([...invoices, newInvoice]);
          try {
            await offlineStorage.updateInvoiceOffline(newInvoice, true);
          } catch (error) {
            console.error('Error saving invoice offline:', error);
          }
        }
      })();
      return;
    }
    const newInvoice: Invoice = { ...invoice, id: `inv${Date.now()}` } as Invoice;
    mutateInvoices([...invoices, newInvoice]);
    (async () => {
      try {
        await offlineStorage.updateInvoiceOffline(newInvoice, true);
      } catch (error) {
        console.error('Error saving invoice offline:', error);
      }
    })();
  }, [authUserId, invoices, mutateInvoices, offlineStorage, queryClient]);

  const updateInvoice = useCallback((invoiceId: string, updates: Partial<Invoice>) => {
    const updatedInvoices = invoices.map((inv: Invoice) => (inv.id === invoiceId ? { ...inv, ...updates } : inv));
    if (authUserId) {
      (async () => {
        try {
          const updated = await supabaseQueries.invoices.update(invoiceId, updates);
          const merged = invoices.map((inv: Invoice) => (inv.id === invoiceId ? updated : inv));
          await AsyncStorage.setItem('invoices', JSON.stringify(merged));
          queryClient.invalidateQueries({ queryKey: ['invoices', authUserId] });
          try {
            await offlineStorage.updateInvoiceOffline(updated, false);
          } catch (error) {
            console.error('Error updating invoice offline:', error);
          }
        } catch (e) {
          console.error('updateInvoice error', e);
          mutateInvoices(updatedInvoices);
        }
      })();
      return;
    }
    mutateInvoices(updatedInvoices);
    const updated = updatedInvoices.find((i: Invoice) => i.id === invoiceId);
    if (updated) {
      (async () => {
        try {
          await offlineStorage.updateInvoiceOffline(updated, false);
        } catch (error) {
          console.error('Error updating invoice offline:', error);
        }
      })();
    }
  }, [authUserId, invoices, mutateInvoices, offlineStorage, queryClient]);

  const deleteInvoice = useCallback((invoiceId: string) => {
    const updatedInvoices = invoices.filter((invoice: Invoice) => invoice.id !== invoiceId);
    if (authUserId) {
      (async () => {
        try {
          await supabaseQueries.invoices.delete(invoiceId);
          await AsyncStorage.setItem('invoices', JSON.stringify(updatedInvoices));
          queryClient.invalidateQueries({ queryKey: ['invoices', authUserId] });
        } catch (e) {
          console.error('deleteInvoice error', e);
          mutateInvoices(updatedInvoices);
        }
      })();
      return;
    }
    mutateInvoices(updatedInvoices);
  }, [authUserId, invoices, mutateInvoices, queryClient]);

  const updateInvoiceStatus = useCallback((invoiceId: string, status: Invoice['status']) => {
    if (authUserId) {
      (async () => {
        try {
          await supabaseQueries.invoices.update(invoiceId, { status });
          queryClient.invalidateQueries({ queryKey: ['invoices', authUserId] });
        } catch (e) {
          console.error('updateInvoiceStatus error', e);
          const updatedInvoices = invoices.map((invoice: Invoice) => (invoice.id === invoiceId ? { ...invoice, status } : invoice));
          mutateInvoices(updatedInvoices);
        }
      })();
      return;
    }
    const updatedInvoices = invoices.map((invoice: Invoice) => (invoice.id === invoiceId ? { ...invoice, status } : invoice));
    mutateInvoices(updatedInvoices);
  }, [authUserId, invoices, mutateInvoices, queryClient]);

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

  const sendMessage = useCallback((message: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    if (authUserId) {
      (async () => {
        try {
          const created = await supabaseQueries.messages.create(message);
          const updated = [...messages, created];
          await AsyncStorage.setItem('messages', JSON.stringify(updated));
          queryClient.invalidateQueries({ queryKey: ['messages', authUserId] });
        } catch (e) {
          console.error('sendMessage error', e);
          const newMessage: Message = { ...message, id: `msg${Date.now()}`, timestamp: new Date().toISOString(), read: false } as Message;
          mutateMessages([...messages, newMessage]);
        }
      })();
      return;
    }
    const newMessage: Message = { ...message, id: `msg${Date.now()}`, timestamp: new Date().toISOString(), read: false } as Message;
    mutateMessages([...messages, newMessage]);
  }, [authUserId, messages, mutateMessages, queryClient]);

  const markMessageAsRead = useCallback((messageId: string) => {
    const updatedMessages = messages.map((msg: Message) => (msg.id === messageId ? { ...msg, read: true } : msg));
    if (authUserId) {
      (async () => {
        try {
          await supabaseQueries.messages.markAsRead(messageId);
          await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
          queryClient.invalidateQueries({ queryKey: ['messages', authUserId] });
        } catch (e) {
          console.error('markMessageAsRead error', e);
          mutateMessages(updatedMessages);
        }
      })();
      return;
    }
    mutateMessages(updatedMessages);
  }, [authUserId, messages, mutateMessages, queryClient]);

  const getConversationMessages = useCallback((participantId: string) => {
    return messages
      .filter((msg: Message) => msg.senderId === participantId || msg.recipientId === participantId)
      .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages]);

  const getUnreadCount = useCallback(() => {
    return messages.filter((msg: Message) => !msg.read && msg.recipientId === currentUserId).length;
  }, [messages, currentUserId]);

  const addJobComment = useCallback((comment: Omit<JobComment, 'id' | 'timestamp'>) => {
    if (authUserId) {
      (async () => {
        try {
          const created = await supabaseQueries.jobComments.create(comment);
          const updated = [...jobComments, created];
          await AsyncStorage.setItem('jobComments', JSON.stringify(updated));
          queryClient.invalidateQueries({ queryKey: ['jobComments', authUserId] });
        } catch (e) {
          console.error('addJobComment error', e);
          const newComment: JobComment = { ...comment, id: `comment${Date.now()}`, timestamp: new Date().toISOString() } as JobComment;
          mutateJobComments([...jobComments, newComment]);
        }
      })();
      return;
    }
    const newComment: JobComment = { ...comment, id: `comment${Date.now()}`, timestamp: new Date().toISOString() } as JobComment;
    mutateJobComments([...jobComments, newComment]);
  }, [authUserId, jobComments, mutateJobComments, queryClient]);

  const getJobComments = useCallback((jobId: string) => {
    return jobComments
      .filter((comment: JobComment) => comment.jobId === jobId)
      .sort((a: JobComment, b: JobComment) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [jobComments]);

  const deleteJobComment = useCallback((commentId: string) => {
    const updated = jobComments.filter((comment: JobComment) => comment.id !== commentId);
    if (authUserId) {
      (async () => {
        try {
          await supabaseQueries.jobComments.delete(commentId);
          await AsyncStorage.setItem('jobComments', JSON.stringify(updated));
          queryClient.invalidateQueries({ queryKey: ['jobComments', authUserId] });
        } catch (e) {
          console.error('deleteJobComment error', e);
          mutateJobComments(updated);
        }
      })();
      return;
    }
    mutateJobComments(updated);
  }, [authUserId, jobComments, mutateJobComments, queryClient]);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (authUserId) {
      (async () => {
        try {
          const created = await supabaseQueries.events.create(event, authUserId);
          const updated = [...events, created];
          await AsyncStorage.setItem('events', JSON.stringify(updated));
          queryClient.invalidateQueries({ queryKey: ['events', authUserId] });
        } catch (e) {
          console.error('addEvent error', e);
          const newEvent: CalendarEvent = { ...event, id: `event${Date.now()}`, createdAt: new Date().toISOString() } as CalendarEvent;
          mutateEvents([...events, newEvent]);
        }
      })();
      return;
    }
    const newEvent: CalendarEvent = { ...event, id: `event${Date.now()}`, createdAt: new Date().toISOString() } as CalendarEvent;
    mutateEvents([...events, newEvent]);
  }, [authUserId, events, mutateEvents, queryClient]);

  const updateEvent = useCallback((eventId: string, updates: Partial<CalendarEvent>) => {
    const updatedEvents = events.map((event: CalendarEvent) => (event.id === eventId ? { ...event, ...updates } : event));
    if (authUserId) {
      (async () => {
        try {
          await supabaseQueries.events.update(eventId, updates);
          await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
          queryClient.invalidateQueries({ queryKey: ['events', authUserId] });
        } catch (e) {
          console.error('updateEvent error', e);
          mutateEvents(updatedEvents);
        }
      })();
      return;
    }
    mutateEvents(updatedEvents);
  }, [authUserId, events, mutateEvents, queryClient]);

  const deleteEvent = useCallback((eventId: string) => {
    const updatedEvents = events.filter((event: CalendarEvent) => event.id !== eventId);
    if (authUserId) {
      (async () => {
        try {
          await supabaseQueries.events.delete(eventId);
          await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
          queryClient.invalidateQueries({ queryKey: ['events', authUserId] });
        } catch (e) {
          console.error('deleteEvent error', e);
          mutateEvents(updatedEvents);
        }
      })();
      return;
    }
    mutateEvents(updatedEvents);
  }, [authUserId, events, mutateEvents, queryClient]);

  const getEventsByDate = useCallback((date: string) => {
    return events.filter((event: CalendarEvent) => event.date === date);
  }, [events]);

  const isLoading = customersLoading || equipmentLoading || jobsLoading || invoicesLoading || techniciansLoading || messagesLoading || jobCommentsLoading || eventsLoading;

  return useMemo(() => ({
    customers,
    equipment,
    jobs,
    invoices,
    technicians: localTechnicians,
    messages,
    jobComments,
    events,
    currentTechnicianId,
    currentUserId,
    currentUserName,
    userRole,
    language,
    isLoading,
    isAuthenticated,
    hasPin,
    hasRole,
    hasLanguage,
    hasCompletedOnboarding,
    profileUpdateTrigger,
    addJob,
    updateJobStatus,
    addCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    getTodaysJobs,
    getUpcomingJobs,
    getJobsByStatus,
    getCustomerById,
    getEquipmentByCustomer,
    getInvoicesByCustomer,
    setPin,
    setUserRole,
    setLanguage,
    authenticatePin,
    logout,
    completeOnboarding,
    importCustomers,
    exportCustomers,
    updateTechnicianLocation,
    updateTechnicianStatus,
    getTechniciansByStatus,
    getActiveTechnicians,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    triggerProfileUpdate,
    sendMessage,
    markMessageAsRead,
    getConversationMessages,
    getUnreadCount,
    addJobComment,
    getJobComments,
    deleteJobComment,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
  }), [
    customers,
    equipment,
    jobs,
    invoices,
    localTechnicians,
    messages,
    jobComments,
    currentTechnicianId,
    currentUserId,
    currentUserName,
    userRole,
    language,
    isLoading,
    isAuthenticated,
    hasPin,
    hasRole,
    hasLanguage,
    hasCompletedOnboarding,
    profileUpdateTrigger,
    addJob,
    updateJobStatus,
    addCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    getTodaysJobs,
    getUpcomingJobs,
    getJobsByStatus,
    getCustomerById,
    getEquipmentByCustomer,
    getInvoicesByCustomer,
    setPin,
    setUserRole,
    setLanguage,
    authenticatePin,
    logout,
    completeOnboarding,
    importCustomers,
    exportCustomers,
    updateTechnicianLocation,
    updateTechnicianStatus,
    getTechniciansByStatus,
    getActiveTechnicians,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    triggerProfileUpdate,
    sendMessage,
    markMessageAsRead,
    getConversationMessages,
    getUnreadCount,
    addJobComment,
    getJobComments,
    deleteJobComment,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
  ]);
});

export function useTodaysJobs() {
  const { jobs } = useAppStore();
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return jobs.filter((job) => job.scheduledDate === today);
  }, [jobs]);
}

export function useJobStats() {
  const { jobs } = useAppStore();
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysJobs = jobs.filter((job) => job.scheduledDate === today);
    return {
      total: todaysJobs.length,
      completed: todaysJobs.filter((job) => job.status === 'completed').length,
      inProgress: todaysJobs.filter((job) => job.status === 'inProgress').length,
      scheduled: todaysJobs.filter((job) => job.status === 'scheduled').length,
      emergency: todaysJobs.filter((job) => job.priority === 'emergency').length,
    };
  }, [jobs]);
}

export function useRevenueStats() {
  const { invoices } = useAppStore();
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);
    const monthlyInvoices = invoices.filter((inv) => inv.date.startsWith(thisMonth));
    const paidInvoices = monthlyInvoices.filter((inv) => inv.status === 'paid');
    return {
      monthlyTotal: monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0),
      monthlyPaid: paidInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
      pending: monthlyInvoices.filter((inv) => inv.status === 'sent').length,
      overdue: monthlyInvoices.filter((inv) => inv.status === 'overdue').length,
    };
  }, [invoices]);
}
