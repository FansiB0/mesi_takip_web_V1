import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';
import type { User } from '../../types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client if configured
const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export class UserService {
  async create(userData: Omit<User, 'id'>): Promise<User> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name,
          employee_type: userData.employeeType,
          start_date: userData.startDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create user', error, 'UserService');
        throw error;
      }

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        employeeType: data.employee_type as 'normal' | 'admin',
        startDate: data.start_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      logger.info('User created', { userId: user.id }, 'UserService');
      return user;
    } catch (error) {
      logger.error('Failed to create user', error, 'UserService');
      throw error;
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Failed to get user by ID', error, 'UserService');
        return null;
      }

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        employeeType: data.employee_type as 'normal' | 'admin',
        startDate: data.start_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return user;
    } catch (error) {
      logger.error('Failed to get user by ID', error, 'UserService');
      throw error;
    }
  }

  async getAll(): Promise<User[]> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get all users', error, 'UserService');
        throw error;
      }

      const users: User[] = data.map(data => ({
        id: data.id,
        email: data.email,
        name: data.name,
        employeeType: data.employee_type as 'normal' | 'admin',
        startDate: data.start_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }));

      return users;
    } catch (error) {
      logger.error('Failed to get all users', error, 'UserService');
      throw error;
    }
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.employeeType) updateData.employee_type = updates.employeeType;
      if (updates.startDate) updateData.start_date = updates.startDate;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update user', error, 'UserService');
        throw error;
      }

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        employeeType: data.employee_type as 'normal' | 'admin',
        startDate: data.start_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      logger.info('User updated', { userId: id }, 'UserService');
      return user;
    } catch (error) {
      logger.error('Failed to update user', error, 'UserService');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Failed to delete user', error, 'UserService');
        throw error;
      }

      logger.info('User deleted', { userId: id }, 'UserService');
    } catch (error) {
      logger.error('Failed to delete user', error, 'UserService');
      throw error;
    }
  }

  async createDemoUsers(): Promise<void> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      // Check if demo users already exist
      const { data: existingUsers } = await supabase
        .from('users')
        .select('email')
        .in('email', ['ahmet@company.com', 'ayse@company.com', 'admin@company.com']);

      if (existingUsers && existingUsers.length > 0) {
        logger.info('Demo users already exist', { count: existingUsers.length }, 'UserService');
        return;
      }

      // Create demo users
      const demoUsers = [
        {
          email: 'ahmet@company.com',
          name: 'Ahmet Yılmaz',
          employee_type: 'normal',
          start_date: '2024-01-15'
        },
        {
          email: 'ayse@company.com',
          name: 'Ayşe Demir',
          employee_type: 'normal',
          start_date: '2024-02-01'
        },
        {
          email: 'admin@company.com',
          name: 'Admin User',
          employee_type: 'admin',
          start_date: '2024-01-01'
        }
      ];

      const { error } = await supabase
        .from('users')
        .insert(demoUsers.map(user => ({
          ...user,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));

      if (error) {
        logger.error('Failed to create demo users', error, 'UserService');
        throw error;
      }

      logger.info('Demo users created successfully', { count: demoUsers.length }, 'UserService');
    } catch (error) {
      logger.error('Failed to create demo users', error, 'UserService');
      throw error;
    }
  }
}

// Export the service instance
export const userService = new UserService();