export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  equipment: string[]; // Equipment IDs
  serviceHistory: string[]; // Job IDs
  notes?: string;
  createdAt: string;
  preferredTechnician?: string;
  tags?: string[];
}

export interface Equipment {
  id: string;
  customerId: string;
  type: 'Kitchen' | 'Bathroom' | 'Roof' | 'Foundation' | 'Electrical' | 'Plumbing' | 'Other';
  brand: string;
  model: string;
  serialNumber: string;
  installDate?: string;
  warrantyExpiry?: string;
  lastServiceDate?: string;
  notes?: string;
}

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'in-progress' | 'inProgress' | 'completed' | 'cancelled' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  type: 'repair' | 'maintenance' | 'installation' | 'inspection' | 'construction' | 'consulting';
  description: string;
  technicianId?: string;
  technicianName?: string;
  equipmentId?: string;
  duration?: number; // in minutes
  estimatedDuration?: number; // in hours
  notes?: string;
  photos?: string[];
  signature?: string;
  completedAt?: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  paymentMethod?: 'cash' | 'check' | 'card' | 'transfer';
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type?: 'labor' | 'part' | 'service';
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties?: string[];
  skills?: string[];
  certifications?: string[];
  availability: 'available' | 'busy' | 'offline';
  currentJobId?: string;
  lastUpdate?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'technician';
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: string;
  read: boolean;
  jobId?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'photo' | 'document';
  uri: string;
  name: string;
  size?: number;
}

export interface JobComment {
  id: string;
  jobId: string;
  authorId: string;
  authorName: string;
  authorRole: 'owner' | 'technician';
  content: string;
  timestamp: string;
  photos?: string[];
  edited?: boolean;
  editedAt?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'owner' | 'technician';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  type: 'meeting' | 'reminder' | 'appointment' | 'other';
  location?: string;
  attendees?: string[];
  color?: string;
  allDay?: boolean;
  createdAt: string;
  createdBy: string;
}

export interface TechnicianPermissions {
  canViewCustomers: boolean;
  canAddEditCustomers: boolean;
  canDeleteCustomers: boolean;
  canViewInvoices: boolean;
  canCreateInvoices: boolean;
  canEditInvoices: boolean;
  canDeleteInvoices: boolean;
  canViewAllJobs: boolean;
  canEditAllJobs: boolean;
  canViewReports: boolean;
  canManageTeam: boolean;
  canViewPricing: boolean;
  canEditPricing: boolean;
  canAccessMessaging: boolean;
  canImportExport: boolean;
}

export type SubscriptionPlan = 'basic' | 'essentials' | 'max' | null;

export interface Subscription {
  plan: SubscriptionPlan;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  maxUsers: number;
  features: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  customerManagement: boolean;
  jobScheduling: boolean;
  invoicing: boolean;
  priceBook: boolean;
  equipmentTracking: boolean;
  serviceHistory: boolean;
  photoSignature: boolean;
  mobileAccess: boolean;
  teamManagement: boolean;
  teamMessaging: boolean;
  quickbooksIntegration: boolean;
  reportsAnalytics: boolean;
  calendarTools: boolean;
  multiTechnician: boolean;
  aiAnsweringService: boolean;
  advancedAnalytics: boolean;
  customServiceSettings: boolean;
  importExport: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
}