import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { Customer, Equipment, Job, Invoice, Technician, TechnicianStatus, LocationUpdate, Message, JobComment, CalendarEvent, TechnicianPermissions } from '@/types';
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
  technicianPermissions: TechnicianPermissions;
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
  setPin: (pin: string) => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  authenticatePin: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateTechnicianLocation: (technicianId: string, locationUpdate: LocationUpdate) => void;
  updateTechnicianStatus: (technicianId: string, status: TechnicianStatus) => void;
  getTechniciansByStatus: (status: TechnicianStatus['status']) => Technician[];
  getActiveTechnicians: () => Technician[];
  triggerProfileUpdate: () => Promise<void>;
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
  updateTechnicianPermissions: (permissions: Partial<TechnicianPermissions>) => Promise<void>;
  canAccess: (permission: keyof TechnicianPermissions) => boolean;
}

export const [AppProvider, useAppStore] = createContextHook<AppState>(() => {
  const queryClient = useQueryClient();
  const offlineStorage = useMemo(() => OfflineStorageManager.getInstance(), []);
  const currentTechnicianId = null;
  const currentUserId = 'owner-1';
  const currentUserName = 'Owner';

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('customers');
      return stored ? JSON.parse(stored) : mockCustomers;
    },
  });

  const equipmentQuery = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('equipment');
      return stored ? JSON.parse(stored) : mockEquipment;
    },
  });

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('jobs');
      return stored ? JSON.parse(stored) : mockJobs;
    },
  });

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('invoices');
      return stored ? JSON.parse(stored) : mockInvoices;
    },
  });

  const techniciansQuery = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('technicians');
      return stored ? JSON.parse(stored) : mockTechnicians;
    },
  });

  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('messages');
      return stored ? JSON.parse(stored) : [] as Message[];
    },
  });

  const jobCommentsQuery = useQuery({
    queryKey: ['jobComments'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('jobComments');
      return stored ? JSON.parse(stored) : [] as JobComment[];
    },
  });

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('events');
      return stored ? JSON.parse(stored) : [] as CalendarEvent[];
    },
  });

  const permissionsQuery = useQuery({
    queryKey: ['technicianPermissions'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('technicianPermissions');
      return stored ? JSON.parse(stored) : {
        canViewCustomers: true,
        canAddEditCustomers: false,
        canDeleteCustomers: false,
        canViewInvoices: true,
        canCreateInvoices: false,
        canEditInvoices: false,
        canDeleteInvoices: false,
        canViewAllJobs: true,
        canEditAllJobs: false,
        canViewReports: false,
        canManageTeam: false,
        canViewPricing: true,
        canEditPricing: false,
        canAccessMessaging: true,
        canImportExport: false,
      } as TechnicianPermissions;
    },
  });

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const [pin, role, onboarding, lang, authenticated] = await Promise.all([
        AsyncStorage.getItem('userPin'),
        AsyncStorage.getItem('userRole'),
        AsyncStorage.getItem('hasCompletedOnboarding'),
        AsyncStorage.getItem('language'),
        AsyncStorage.getItem('isAuthenticated'),
      ]);

      return {
        pin,
        userRole: role as UserRole | null,
        hasCompletedOnboarding: onboarding === 'true',
        language: lang as Language | null,
        isAuthenticated: authenticated === 'true',
        profileUpdateTrigger: 0,
      };
    },
  });

  const customers = useMemo(() => customersQuery.data ?? mockCustomers, [customersQuery.data]);
  const equipment = useMemo(() => equipmentQuery.data ?? mockEquipment, [equipmentQuery.data]);
  const jobs = useMemo(() => jobsQuery.data ?? mockJobs, [jobsQuery.data]);
  const invoices = useMemo(() => invoicesQuery.data ?? mockInvoices, [invoicesQuery.data]);
  const technicians = useMemo(() => techniciansQuery.data ?? mockTechnicians, [techniciansQuery.data]);
  const messages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);
  const jobComments = useMemo(() => jobCommentsQuery.data ?? [], [jobCommentsQuery.data]);
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);
  const technicianPermissions = useMemo(() => permissionsQuery.data ?? {
    canViewCustomers: true,
    canAddEditCustomers: false,
    canDeleteCustomers: false,
    canViewInvoices: true,
    canCreateInvoices: false,
    canEditInvoices: false,
    canDeleteInvoices: false,
    canViewAllJobs: true,
    canEditAllJobs: false,
    canViewReports: false,
    canManageTeam: false,
    canViewPricing: true,
    canEditPricing: false,
    canAccessMessaging: true,
    canImportExport: false,
  } as TechnicianPermissions, [permissionsQuery.data]);

  const hasPin = Boolean(authQuery.data?.pin);
  const hasRole = Boolean(authQuery.data?.userRole);
  const hasLanguage = authQuery.data?.language !== null && authQuery.data?.language !== undefined;
  const hasCompletedOnboarding = authQuery.data?.hasCompletedOnboarding ?? false;
  const userRole = authQuery.data?.userRole ?? null;
  const language = authQuery.data?.language ?? 'en';
  const isAuthenticated = authQuery.data?.isAuthenticated ?? false;
  const profileUpdateTrigger = authQuery.data?.profileUpdateTrigger ?? 0;

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });
  const { mutate: mutateTechnicians } = techniciansMutation;

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

  const permissionsMutation = useMutation({
    mutationFn: async (newPermissions: TechnicianPermissions) => {
      await AsyncStorage.setItem('technicianPermissions', JSON.stringify(newPermissions));
      return newPermissions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicianPermissions'] });
    },
  });
  const { mutate: mutateEvents } = eventsMutation;
  const { mutateAsync: mutatePermissions } = permissionsMutation;

  const authMutation = useMutation({
    mutationFn: async (updates: {
      pin?: string;
      userRole?: UserRole;
      hasCompletedOnboarding?: boolean;
      language?: Language;
      isAuthenticated?: boolean;
      profileUpdateTrigger?: number;
    }) => {
      console.log('authMutation - mutationFn called with:', updates);
      const promises = [];
      if (updates.pin !== undefined) {
        promises.push(AsyncStorage.setItem('userPin', updates.pin));
      }
      if (updates.userRole !== undefined) {
        promises.push(AsyncStorage.setItem('userRole', updates.userRole));
      }
      if (updates.hasCompletedOnboarding !== undefined) {
        promises.push(AsyncStorage.setItem('hasCompletedOnboarding', updates.hasCompletedOnboarding ? 'true' : 'false'));
      }
      if (updates.language !== undefined) {
        promises.push(AsyncStorage.setItem('language', updates.language));
      }
      if (updates.isAuthenticated !== undefined) {
        promises.push(AsyncStorage.setItem('isAuthenticated', updates.isAuthenticated ? 'true' : 'false'));
      }
      await Promise.all(promises);
      console.log('authMutation - AsyncStorage updated');
      return updates;
    },
    onSuccess: async () => {
      console.log('authMutation - onSuccess, invalidating queries');
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      await queryClient.refetchQueries({ queryKey: ['auth'] });
      console.log('authMutation - queries refetched');
    },
  });
  const { mutateAsync: mutateAuth } = authMutation;

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
    console.log('setPin - starting');
    await mutateAuth({ pin, isAuthenticated: true });
    console.log('setPin - mutateAuth completed');
  }, [mutateAuth]);

  const setUserRole = useCallback(async (role: UserRole) => {
    await mutateAuth({ userRole: role });
  }, [mutateAuth]);

  const setLanguage = useCallback(async (lang: Language) => {
    await mutateAuth({ language: lang });
  }, [mutateAuth]);

  const authenticatePin = useCallback(async (pin: string): Promise<boolean> => {
    if (pin === 'biometric-auth-success' || authQuery.data?.pin === pin) {
      await mutateAuth({ isAuthenticated: true });
      return true;
    }
    return false;
  }, [authQuery.data?.pin, mutateAuth]);

  const logout = useCallback(async () => {
    await mutateAuth({ isAuthenticated: false });
  }, [mutateAuth]);

  const triggerProfileUpdate = useCallback(async () => {
    await mutateAuth({ profileUpdateTrigger: (profileUpdateTrigger ?? 0) + 1 });
  }, [profileUpdateTrigger, mutateAuth]);

  const completeOnboarding = useCallback(async () => {
    await mutateAuth({ hasCompletedOnboarding: true });
  }, [mutateAuth]);

  const updateTechnicianLocation = useCallback((technicianId: string, locationUpdate: LocationUpdate) => {
    console.log('Updating technician location:', technicianId, locationUpdate);
  }, []);

  const updateTechnicianStatus = useCallback((technicianId: string, status: TechnicianStatus) => {
    console.log('Updating technician status:', technicianId, status);
  }, []);

  const getTechniciansByStatus = useCallback((status: TechnicianStatus['status']) => {
    return technicians.filter((tech: Technician) => tech.status?.status === status);
  }, [technicians]);

  const getActiveTechnicians = useCallback(() => {
    return technicians.filter((tech: Technician) => tech.availability !== 'offline');
  }, [technicians]);

  const addTechnician = useCallback((technician: Omit<Technician, 'id'>) => {
    const newTechnician: Technician = { ...technician, id: `tech${Date.now()}` } as Technician;
    mutateTechnicians([...technicians, newTechnician]);
  }, [technicians, mutateTechnicians]);

  const updateTechnician = useCallback((technicianId: string, updates: Partial<Technician>) => {
    const updatedTechnicians = technicians.map((tech: Technician) => (tech.id === technicianId ? { ...tech, ...updates } : tech));
    mutateTechnicians(updatedTechnicians);
  }, [technicians, mutateTechnicians]);

  const deleteTechnician = useCallback((technicianId: string) => {
    const updated = technicians.filter((tech: Technician) => tech.id !== technicianId);
    mutateTechnicians(updated);
  }, [technicians, mutateTechnicians]);

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

  const updateTechnicianPermissions = useCallback(async (permissions: Partial<TechnicianPermissions>) => {
    const updated = { ...technicianPermissions, ...permissions };
    await mutatePermissions(updated);
  }, [technicianPermissions, mutatePermissions]);

  const canAccess = useCallback((permission: keyof TechnicianPermissions): boolean => {
    if (userRole === 'owner') return true;
    return technicianPermissions[permission];
  }, [userRole, technicianPermissions]);

  const isLoading = 
    customersQuery.isLoading || 
    equipmentQuery.isLoading || 
    jobsQuery.isLoading || 
    invoicesQuery.isLoading || 
    techniciansQuery.isLoading || 
    messagesQuery.isLoading || 
    jobCommentsQuery.isLoading || 
    eventsQuery.isLoading ||
    permissionsQuery.isLoading ||
    authQuery.isLoading;

  return useMemo(() => ({
    customers,
    equipment,
    jobs,
    invoices,
    technicians,
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
    technicianPermissions,
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
    updateTechnicianPermissions,
    canAccess,
  }), [
    customers,
    equipment,
    jobs,
    invoices,
    technicians,
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
    technicianPermissions,
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
    updateTechnicianPermissions,
    canAccess,
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
