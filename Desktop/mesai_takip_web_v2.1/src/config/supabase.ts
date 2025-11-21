import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client if configured
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log configuration status
if (isConfigured) {
  logger.info('Supabase client initialized', { url: supabaseUrl }, 'SupabaseConfig');
} else {
  logger.info('Supabase not configured - using mock data', null, 'SupabaseConfig');
}

// Export configuration status
export { isConfigured };

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          employee_type: 'normal' | 'admin';
          start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          employee_type?: 'normal' | 'admin';
          start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          employee_type?: 'normal' | 'admin';
          start_date?: string;
          updated_at?: string;
        };
      };
      salaries: {
        Row: {
          id: string;
          user_id: string;
          base_salary: number;
          overtime_pay: number;
          payment_date: string;
          month: number;
          year: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          base_salary: number;
          overtime_pay?: number;
          payment_date: string;
          month: number;
          year: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          base_salary?: number;
          overtime_pay?: number;
          payment_date?: string;
          month?: number;
          year?: number;
          updated_at?: string;
        };
      };
      overtimes: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          hours: number;
          reason?: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          hours: number;
          reason?: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          hours?: number;
          reason?: string;
          status?: 'pending' | 'approved' | 'rejected';
        };
      };
      leaves: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          type: 'annual' | 'sick' | 'unpaid';
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date: string;
          type: 'annual' | 'sick' | 'unpaid';
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string;
          type?: 'annual' | 'sick' | 'unpaid';
          status?: 'pending' | 'approved' | 'rejected';
        };
      };
      holidays: {
        Row: {
          id: string;
          date: string;
          name: string;
          is_recurring: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          name: string;
          is_recurring?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          name?: string;
          is_recurring?: boolean;
        };
      };
    };
  };
}