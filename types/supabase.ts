export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          notes: string | null
          created_at: string
          preferred_technician: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: string
          notes?: string | null
          created_at?: string
          preferred_technician?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          notes?: string | null
          created_at?: string
          preferred_technician?: string | null
          tags?: string[] | null
          user_id?: string
        }
      }
      equipment: {
        Row: {
          id: string
          customer_id: string
          type: string
          brand: string
          model: string
          serial_number: string
          install_date: string | null
          warranty_expiry: string | null
          last_service_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          type: string
          brand: string
          model: string
          serial_number: string
          install_date?: string | null
          warranty_expiry?: string | null
          last_service_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          type?: string
          brand?: string
          model?: string
          serial_number?: string
          install_date?: string | null
          warranty_expiry?: string | null
          last_service_date?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          customer_id: string
          customer_name: string
          address: string
          scheduled_date: string
          scheduled_time: string
          status: string
          priority: string
          type: string
          description: string
          technician_id: string | null
          technician_name: string | null
          equipment_id: string | null
          estimated_duration: number | null
          notes: string | null
          photos: string[] | null
          signature: string | null
          completed_at: string | null
          invoice_id: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          customer_id: string
          customer_name: string
          address: string
          scheduled_date: string
          scheduled_time: string
          status: string
          priority: string
          type: string
          description: string
          technician_id?: string | null
          technician_name?: string | null
          equipment_id?: string | null
          estimated_duration?: number | null
          notes?: string | null
          photos?: string[] | null
          signature?: string | null
          completed_at?: string | null
          invoice_id?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          customer_id?: string
          customer_name?: string
          address?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          priority?: string
          type?: string
          description?: string
          technician_id?: string | null
          technician_name?: string | null
          equipment_id?: string | null
          estimated_duration?: number | null
          notes?: string | null
          photos?: string[] | null
          signature?: string | null
          completed_at?: string | null
          invoice_id?: string | null
          created_at?: string
          user_id?: string
        }
      }
      invoices: {
        Row: {
          id: string
          job_id: string
          customer_id: string
          customer_name: string
          date: string
          due_date: string
          status: string
          items: Json
          subtotal: number
          tax: number
          total: number
          paid_amount: number
          payment_method: string | null
          notes: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          job_id: string
          customer_id: string
          customer_name: string
          date: string
          due_date: string
          status: string
          items: Json
          subtotal: number
          tax: number
          total: number
          paid_amount?: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          job_id?: string
          customer_id?: string
          customer_name?: string
          date?: string
          due_date?: string
          status?: string
          items?: Json
          subtotal?: number
          tax?: number
          total?: number
          paid_amount?: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          user_id?: string
        }
      }
      technicians: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          specialties: string[] | null
          skills: string[] | null
          certifications: string[] | null
          availability: string
          current_job_id: string | null
          location: Json | null
          status: Json | null
          last_update: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          specialties?: string[] | null
          skills?: string[] | null
          certifications?: string[] | null
          availability?: string
          current_job_id?: string | null
          location?: Json | null
          status?: Json | null
          last_update?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          specialties?: string[] | null
          skills?: string[] | null
          certifications?: string[] | null
          availability?: string
          current_job_id?: string | null
          location?: Json | null
          status?: Json | null
          last_update?: string | null
          created_at?: string
          user_id?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          sender_name: string
          sender_role: string
          recipient_id: string
          recipient_name: string
          content: string
          timestamp: string
          read: boolean
          job_id: string | null
          attachments: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          sender_name: string
          sender_role: string
          recipient_id: string
          recipient_name: string
          content: string
          timestamp?: string
          read?: boolean
          job_id?: string | null
          attachments?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
          recipient_id?: string
          recipient_name?: string
          content?: string
          timestamp?: string
          read?: boolean
          job_id?: string | null
          attachments?: Json | null
          created_at?: string
        }
      }
      job_comments: {
        Row: {
          id: string
          job_id: string
          author_id: string
          author_name: string
          author_role: string
          content: string
          timestamp: string
          photos: string[] | null
          edited: boolean | null
          edited_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          author_id: string
          author_name: string
          author_role: string
          content: string
          timestamp?: string
          photos?: string[] | null
          edited?: boolean | null
          edited_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          author_id?: string
          author_name?: string
          author_role?: string
          content?: string
          timestamp?: string
          photos?: string[] | null
          edited?: boolean | null
          edited_at?: string | null
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          start_time: string
          end_time: string | null
          type: string
          location: string | null
          attendees: string[] | null
          color: string | null
          all_day: boolean | null
          created_at: string
          created_by: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          start_time: string
          end_time?: string | null
          type: string
          location?: string | null
          attendees?: string[] | null
          color?: string | null
          all_day?: boolean | null
          created_at?: string
          created_by: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          start_time?: string
          end_time?: string | null
          type?: string
          location?: string | null
          attendees?: string[] | null
          color?: string | null
          all_day?: boolean | null
          created_at?: string
          created_by?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
