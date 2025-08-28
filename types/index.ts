export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  equipment: Equipment[];
  serviceHistory: Job[];
  notes?: string;
  createdAt: string;
  preferredTech?: string;
}

export interface Equipment {
  id: string;
  customerId: string;
  type: 'AC' | 'Furnace' | 'Refrigerator' | 'Freezer' | 'HVAC' | 'Other';
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
  status: 'scheduled' | 'inProgress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  type: 'repair' | 'maintenance' | 'installation' | 'inspection';
  description: string;
  technicianId?: string;
  technicianName?: string;
  equipmentId?: string;
  duration: number; // in minutes
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
  type: 'labor' | 'part' | 'service';
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  availability: 'available' | 'busy' | 'offline';
  currentJobId?: string;
}