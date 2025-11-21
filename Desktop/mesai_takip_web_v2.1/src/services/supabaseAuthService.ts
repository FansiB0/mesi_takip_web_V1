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

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

// Kullanıcı kaydı
export const registerUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}): Promise<SupabaseUser> => {
  try {
    logger.debug('Attempting user registration', { email: userData.email }, 'SupabaseAuthService');
    
    if (!isConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    // Use Supabase authentication
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role
        }
      }
    });

    if (error) {
      logger.error('Supabase registration error', error, 'SupabaseAuthService');
      throw error;
    }

    if (data.user) {
      // Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          employee_type: userData.role === 'admin' ? 'admin' : 'normal',
          start_date: new Date().toISOString().split('T')[0]
        });

      if (profileError) {
        logger.error('Profile creation error', profileError, 'SupabaseAuthService');
        throw profileError;
      }

      const supabaseUser: SupabaseUser = {
        id: data.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      logger.info('User registered successfully', { userId: supabaseUser.id }, 'SupabaseAuthService');
      return supabaseUser;
    }

    throw new Error('Registration failed - no user data returned');
    
  } catch (error) {
    logger.error('Registration error', error, 'SupabaseAuthService');
    throw error;
  }
};

// Kullanıcı girişi
export const loginUser = async (email: string, password: string): Promise<SupabaseUser> => {
  try {
    logger.debug('Attempting login', { email }, 'SupabaseAuthService');
    
    if (!isConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    // Use Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.error('Supabase login error', error, 'SupabaseAuthService');
      throw error;
    }

    if (data.user) {
      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        logger.error('Profile fetch error', profileError, 'SupabaseAuthService');
        throw profileError;
      }

      const supabaseUser: SupabaseUser = {
        id: data.user.id,
        email: data.user.email || email,
        name: profile?.name || data.user.user_metadata?.name || 'Unknown',
        role: profile?.employee_type === 'admin' ? 'admin' : 'user',
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString()
      };

      logger.info('Login successful', { userId: supabaseUser.id }, 'SupabaseAuthService');
      return supabaseUser;
    }

    throw new Error('Login failed - no user data returned');
    
  } catch (error) {
    logger.error('Login error', error, 'SupabaseAuthService');
    throw error;
  }
};

// Mevcut kullanıcıyı getir
export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  try {
    logger.debug('Getting current user', null, 'SupabaseAuthService');
    
    if (!isConfigured || !supabase) {
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      logger.error('Get current user error', error, 'SupabaseAuthService');
      return null;
    }

    if (user) {
      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        logger.error('Profile fetch error', profileError, 'SupabaseAuthService');
        return null;
      }

      const supabaseUser: SupabaseUser = {
        id: user.id,
        email: user.email || '',
        name: profile?.name || user.user_metadata?.name || 'Unknown',
        role: profile?.employee_type === 'admin' ? 'admin' : 'user',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString()
      };

      return supabaseUser;
    }

    return null;
    
  } catch (error) {
    logger.error('Get current user error', error, 'SupabaseAuthService');
    return null;
  }
};

// Çıkış yap
export const logoutUser = async (): Promise<void> => {
  try {
    logger.debug('Attempting logout', null, 'SupabaseAuthService');
    
    if (!isConfigured || !supabase) {
      logger.info('Supabase not configured - logout completed locally', null, 'SupabaseAuthService');
      return;
    }

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error('Logout error', error, 'SupabaseAuthService');
      throw error;
    }

    logger.info('Logout successful', null, 'SupabaseAuthService');
  } catch (error) {
    logger.error('Logout error', error, 'SupabaseAuthService');
    throw error;
  }
};

// Kullanıcı profilini güncelle
export const updateUserProfile = async (updates: {
  name?: string;
  email?: string;
}): Promise<SupabaseUser> => {
  try {
    logger.debug('Updating user profile', updates, 'SupabaseAuthService');
    
    if (!isConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    const { data: { user }, error: authError } = await supabase.auth.updateUser({
      email: updates.email,
      data: { name: updates.name }
    });

    if (authError) {
      logger.error('Auth update error', authError, 'SupabaseAuthService');
      throw authError;
    }

    if (user) {
      // Update profile in database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) {
        logger.error('Profile update error', profileError, 'SupabaseAuthService');
        throw profileError;
      }

      const supabaseUser: SupabaseUser = {
        id: user.id,
        email: user.email || '',
        name: profile?.name || user.user_metadata?.name || 'Unknown',
        role: profile?.employee_type === 'admin' ? 'admin' : 'user',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString()
      };

      logger.info('Profile updated successfully', { userId: supabaseUser.id }, 'SupabaseAuthService');
      return supabaseUser;
    }

    throw new Error('Profile update failed - no user data returned');
    
  } catch (error) {
    logger.error('Profile update error', error, 'SupabaseAuthService');
    throw error;
  }
};

// Şifre sıfırlama
export const resetPassword = async (email: string): Promise<void> => {
  try {
    logger.debug('Attempting password reset', { email }, 'SupabaseAuthService');
    
    if (!isConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      logger.error('Password reset error', error, 'SupabaseAuthService');
      throw error;
    }

    logger.info('Password reset email sent', { email }, 'SupabaseAuthService');
  } catch (error) {
    logger.error('Password reset error', error, 'SupabaseAuthService');
    throw error;
  }
};

// Email doğrulama
export const verifyEmail = async (): Promise<void> => {
  try {
    logger.debug('Attempting email verification', null, 'SupabaseAuthService');
    
    if (!isConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: (await supabase.auth.getUser()).data.user?.email || ''
    });
    
    if (error) {
      logger.error('Email verification error', error, 'SupabaseAuthService');
      throw error;
    }

    logger.info('Email verification sent', null, 'SupabaseAuthService');
  } catch (error) {
    logger.error('Email verification error', error, 'SupabaseAuthService');
    throw error;
  }
};
