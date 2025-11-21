import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/supabaseAuthService';
import { userProfileService } from '../services/userProfileService';
import { logger } from '../utils/logger';
import { CleanupManager } from '../utils/cleanupManager';
import { analytics } from '../utils/analytics';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, startDate: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email' | 'startDate'>>) => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Hemen false yap
  const cleanupManager = new CleanupManager();

  useEffect(() => {
    logger.debug('Setting up auth state listener', null, 'AuthContext');
    
    // Basit bir kontrol - hemen loading'i false yap
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          logger.info('Current user found', { userId: currentUser.id }, 'AuthContext');
          const userData: User = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            startDate: new Date().toISOString().split('T')[0], // Varsayılan tarih
            employeeType: 'normal'
          };
          setUser(userData);
          localStorage.setItem('currentUser', currentUser.id);
        } else {
          logger.debug('No current user found', null, 'AuthContext');
        }
      } catch (error) {
        logger.error('Error checking current user', error, 'AuthContext');
      } finally {
        setIsLoading(false);
      }
    };

    // Hemen başlat
    initializeAuth();
    
    // Güvenlik için 3 saniye sonra loading'i false yap - cleanupManager kullanarak
    cleanupManager.setTimeout(() => {
      logger.warn('Loading timeout reached, forcing isLoading to false', null, 'AuthContext');
      setIsLoading(false);
    }, 3000);
    
    // Cleanup on unmount
    return () => {
      cleanupManager.cleanup();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      logger.debug('Starting login process', { email }, 'AuthContext');
      analytics.track('login_attempt', { email });
      
      const user = await loginUser(email, password);
      logger.info('Login process completed', { userId: user.id }, 'AuthContext');
      
      // Track successful login
      analytics.identify(user.id);
      analytics.track('login_success', { userId: user.id });
      
      const userData: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        startDate: new Date().toISOString().split('T')[0],
        employeeType: 'normal'
      };
      setUser(userData);
      localStorage.setItem('currentUser', user.id);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      logger.error('Login error', error, 'AuthContext');
      analytics.track('login_error', { email, error: error?.message || 'Unknown error' });
      setIsLoading(false);
      return { success: false, error: error?.message || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string, startDate: string) => {
    try {
      logger.debug('Starting registration in AuthContext', { email, name }, 'AuthContext');
      analytics.track('register_attempt', { email, name });
      
      const result = await registerUser({ email, password, name, role: 'user' });
      
      logger.debug('Registration result from service', result, 'AuthContext');
      
      // Track successful registration
      analytics.identify(result.id);
      analytics.track('register_success', { userId: result.id });
      
      // User'ı hemen set et
      const userData: User = {
        id: result.id,
        name: result.name,
        email: result.email,
        startDate,
        employeeType: 'normal'
      };
      setUser(userData);
      localStorage.setItem('currentUser', result.id);
      
      logger.debug('User set in context immediately', userData, 'AuthContext');
      
      return { success: true };
    } catch (error: any) {
      logger.error('Registration error in AuthContext', error, 'AuthContext');
      analytics.track('register_error', { email, error: error.message });
      return { success: false, error: error.message || 'Kayıt sırasında bir hata oluştu' };
    }
  };

  const logout = () => {
    try {
      logger.info('Logout process started', { userId: user?.id }, 'AuthContext');
      analytics.track('logout', { userId: user?.id });
      
      logoutUser();
      setUser(null);
      localStorage.removeItem('currentUser');
      logger.info('Logout completed', null, 'AuthContext');
    } catch (error) {
      logger.error('Logout error', error, 'AuthContext');
    }
  };

  // Kullanıcıyı yeniden yükle
  const reloadUser = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      logger.debug('Reloading user data', null, 'AuthContext');
      const userData: User = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        startDate: new Date().toISOString().split('T')[0], // Varsayılan tarih
        employeeType: 'normal'
      };
      setUser(userData);
      logger.debug('User reloaded', userData, 'AuthContext');
    }
  };

  const updateUser = async (updates: Partial<Pick<User, 'name' | 'email' | 'startDate'>>) => {
    if (!user) return;
    
    try {
      logger.debug('Updating user profile in Supabase', updates, 'AuthContext');
      
      // Supabase'de kullanıcı profilini güncelle
      const success = await userProfileService.updateProfile(user.id, updates);
      
      if (success) {
        logger.info('User profile updated in Supabase successfully', updates, 'AuthContext');
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      } else {
        logger.error('Failed to update user profile in Supabase', updates, 'AuthContext');
        // Yine de local state'i güncelle
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      }
    } catch (error) {
      logger.error('Error updating user profile', error, 'AuthContext');
      // Hata durumunda da local state'i güncelle
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  // Debug için console log (sadece development'ta)
  logger.debug('AuthContext render', { user: user?.id, isLoading }, 'AuthContext');

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateUser, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};