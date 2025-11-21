import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';
import type { Overtime } from '../../types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client if configured
const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export class OvertimeService {
  async getAll(): Promise<Overtime[]> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('overtimes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get overtimes', error, 'OvertimeService');
        throw error;
      }

      const overtimes: Overtime[] = data.map(data => ({
        id: data.id,
        userId: data.user_id,
        date: data.date,
        hours: data.hours,
        description: data.reason || '',
        status: data.status as 'pending' | 'approved' | 'rejected',
        hourlyRate: 0,
        totalPayment: 0,
        created_at: data.created_at
      }));

      return overtimes;
    } catch (error) {
      logger.error('Failed to get overtimes', error, 'OvertimeService');
      throw error;
    }
  }

  async getByUserId(userId: string): Promise<Overtime[]> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('overtimes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get overtimes by user', error, 'OvertimeService');
        throw error;
      }

      const overtimes: Overtime[] = data.map(data => ({
        id: data.id,
        userId: data.user_id,
        date: data.date,
        hours: data.hours,
        description: data.reason || '',
        status: data.status as 'pending' | 'approved' | 'rejected',
        hourlyRate: 0,
        totalPayment: 0,
        created_at: data.created_at
      }));

      return overtimes;
    } catch (error) {
      logger.error('Failed to get overtimes by user', error, 'OvertimeService');
      throw error;
    }
  }

  async create(overtimeData: Omit<Overtime, 'id' | 'createdAt' | 'hourlyRate' | 'totalPayment'>): Promise<Overtime> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('overtimes')
        .insert({
          user_id: overtimeData.userId,
          date: overtimeData.date,
          hours: overtimeData.hours,
          reason: overtimeData.description || '',
          status: overtimeData.status || 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create overtime', error, 'OvertimeService');
        throw error;
      }

      const overtime: Overtime = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        hours: data.hours,
        description: data.reason || '',
        status: data.status as 'pending' | 'approved' | 'rejected',
        hourlyRate: 0,
        totalPayment: 0,
        created_at: data.created_at
      };

      logger.info('Overtime created', { overtimeId: overtime.id }, 'OvertimeService');
      return overtime;
    } catch (error) {
      logger.error('Failed to create overtime', error, 'OvertimeService');
      throw error;
    }
  }

  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Overtime> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('overtimes')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update overtime status', error, 'OvertimeService');
        throw error;
      }

      const overtime: Overtime = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        hours: data.hours,
        description: data.reason || '',
        status: data.status as 'pending' | 'approved' | 'rejected',
        hourlyRate: 0,
        totalPayment: 0,
        created_at: data.created_at
      };

      logger.info('Overtime status updated', { overtimeId: id, status }, 'OvertimeService');
      return overtime;
    } catch (error) {
      logger.error('Failed to update overtime status', error, 'OvertimeService');
      throw error;
    }
  }

  async createDemoOvertimes(): Promise<void> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      // Check if demo overtimes already exist
      const { data: existingOvertimes } = await supabase
        .from('overtimes')
        .select('id')
        .limit(5);

      if (existingOvertimes && existingOvertimes.length > 0) {
        logger.info('Demo overtimes already exist', { count: existingOvertimes.length }, 'OvertimeService');
        return;
      }

      // Create demo overtimes
      const demoOvertimes = [
        {
          user_id: 'demo-user-1',
          date: '2024-01-15',
          hours: 8,
          reason: 'Project deadline',
          status: 'pending'
        },
        {
          user_id: 'demo-user-2',
          date: '2024-01-20',
          hours: 6,
          reason: 'Client meeting',
          status: 'approved'
        }
      ];

      const { error } = await supabase
        .from('overtimes')
        .insert(demoOvertimes.map(overtime => ({
          ...overtime,
          created_at: new Date().toISOString()
        })));

      if (error) {
        logger.error('Failed to create demo overtimes', error, 'OvertimeService');
        throw error;
      }

      logger.info('Demo overtimes created successfully', { count: demoOvertimes.length }, 'OvertimeService');
    } catch (error) {
      logger.error('Failed to create demo overtimes', error, 'OvertimeService');
      throw error;
    }
  }

  async update(id: string, updates: Partial<Overtime>): Promise<Overtime> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const updateData: any = {};

      if (updates.date) updateData.date = updates.date;
      if (updates.hours) updateData.hours = updates.hours;
      if (updates.description) updateData.reason = updates.description;
      if (updates.status) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('overtimes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update overtime', error, 'OvertimeService');
        throw error;
      }

      const overtime: Overtime = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        hours: data.hours,
        description: data.reason || '',
        status: data.status as 'pending' | 'approved' | 'rejected',
        hourlyRate: 0,
        totalPayment: 0,
        created_at: data.created_at
      };

      logger.info('Overtime updated', { overtimeId: id }, 'OvertimeService');
      return overtime;
    } catch (error) {
      logger.error('Failed to update overtime', error, 'OvertimeService');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { error } = await supabase
        .from('overtimes')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Failed to delete overtime', error, 'OvertimeService');
        throw error;
      }

      logger.info('Overtime deleted', { overtimeId: id }, 'OvertimeService');
    } catch (error) {
      logger.error('Failed to delete overtime', error, 'OvertimeService');
      throw error;
    }
  }

  async getAllOvertimes(): Promise<Overtime[]> {
    return this.getAll();
  }

  async createOvertime(overtimeData: Omit<Overtime, 'id' | 'createdAt' | 'hourlyRate' | 'totalPayment'>): Promise<Overtime> {
    return this.create(overtimeData);
  }

  async updateOvertime(id: string, updates: Partial<Overtime>): Promise<Overtime> {
    return this.update(id, updates);
  }

  async deleteOvertime(id: string): Promise<void> {
    return this.delete(id);
  }
}

// Export the service instance
export const overtimeService = new OvertimeService();
