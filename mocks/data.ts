import { Customer, Equipment, Job, Invoice, Technician } from '@/types';

export const mockTechnicians: Technician[] = [];

export const mockCustomers: Customer[] = [
  {
    id: 'cust1',
    name: 'Robert Johnson',
    email: 'rjohnson@email.com',
    phone: '(555) 345-6789',
    address: '123 Main St, San Diego, CA 92101',
    equipment: [],
    serviceHistory: [],
    createdAt: '2024-01-15',
    notes: 'Prefers morning appointments',
  },
  {
    id: 'cust2',
    name: 'Maria Garcia',
    email: 'mgarcia@email.com',
    phone: '(555) 456-7890',
    address: '456 Oak Ave, La Jolla, CA 92037',
    equipment: [],
    serviceHistory: [],
    createdAt: '2024-02-20',
  },
  {
    id: 'cust3',
    name: 'Pacific Restaurant Group',
    email: 'maintenance@pacificrestaurants.com',
    phone: '(555) 567-8901',
    address: '789 Harbor Dr, San Diego, CA 92101',
    equipment: [],
    serviceHistory: [],
    createdAt: '2023-11-10',
    notes: 'Commercial account - 24/7 emergency service',
  },
];

export const mockEquipment: Equipment[] = [
  {
    id: 'eq1',
    customerId: 'cust1',
    type: 'AC',
    brand: 'Carrier',
    model: 'Infinity 26',
    serialNumber: 'CAR2024001234',
    installDate: '2022-06-15',
    warrantyExpiry: '2032-06-15',
    lastServiceDate: '2024-10-15',
  },
  {
    id: 'eq2',
    customerId: 'cust2',
    type: 'Furnace',
    brand: 'Lennox',
    model: 'EL296V',
    serialNumber: 'LNX2023005678',
    installDate: '2023-01-20',
    warrantyExpiry: '2033-01-20',
  },
  {
    id: 'eq3',
    customerId: 'cust3',
    type: 'Refrigerator',
    brand: 'True',
    model: 'T-49-HC',
    serialNumber: 'TRU2022009012',
    installDate: '2022-03-10',
    notes: 'Commercial walk-in cooler',
  },
];

export const mockJobs: Job[] = [];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    jobId: 'job4',
    customerId: 'cust1',
    customerName: 'Robert Johnson',
    date: '2024-12-15',
    dueDate: '2025-01-15',
    status: 'paid',
    items: [
      {
        id: 'item1',
        description: 'HVAC System Inspection',
        quantity: 1,
        unitPrice: 125,
        total: 125,
        type: 'service',
      },
      {
        id: 'item2',
        description: 'Air Filter (MERV 13)',
        quantity: 2,
        unitPrice: 35,
        total: 70,
        type: 'part',
      },
    ],
    subtotal: 195,
    tax: 16.09,
    total: 211.09,
    paidAmount: 211.09,
    paymentMethod: 'card',
  },
  {
    id: 'inv2',
    jobId: 'job2',
    customerId: 'cust2',
    customerName: 'Maria Garcia',
    date: '2025-01-09',
    dueDate: '2025-02-09',
    status: 'draft',
    items: [
      {
        id: 'item3',
        description: 'Emergency Furnace Repair',
        quantity: 2,
        unitPrice: 150,
        total: 300,
        type: 'labor',
      },
      {
        id: 'item4',
        description: 'Ignitor Replacement',
        quantity: 1,
        unitPrice: 185,
        total: 185,
        type: 'part',
      },
    ],
    subtotal: 485,
    tax: 40.01,
    total: 525.01,
    paidAmount: 0,
  },
];