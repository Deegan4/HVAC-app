import { supabase } from './supabase';
import { Customer, Equipment, Job, Invoice, Technician, Message, JobComment, CalendarEvent } from '@/types';

export const supabaseQueries = {
  customers: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(transformCustomerFromDB);
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return transformCustomerFromDB(data);
    },

    async create(customer: Omit<Customer, 'id' | 'createdAt' | 'equipment' | 'serviceHistory'>, userId: string) {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          notes: customer.notes || null,
          preferred_technician: customer.preferredTechnician || null,
          tags: customer.tags || null,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformCustomerFromDB(data);
    },

    async update(id: string, updates: Partial<Customer>) {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
          notes: updates.notes || null,
          preferred_technician: updates.preferredTechnician || null,
          tags: updates.tags || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformCustomerFromDB(data);
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },

  equipment: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('equipment')
        .select('*, customers!inner(user_id)')
        .eq('customers.user_id', userId);
      
      if (error) throw error;
      return data.map(transformEquipmentFromDB);
    },

    async getByCustomer(customerId: string) {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('customer_id', customerId);
      
      if (error) throw error;
      return data.map(transformEquipmentFromDB);
    },

    async create(equipment: Omit<Equipment, 'id'>) {
      const { data, error } = await supabase
        .from('equipment')
        .insert({
          customer_id: equipment.customerId,
          type: equipment.type,
          brand: equipment.brand,
          model: equipment.model,
          serial_number: equipment.serialNumber,
          install_date: equipment.installDate || null,
          warranty_expiry: equipment.warrantyExpiry || null,
          last_service_date: equipment.lastServiceDate || null,
          notes: equipment.notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformEquipmentFromDB(data);
    },

    async update(id: string, updates: Partial<Equipment>) {
      const { data, error } = await supabase
        .from('equipment')
        .update({
          type: updates.type,
          brand: updates.brand,
          model: updates.model,
          serial_number: updates.serialNumber,
          install_date: updates.installDate || null,
          warranty_expiry: updates.warrantyExpiry || null,
          last_service_date: updates.lastServiceDate || null,
          notes: updates.notes || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformEquipmentFromDB(data);
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },

  jobs: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: false });
      
      if (error) throw error;
      return data.map(transformJobFromDB);
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return transformJobFromDB(data);
    },

    async create(job: Omit<Job, 'id'>, userId: string) {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          customer_id: job.customerId,
          customer_name: job.customerName,
          address: job.address,
          scheduled_date: job.scheduledDate,
          scheduled_time: job.scheduledTime,
          status: job.status,
          priority: job.priority,
          type: job.type,
          description: job.description,
          technician_id: job.technicianId || null,
          technician_name: job.technicianName || null,
          equipment_id: job.equipmentId || null,
          estimated_duration: job.estimatedDuration || null,
          notes: job.notes || null,
          photos: job.photos || null,
          signature: job.signature || null,
          completed_at: job.completedAt || null,
          invoice_id: job.invoiceId || null,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformJobFromDB(data);
    },

    async update(id: string, updates: Partial<Job>) {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          customer_id: updates.customerId,
          customer_name: updates.customerName,
          address: updates.address,
          scheduled_date: updates.scheduledDate,
          scheduled_time: updates.scheduledTime,
          status: updates.status,
          priority: updates.priority,
          type: updates.type,
          description: updates.description,
          technician_id: updates.technicianId || null,
          technician_name: updates.technicianName || null,
          equipment_id: updates.equipmentId || null,
          estimated_duration: updates.estimatedDuration || null,
          notes: updates.notes || null,
          photos: updates.photos || null,
          signature: updates.signature || null,
          completed_at: updates.completedAt || null,
          invoice_id: updates.invoiceId || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformJobFromDB(data);
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },

  invoices: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data.map(transformInvoiceFromDB);
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return transformInvoiceFromDB(data);
    },

    async create(invoice: Omit<Invoice, 'id'>, userId: string) {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          job_id: invoice.jobId,
          customer_id: invoice.customerId,
          customer_name: invoice.customerName,
          date: invoice.date,
          due_date: invoice.dueDate,
          status: invoice.status,
          items: invoice.items as any,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total,
          paid_amount: invoice.paidAmount,
          payment_method: invoice.paymentMethod || null,
          notes: invoice.notes || null,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformInvoiceFromDB(data);
    },

    async update(id: string, updates: Partial<Invoice>) {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          job_id: updates.jobId,
          customer_id: updates.customerId,
          customer_name: updates.customerName,
          date: updates.date,
          due_date: updates.dueDate,
          status: updates.status,
          items: updates.items as any,
          subtotal: updates.subtotal,
          tax: updates.tax,
          total: updates.total,
          paid_amount: updates.paidAmount,
          payment_method: updates.paymentMethod || null,
          notes: updates.notes || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformInvoiceFromDB(data);
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },

  technicians: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data.map(transformTechnicianFromDB);
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return transformTechnicianFromDB(data);
    },

    async create(technician: Omit<Technician, 'id'>, userId: string) {
      const { data, error } = await supabase
        .from('technicians')
        .insert({
          name: technician.name,
          email: technician.email,
          phone: technician.phone,
          specialties: technician.specialties || null,
          skills: technician.skills || null,
          certifications: technician.certifications || null,
          availability: technician.availability,
          current_job_id: technician.currentJobId || null,
          location: technician.location as any || null,
          status: technician.status as any || null,
          last_update: technician.lastUpdate || null,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformTechnicianFromDB(data);
    },

    async update(id: string, updates: Partial<Technician>) {
      const { data, error } = await supabase
        .from('technicians')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          specialties: updates.specialties || null,
          skills: updates.skills || null,
          certifications: updates.certifications || null,
          availability: updates.availability,
          current_job_id: updates.currentJobId || null,
          location: updates.location as any || null,
          status: updates.status as any || null,
          last_update: updates.lastUpdate || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformTechnicianFromDB(data);
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },

  messages: {
    async getAll() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data.map(transformMessageFromDB);
    },

    async create(message: Omit<Message, 'id' | 'timestamp' | 'read'>) {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: message.senderId,
          sender_name: message.senderName,
          sender_role: message.senderRole,
          recipient_id: message.recipientId,
          recipient_name: message.recipientName,
          content: message.content,
          job_id: message.jobId || null,
          attachments: message.attachments as any || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformMessageFromDB(data);
    },

    async markAsRead(id: string) {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
  },

  jobComments: {
    async getByJob(jobId: string) {
      const { data, error } = await supabase
        .from('job_comments')
        .select('*')
        .eq('job_id', jobId)
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      return data.map(transformJobCommentFromDB);
    },

    async create(comment: Omit<JobComment, 'id' | 'timestamp'>) {
      const { data, error } = await supabase
        .from('job_comments')
        .insert({
          job_id: comment.jobId,
          author_id: comment.authorId,
          author_name: comment.authorName,
          author_role: comment.authorRole,
          content: comment.content,
          photos: comment.photos || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformJobCommentFromDB(data);
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('job_comments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },

  events: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data.map(transformEventFromDB);
    },

    async create(event: Omit<CalendarEvent, 'id' | 'createdAt'>, userId: string) {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: event.title,
          description: event.description || null,
          date: event.date,
          start_time: event.startTime,
          end_time: event.endTime || null,
          type: event.type,
          location: event.location || null,
          attendees: event.attendees || null,
          color: event.color || null,
          all_day: event.allDay || null,
          created_by: event.createdBy,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformEventFromDB(data);
    },

    async update(id: string, updates: Partial<CalendarEvent>) {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: updates.title,
          description: updates.description || null,
          date: updates.date,
          start_time: updates.startTime,
          end_time: updates.endTime || null,
          type: updates.type,
          location: updates.location || null,
          attendees: updates.attendees || null,
          color: updates.color || null,
          all_day: updates.allDay || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformEventFromDB(data);
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },
};

function transformCustomerFromDB(data: any): Customer {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    equipment: [],
    serviceHistory: [],
    notes: data.notes,
    createdAt: data.created_at,
    preferredTechnician: data.preferred_technician,
    tags: data.tags,
  };
}

function transformEquipmentFromDB(data: any): Equipment {
  return {
    id: data.id,
    customerId: data.customer_id,
    type: data.type,
    brand: data.brand,
    model: data.model,
    serialNumber: data.serial_number,
    installDate: data.install_date,
    warrantyExpiry: data.warranty_expiry,
    lastServiceDate: data.last_service_date,
    notes: data.notes,
  };
}

function transformJobFromDB(data: any): Job {
  return {
    id: data.id,
    customerId: data.customer_id,
    customerName: data.customer_name,
    address: data.address,
    scheduledDate: data.scheduled_date,
    scheduledTime: data.scheduled_time,
    status: data.status,
    priority: data.priority,
    type: data.type,
    description: data.description,
    technicianId: data.technician_id,
    technicianName: data.technician_name,
    equipmentId: data.equipment_id,
    estimatedDuration: data.estimated_duration,
    notes: data.notes,
    photos: data.photos,
    signature: data.signature,
    completedAt: data.completed_at,
    invoiceId: data.invoice_id,
  };
}

function transformInvoiceFromDB(data: any): Invoice {
  return {
    id: data.id,
    jobId: data.job_id,
    customerId: data.customer_id,
    customerName: data.customer_name,
    date: data.date,
    dueDate: data.due_date,
    status: data.status,
    items: data.items,
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    paidAmount: data.paid_amount,
    paymentMethod: data.payment_method,
    notes: data.notes,
  };
}

function transformTechnicianFromDB(data: any): Technician {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    specialties: data.specialties,
    skills: data.skills,
    certifications: data.certifications,
    availability: data.availability,
    currentJobId: data.current_job_id,
    location: data.location,
    status: data.status,
    lastUpdate: data.last_update,
  };
}

function transformMessageFromDB(data: any): Message {
  return {
    id: data.id,
    senderId: data.sender_id,
    senderName: data.sender_name,
    senderRole: data.sender_role,
    recipientId: data.recipient_id,
    recipientName: data.recipient_name,
    content: data.content,
    timestamp: data.timestamp,
    read: data.read,
    jobId: data.job_id,
    attachments: data.attachments,
  };
}

function transformJobCommentFromDB(data: any): JobComment {
  return {
    id: data.id,
    jobId: data.job_id,
    authorId: data.author_id,
    authorName: data.author_name,
    authorRole: data.author_role,
    content: data.content,
    timestamp: data.timestamp,
    photos: data.photos,
    edited: data.edited,
    editedAt: data.edited_at,
  };
}

function transformEventFromDB(data: any): CalendarEvent {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    date: data.date,
    startTime: data.start_time,
    endTime: data.end_time,
    type: data.type,
    location: data.location,
    attendees: data.attendees,
    color: data.color,
    allDay: data.all_day,
    createdAt: data.created_at,
    createdBy: data.created_by,
  };
}
