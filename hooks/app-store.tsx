import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useMemo, useCallback } from 'react';
import { Customer, Equipment, Job, Invoice, Technician, TechnicianStatus, LocationUpdate, Message, JobComment, CalendarEvent } from '@/types';
import { mockCustomers, mockEquipment, mockJobs, mockInvoices, mockTechnicians } from '@/mocks/data';
import OfflineStorageManager from '@/utils/OfflineStorageManager';
import { UserRole } from '@/components/RoleSelectionScreen';
import { Language } from '@/components/LanguageSelectionScreen';


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
  const [currentUserId] = useState<string>('owner-1');
  const [currentUserName] = useState<string>('Owner');

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

  const { data: technicians = mockTechnicians, isLoading: techniciansLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('technicians');
      return stored ? JSON.parse(stored) : mockTechnicians;
    },
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('messages');
      return stored ? JSON.parse(stored) : [] as Message[];
    },
  });

  const { data: jobComments = [], isLoading: jobCommentsLoading } = useQuery({
    queryKey: ['jobComments'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('jobComments');
      return stored ? JSON.parse(stored) : [] as JobComment[];
    },
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
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
    const newJob: Job = { ...job, id: `job${Date.now()}` } as Job;
    mutateJobs([...jobs, newJob]);
  }, [jobs, mutateJobs]);

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
    mutateJobs(updatedJobs);
  }, [jobs, mutateJobs, offlineStorage]);

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
    const newTechnician: Technician = { ...technician, id: `tech${Date.now()}` } as Technician;
    saveTechnicians([...localTechnicians, newTechnician]);
  }, [localTechnicians, saveTechnicians]);

  const updateTechnician = useCallback((technicianId: string, updates: Partial<Technician>) => {
    const updatedTechnicians = localTechnicians.map((tech: Technician) => (tech.id === technicianId ? { ...tech, ...updates } : tech));
    saveTechnicians(updatedTechnicians);
  }, [localTechnicians, saveTechnicians]);

  const deleteTechnician = useCallback((technicianId: string) => {
    const updated = localTechnicians.filter((tech: Technician) => tech.id !== technicianId);
    saveTechnicians(updated);
  }, [localTechnicians, saveTechnicians]);

  const importCustomers = useCallback(async (importedCustomers: Customer[]) => {
    mutateCustomers(importedCustomers);
  }, [mutateCustomers]);

  const exportCustomers = useCallback((): Customer[] => {
    return customers;
  }, [customers]);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt' | 'equipment' | 'serviceHistory'>) => {
    const newCustomer: Customer = { ...customer, id: `cust${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], equipment: [], serviceHistory: [] } as Customer;
    mutateCustomers([...customers, newCustomer]);
  }, [customers, mutateCustomers]);

  const deleteCustomer = useCallback((customerId: string) => {
    const updatedCustomers = customers.filter((c: Customer) => c.id !== customerId);
    mutateCustomers(updatedCustomers);
  }, [customers, mutateCustomers]);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = { ...invoice, id: `inv${Date.now()}` } as Invoice;
    mutateInvoices([...invoices, newInvoice]);
    (async () => {
      try {
        await offlineStorage.updateInvoiceOffline(newInvoice, true);
      } catch (error) {
        console.error('Error saving invoice offline:', error);
      }
    })();
  }, [invoices, mutateInvoices, offlineStorage]);

  const updateInvoice = useCallback((invoiceId: string, updates: Partial<Invoice>) => {
    const updatedInvoices = invoices.map((inv: Invoice) => (inv.id === invoiceId ? { ...inv, ...updates } : inv));
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
  }, [invoices, mutateInvoices, offlineStorage]);

  const deleteInvoice = useCallback((invoiceId: string) => {
    const updatedInvoices = invoices.filter((invoice: Invoice) => invoice.id !== invoiceId);
    mutateInvoices(updatedInvoices);
  }, [invoices, mutateInvoices]);

  const updateInvoiceStatus = useCallback((invoiceId: string, status: Invoice['status']) => {
    const updatedInvoices = invoices.map((invoice: Invoice) => (invoice.id === invoiceId ? { ...invoice, status } : invoice));
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

  const sendMessage = useCallback((message: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMessage: Message = { ...message, id: `msg${Date.now()}`, timestamp: new Date().toISOString(), read: false } as Message;
    mutateMessages([...messages, newMessage]);
  }, [messages, mutateMessages]);

  const markMessageAsRead = useCallback((messageId: string) => {
    const updatedMessages = messages.map((msg: Message) => (msg.id === messageId ? { ...msg, read: true } : msg));
    mutateMessages(updatedMessages);
  }, [messages, mutateMessages]);

  const getConversationMessages = useCallback((participantId: string) => {
    return messages
      .filter((msg: Message) => msg.senderId === participantId || msg.recipientId === participantId)
      .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages]);

  const getUnreadCount = useCallback(() => {
    return messages.filter((msg: Message) => !msg.read && msg.recipientId === currentUserId).length;
  }, [messages, currentUserId]);

  const addJobComment = useCallback((comment: Omit<JobComment, 'id' | 'timestamp'>) => {
    const newComment: JobComment = { ...comment, id: `comment${Date.now()}`, timestamp: new Date().toISOString() } as JobComment;
    mutateJobComments([...jobComments, newComment]);
  }, [jobComments, mutateJobComments]);

  const getJobComments = useCallback((jobId: string) => {
    return jobComments
      .filter((comment: JobComment) => comment.jobId === jobId)
      .sort((a: JobComment, b: JobComment) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [jobComments]);

  const deleteJobComment = useCallback((commentId: string) => {
    const updated = jobComments.filter((comment: JobComment) => comment.id !== commentId);
    mutateJobComments(updated);
  }, [jobComments, mutateJobComments]);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = { ...event, id: `event${Date.now()}`, createdAt: new Date().toISOString() } as CalendarEvent;
    mutateEvents([...events, newEvent]);
  }, [events, mutateEvents]);

  const updateEvent = useCallback((eventId: string, updates: Partial<CalendarEvent>) => {
    const updatedEvents = events.map((event: CalendarEvent) => (event.id === eventId ? { ...event, ...updates } : event));
    mutateEvents(updatedEvents);
  }, [events, mutateEvents]);

  const deleteEvent = useCallback((eventId: string) => {
    const updatedEvents = events.filter((event: CalendarEvent) => event.id !== eventId);
    mutateEvents(updatedEvents);
  }, [events, mutateEvents]);

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
