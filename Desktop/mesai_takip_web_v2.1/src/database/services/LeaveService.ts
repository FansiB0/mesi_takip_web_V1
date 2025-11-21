import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';
import type { Leave } from '../../types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client if configured
const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export class LeaveService {
  async getAll(): Promise<Leave[]> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get leaves', error, 'LeaveService');
        throw error;
      }

      const leaves: Leave[] = data.map(data => ({
        id: data.id,
        userId: data.user_id,
        startDate: data.start_date,
        endDate: data.end_date,
        type: data.type as 'annual' | 'sick' | 'personal' | 'other',
        status: data.status as 'pending' | 'approved' | 'rejected',
        reason: '',
        leaveType: data.type,
        daysUsed: 0,
        created_at: data.created_at
      }));

      return leaves;
    } catch (error) {
      logger.error('Failed to get leaves', error, 'LeaveService');
      throw error;
    }
  }

  async getByUserId(userId: string): Promise<Leave[]> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get leaves by user', error, 'LeaveService');
        throw error;
      }

      const leaves: Leave[] = data.map(data => ({
        id: data.id,
        userId: data.user_id,
        startDate: data.start_date,
        endDate: data.end_date,
        type: data.type as 'annual' | 'sick' | 'personal' | 'other',
        status: data.status as 'pending' | 'approved' | 'rejected',
        reason: '',
        leaveType: data.type,
        daysUsed: 0,
        created_at: data.created_at
      }));

      return leaves;
    } catch (error) {
      logger.error('Failed to get leaves by user', error, 'LeaveService');
      throw error;
    }
  }

  async create(leaveData: Omit<Leave, 'id' | 'createdAt'>): Promise<Leave> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('leaves')
        .insert({
          user_id: leaveData.userId,
          start_date: leaveData.startDate,
          end_date: leaveData.endDate,
          type: leaveData.type,
          status: leaveData.status || 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create leave', error, 'LeaveService');
        throw error;
      }

      const leave: Leave = {
        id: data.id,
        userId: data.user_id,
        startDate: data.start_date,
        endDate: data.end_date,
        type: data.type as 'annual' | 'sick' | 'personal' | 'other',
        status: data.status as 'pending' | 'approved' | 'rejected',
        reason: '',
        leaveType: data.type,
        daysUsed: 0,
        created_at: data.created_at
      };

      logger.info('Leave created', { leaveId: leave.id }, 'LeaveService');
      return leave;
    } catch (error) {
      logger.error('Failed to create leave', error, 'LeaveService');
      throw error;
    }
  }

  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Leave> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('leaves')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update leave status', error, 'LeaveService');
        throw error;
      }

      const leave: Leave = {
        id: data.id,
        userId: data.user_id,
        startDate: data.start_date,
        endDate: data.end_date,
        type: data.type as 'annual' | 'sick' | 'personal' | 'other',
        status: data.status as 'pending' | 'approved' | 'rejected',
        reason: '',
        leaveType: data.type,
        daysUsed: 0,
        created_at: data.created_at
      };

      logger.info('Leave status updated', { leaveId: id, status }, 'LeaveService');
      return leave;
    } catch (error) {
      logger.error('Failed to update leave status', error, 'LeaveService');
      throw error;
    }
  }

  async createDemoLeaves(): Promise<void> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      // Check if demo leaves already exist
      const { data: existingLeaves } = await supabase
        .from('leaves')
        .select('id')
        .limit(5);

      if (existingLeaves && existingLeaves.length > 0) {
        logger.info('Demo leaves already exist', { count: existingLeaves.length }, 'LeaveService');
        return;
      }

      // Create demo leaves
      const demoLeaves = [
        {
          user_id: 'demo-user-1',
          start_date: '2024-02-01',
          end_date: '2024-02-05',
          type: 'annual',
          status: 'pending'
        },
        {
          user_id: 'demo-user-2',
          start_date: '2024-02-10',
          end_date: '2024-02-12',
          type: 'sick',
          status: 'approved'
        }
      ];

      const { error } = await supabase
        .from('leaves')
        .insert(demoLeaves.map(leave => ({
          ...leave,
          created_at: new Date().toISOString()
        })));

      if (error) {
        logger.error('Failed to create demo leaves', error, 'LeaveService');
        throw error;
      }

      logger.info('Demo leaves created successfully', { count: demoLeaves.length }, 'LeaveService');
    } catch (error) {
      logger.error('Failed to create demo leaves', error, 'LeaveService');
      throw error;
    }
  }

  async update(id: string, updates: Partial<Leave>): Promise<Leave> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const updateData: any = {};

      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.endDate) updateData.end_date = updates.endDate;
      if (updates.type) updateData.type = updates.type;
      if (updates.status) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('leaves')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update leave', error, 'LeaveService');
        throw error;
      }

      const leave: Leave = {
        id: data.id,
        userId: data.user_id,
        startDate: data.start_date,
        endDate: data.end_date,
        type: data.type as 'annual' | 'sick' | 'personal' | 'other',
        status: data.status as 'pending' | 'approved' | 'rejected',
        reason: '',
        leaveType: data.type,
        daysUsed: 0,
        created_at: data.created_at
      };

      logger.info('Leave updated', { leaveId: id }, 'LeaveService');
      return leave;
    } catch (error) {
      logger.error('Failed to update leave', error, 'LeaveService');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { error } = await supabase
        .from('leaves')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Failed to delete leave', error, 'LeaveService');
        throw error;
      }

      logger.info('Leave deleted', { leaveId: id }, 'LeaveService');
    } catch (error) {
      logger.error('Failed to delete leave', error, 'LeaveService');
      throw error;
    }
  }

  async getAllLeaves(): Promise<Leave[]> {
    return this.getAll();
  }

  async createLeave(leaveData: Omit<Leave, 'id' | 'createdAt'>): Promise<Leave> {
    return this.create(leaveData);
  }

  async updateLeave(id: string, updates: Partial<Leave>): Promise<Leave> {
    return this.update(id, updates);
  }

  async deleteLeave(id: string): Promise<void> {
    return this.delete(id);
  }
}

// Export the service instance
export const leaveService = new LeaveService();
