import { Customer, Equipment, Job, Invoice, Technician } from '@/types';

// Empty initial technicians - will be populated when company sets up their team
export const mockTechnicians: Technician[] = [];

// Empty initial customers - will be populated as company adds their clients
export const mockCustomers: Customer[] = [];

// Empty initial equipment - will be populated as customers and their equipment are added
export const mockEquipment: Equipment[] = [];

export const mockJobs: Job[] = [];

// Empty initial invoices - will be created as jobs are completed
export const mockInvoices: Invoice[] = [];