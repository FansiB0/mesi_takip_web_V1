import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client if configured
const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Kullanıcı profil veri tipi
export interface UserProfile {
  id?: string;
  uid: string;
  name: string;
  email: string;
  startDate: string;
  employeeType: 'normal' | 'manager' | 'admin';
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  lastLogin?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Kullanıcı profil servisi - Supabase Only
export const userProfileService = {
  // Kullanıcı profilini oluştur
  async createProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      logger.debug('Creating user profile', { uid: profile.uid }, 'UserProfileService');
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: profile.uid,
          email: profile.email,
          name: profile.name,
          employee_type: profile.employeeType === 'admin' ? 'admin' : 'normal',
          start_date: profile.startDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Failed to create user profile', error, 'UserProfileService');
        throw error;
      }
      
      logger.info('User profile created successfully', { uid: profile.uid }, 'UserProfileService');
      return true;
    } catch (error: any) {
      logger.error('Error creating user profile', error, 'UserProfileService');
      return false;
    }
  },

  // Kullanıcı profilini getir
  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      logger.debug('Getting user profile', { uid }, 'UserProfileService');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        logger.error('Failed to get user profile', error, 'UserProfileService');
        return null;
      }

      const userProfile: UserProfile = {
        uid: data.id,
        name: data.name,
        email: data.email,
        startDate: data.start_date,
        employeeType: data.employee_type === 'admin' ? 'admin' : 'normal',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      logger.info('User profile retrieved successfully', { uid }, 'UserProfileService');
      return userProfile;
    } catch (error: any) {
      logger.error('Error getting user profile', error, 'UserProfileService');
      return null;
    }
  },

  // Kullanıcı profilini güncelle
  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      logger.debug('Updating user profile', { uid, updates }, 'UserProfileService');
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.employeeType) updateData.employee_type = updates.employeeType === 'admin' ? 'admin' : 'normal';

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', uid);

      if (error) {
        logger.error('Failed to update user profile', error, 'UserProfileService');
        throw error;
      }

      logger.info('User profile updated successfully', { uid }, 'UserProfileService');
      return true;
    } catch (error: any) {
      logger.error('Error updating user profile', error, 'UserProfileService');
      return false;
    }
  },

  // Kullanıcı profilini sil
  async deleteProfile(uid: string): Promise<boolean> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      logger.debug('Deleting user profile', { uid }, 'UserProfileService');
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', uid);

      if (error) {
        logger.error('Failed to delete user profile', error, 'UserProfileService');
        throw error;
      }

      logger.info('User profile deleted successfully', { uid }, 'UserProfileService');
      return true;
    } catch (error: any) {
      logger.error('Error deleting user profile', error, 'UserProfileService');
      return false;
    }
  },

  // Tüm kullanıcı profillerini getir (sadece admin)
  async getAllProfiles(): Promise<UserProfile[]> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      logger.debug('Getting all user profiles', null, 'UserProfileService');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get all user profiles', error, 'UserProfileService');
        throw error;
      }

      const profiles: UserProfile[] = data.map(data => ({
        uid: data.id,
        name: data.name,
        email: data.email,
        startDate: data.start_date,
        employeeType: data.employee_type === 'admin' ? 'admin' : 'normal',
        created_at: data.created_at,
        updated_at: data.updated_at
      }));

      logger.info('All user profiles retrieved successfully', { count: profiles.length }, 'UserProfileService');
      return profiles;
    } catch (error: any) {
      logger.error('Error getting all user profiles', error, 'UserProfileService');
      return [];
    }
  },

  // Kullanıcı rolünü güncelle
  async updateUserRole(uid: string, role: 'normal' | 'admin'): Promise<boolean> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      logger.debug('Updating user role', { uid, role }, 'UserProfileService');
      
      const { error } = await supabase
        .from('users')
        .update({
          employee_type: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', uid);

      if (error) {
        logger.error('Failed to update user role', error, 'UserProfileService');
        throw error;
      }

      logger.info('User role updated successfully', { uid, role }, 'UserProfileService');
      return true;
    } catch (error: any) {
      logger.error('Error updating user role', error, 'UserProfileService');
      return false;
    }
  }
};
