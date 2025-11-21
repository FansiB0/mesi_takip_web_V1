// Nano Data Context - Local Database Implementation

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  userService, 
  salaryService, 
  overtimeService, 
  leaveService,
  User, 
  Salary, 
  Overtime, 
  Leave 
} from '../database/services';
import { logger } from '../utils/logger';

// Types
export interface NanoDataState {
  users: User[];
  salaries: Salary[];
  overtimes: Overtime[];
  leaves: Leave[];
  loadingStates: {
    users: boolean;
    salaries: boolean;
    overtimes: boolean;
    leaves: boolean;
  };
  errors: {
    users?: string;
    salaries?: string;
    overtimes?: string;
    leaves?: string;
  };
}

export interface NanoDataContextType extends NanoDataState {
  // User operations
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  
  // Salary operations
  createSalary: (salaryData: Omit<Salary, 'id' | 'created_at' | 'updated_at'>) => Promise<Salary>;
  updateSalary: (id: string, salaryData: Partial<Salary>) => Promise<Salary | null>;
  deleteSalary: (id: string) => Promise<boolean>;
  
  // Overtime operations
  createOvertime: (overtimeData: Omit<Overtime, 'id' | 'created_at' | 'updated_at'>) => Promise<Overtime>;
  updateOvertime: (id: string, overtimeData: Partial<Overtime>) => Promise<Overtime | null>;
  deleteOvertime: (id: string) => Promise<boolean>;
  updateOvertimeStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => Promise<Overtime | null>;
  
  // Leave operations
  createLeave: (leaveData: Omit<Leave, 'id' | 'created_at' | 'updated_at'>) => Promise<Leave>;
  updateLeave: (id: string, leaveData: Partial<Leave>) => Promise<Leave | null>;
  deleteLeave: (id: string) => Promise<boolean>;
  updateLeaveStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => Promise<Leave | null>;
  
  // Refresh operations
  refreshData: () => Promise<void>;
  clearErrors: () => void;
}

// Action types
type NanoDataAction =
  | { type: 'SET_LOADING'; entity: keyof NanoDataState['loadingStates']; loading: boolean }
  | { type: 'SET_ERROR'; entity: keyof NanoDataState['errors']; error?: string }
  | { type: 'SET_USERS'; users: User[] }
  | { type: 'SET_SALARIES'; salaries: Salary[] }
  | { type: 'SET_OVERTIMES'; overtimes: Overtime[] }
  | { type: 'SET_LEAVES'; leaves: Leave[] }
  | { type: 'ADD_USER'; user: User }
  | { type: 'UPDATE_USER'; user: User }
  | { type: 'REMOVE_USER'; userId: string }
  | { type: 'ADD_SALARY'; salary: Salary }
  | { type: 'UPDATE_SALARY'; salary: Salary }
  | { type: 'REMOVE_SALARY'; salaryId: string }
  | { type: 'ADD_OVERTIME'; overtime: Overtime }
  | { type: 'UPDATE_OVERTIME'; overtime: Overtime }
  | { type: 'REMOVE_OVERTIME'; overtimeId: string }
  | { type: 'ADD_LEAVE'; leave: Leave }
  | { type: 'UPDATE_LEAVE'; leave: Leave }
  | { type: 'REMOVE_LEAVE'; leaveId: string }
  | { type: 'CLEAR_ERRORS' };

// Initial state
const initialState: NanoDataState = {
  users: [],
  salaries: [],
  overtimes: [],
  leaves: [],
  loadingStates: {
    users: false,
    salaries: false,
    overtimes: false,
    leaves: false,
  },
  errors: {},
};

// Reducer
const nanoDataReducer = (state: NanoDataState, action: NanoDataAction): NanoDataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.entity]: action.loading,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.entity]: action.error,
        },
      };
    
    case 'SET_USERS':
      return { ...state, users: action.users };
    
    case 'SET_SALARIES':
      return { ...state, salaries: action.salaries };
    
    case 'SET_OVERTIMES':
      return { ...state, overtimes: action.overtimes };
    
    case 'SET_LEAVES':
      return { ...state, leaves: action.leaves };
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.user] };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.user.id ? action.user : user
        ),
      };
    
    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.userId),
      };
    
    case 'ADD_SALARY':
      return { ...state, salaries: [...state.salaries, action.salary] };
    
    case 'UPDATE_SALARY':
      return {
        ...state,
        salaries: state.salaries.map(salary => 
          salary.id === action.salary.id ? action.salary : salary
        ),
      };
    
    case 'REMOVE_SALARY':
      return {
        ...state,
        salaries: state.salaries.filter(salary => salary.id !== action.salaryId),
      };
    
    case 'ADD_OVERTIME':
      return { ...state, overtimes: [...state.overtimes, action.overtime] };
    
    case 'UPDATE_OVERTIME':
      return {
        ...state,
        overtimes: state.overtimes.map(overtime => 
          overtime.id === action.overtime.id ? action.overtime : overtime
        ),
      };
    
    case 'REMOVE_OVERTIME':
      return {
        ...state,
        overtimes: state.overtimes.filter(overtime => overtime.id !== action.overtimeId),
      };
    
    case 'ADD_LEAVE':
      return { ...state, leaves: [...state.leaves, action.leave] };
    
    case 'UPDATE_LEAVE':
      return {
        ...state,
        leaves: state.leaves.map(leave => 
          leave.id === action.leave.id ? action.leave : leave
        ),
      };
    
    case 'REMOVE_LEAVE':
      return {
        ...state,
        leaves: state.leaves.filter(leave => leave.id !== action.leaveId),
      };
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    
    default:
      return state;
  }
};

// Context
const NanoDataContext = createContext<NanoDataContextType | undefined>(undefined);

// Provider component
export const NanoDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(nanoDataReducer, initialState);

  // Initialize demo data
  useEffect(() => {
    const initializeDemoData = async () => {
      try {
        // Create demo users if they don't exist
        userService.createDemoUsers();
        salaryService.createDemoSalaries();
        overtimeService.createDemoOvertimes();
        leaveService.createDemoLeaves();
        
        // Load initial data
        await refreshData();
      } catch (error) {
        logger.error('Failed to initialize demo data', error, 'NanoDataContext');
      }
    };

    initializeDemoData();
  }, []);

  // Refresh all data
  const refreshData = async () => {
    try {
      // Load users
      dispatch({ type: 'SET_LOADING', entity: 'users', loading: true });
      const users = userService.getAllUsers();
      dispatch({ type: 'SET_USERS', users });
      dispatch({ type: 'SET_ERROR', entity: 'users' });

      // Load salaries
      dispatch({ type: 'SET_LOADING', entity: 'salaries', loading: true });
      const salaries = await salaryService.getAllSalaries();
      dispatch({ type: 'SET_SALARIES', salaries });
      dispatch({ type: 'SET_ERROR', entity: 'salaries' });

      // Load overtimes
      dispatch({ type: 'SET_LOADING', entity: 'overtimes', loading: true });
      const overtimes = await overtimeService.getAllOvertimes();
      dispatch({ type: 'SET_OVERTIMES', overtimes });
      dispatch({ type: 'SET_ERROR', entity: 'overtimes' });

      // Load leaves
      dispatch({ type: 'SET_LOADING', entity: 'leaves', loading: true });
      const leaves = await leaveService.getAllLeaves();
      dispatch({ type: 'SET_LEAVES', leaves });
      dispatch({ type: 'SET_ERROR', entity: 'leaves' });

      logger.info('All data refreshed successfully', null, 'NanoDataContext');
    } catch (error) {
      logger.error('Failed to refresh data', error, 'NanoDataContext');
      dispatch({ type: 'SET_ERROR', entity: 'users', error: 'Veri yüklenemedi' });
    }
  };

  // User operations
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    try {
      const user = userService.createUser(userData);
      dispatch({ type: 'ADD_USER', user });
      return user;
    } catch (error) {
      const errorMessage = 'Kullanıcı oluşturulamadı';
      dispatch({ type: 'SET_ERROR', entity: 'users', error: errorMessage });
      logger.error('Failed to create user', error, 'NanoDataContext');
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
    try {
      const user = userService.updateUser(id, userData);
      if (user) {
        dispatch({ type: 'UPDATE_USER', user });
        return user;
      }
      return null;
    } catch (error) {
      const errorMessage = 'Kullanıcı güncellenemedi';
      dispatch({ type: 'SET_ERROR', entity: 'users', error: errorMessage });
      logger.error('Failed to update user', error, 'NanoDataContext');
      throw error;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const success = userService.deleteUser(id);
      if (success) {
        dispatch({ type: 'REMOVE_USER', userId: id });
      }
      return success;
    } catch (error) {
      const errorMessage = 'Kullanıcı silinemedi';
      dispatch({ type: 'SET_ERROR', entity: 'users', error: errorMessage });
      logger.error('Failed to delete user', error, 'NanoDataContext');
      throw error;
    }
  };

  // Salary operations
  const createSalary = async (salaryData: Omit<Salary, 'id' | 'created_at' | 'updated_at'>): Promise<Salary> => {
    try {
      const salary = await salaryService.createSalary(salaryData as Omit<Salary, 'id' | 'createdAt'>);
      dispatch({ type: 'ADD_SALARY', salary });
      return salary;
    } catch (error) {
      const errorMessage = 'Maaş kaydı oluşturulamadı';
      dispatch({ type: 'SET_ERROR', entity: 'salaries', error: errorMessage });
      logger.error('Failed to create salary', error, 'NanoDataContext');
      throw error;
    }
  };

  const updateSalary = async (id: string, salaryData: Partial<Salary>): Promise<Salary | null> => {
    try {
      const salary = await salaryService.updateSalary(id, salaryData);
      if (salary) {
        dispatch({ type: 'UPDATE_SALARY', salary });
        return salary;
      }
      return null;
    } catch (error) {
      const errorMessage = 'Maaş kaydı güncellenemedi';
      dispatch({ type: 'SET_ERROR', entity: 'salaries', error: errorMessage });
      logger.error('Failed to update salary', error, 'NanoDataContext');
      throw error;
    }
  };

  const deleteSalary = async (id: string): Promise<boolean> => {
    try {
      await salaryService.deleteSalary(id);
      dispatch({ type: 'REMOVE_SALARY', salaryId: id });
      return true;
    } catch (error) {
      const errorMessage = 'Maaş kaydı silinemedi';
      dispatch({ type: 'SET_ERROR', entity: 'salaries', error: errorMessage });
      logger.error('Failed to delete salary', error, 'NanoDataContext');
      throw error;
    }
  };

  // Overtime operations
  const createOvertime = async (overtimeData: Omit<Overtime, 'id' | 'created_at' | 'updated_at'>): Promise<Overtime> => {
    try {
      const overtime = await overtimeService.createOvertime(overtimeData as Omit<Overtime, 'id' | 'createdAt' | 'hourlyRate' | 'totalPayment'>);
      dispatch({ type: 'ADD_OVERTIME', overtime });
      return overtime;
    } catch (error) {
      const errorMessage = 'Mesai kaydı oluşturulamadı';
      dispatch({ type: 'SET_ERROR', entity: 'overtimes', error: errorMessage });
      logger.error('Failed to create overtime', error, 'NanoDataContext');
      throw error;
    }
  };

  const updateOvertime = async (id: string, overtimeData: Partial<Overtime>): Promise<Overtime | null> => {
    try {
      const overtime = await overtimeService.updateOvertime(id, overtimeData);
      if (overtime) {
        dispatch({ type: 'UPDATE_OVERTIME', overtime });
        return overtime;
      }
      return null;
    } catch (error) {
      const errorMessage = 'Mesai kaydı güncellenemedi';
      dispatch({ type: 'SET_ERROR', entity: 'overtimes', error: errorMessage });
      logger.error('Failed to update overtime', error, 'NanoDataContext');
      throw error;
    }
  };

  const deleteOvertime = async (id: string): Promise<boolean> => {
    try {
      await overtimeService.deleteOvertime(id);
      dispatch({ type: 'REMOVE_OVERTIME', overtimeId: id });
      return true;
    } catch (error) {
      const errorMessage = 'Mesai kaydı silinemedi';
      dispatch({ type: 'SET_ERROR', entity: 'overtimes', error: errorMessage });
      logger.error('Failed to delete overtime', error, 'NanoDataContext');
      throw error;
    }
  };

  const updateOvertimeStatus = async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Overtime | null> => {
    return updateOvertime(id, { status });
  };

  // Leave operations
  const createLeave = async (leaveData: Omit<Leave, 'id' | 'created_at' | 'updated_at'>): Promise<Leave> => {
    try {
      const leave = await leaveService.createLeave(leaveData as Omit<Leave, 'id' | 'createdAt'>);
      dispatch({ type: 'ADD_LEAVE', leave });
      return leave;
    } catch (error) {
      const errorMessage = 'İzin kaydı oluşturulamadı';
      dispatch({ type: 'SET_ERROR', entity: 'leaves', error: errorMessage });
      logger.error('Failed to create leave', error, 'NanoDataContext');
      throw error;
    }
  };

  const updateLeave = async (id: string, leaveData: Partial<Leave>): Promise<Leave | null> => {
    try {
      const leave = await leaveService.updateLeave(id, leaveData);
      if (leave) {
        dispatch({ type: 'UPDATE_LEAVE', leave });
        return leave;
      }
      return null;
    } catch (error) {
      const errorMessage = 'İzin kaydı güncellenemedi';
      dispatch({ type: 'SET_ERROR', entity: 'leaves', error: errorMessage });
      logger.error('Failed to update leave', error, 'NanoDataContext');
      throw error;
    }
  };

  const deleteLeave = async (id: string): Promise<boolean> => {
    try {
      await leaveService.deleteLeave(id);
      dispatch({ type: 'REMOVE_LEAVE', leaveId: id });
      return true;
    } catch (error) {
      const errorMessage = 'İzin kaydı silinemedi';
      dispatch({ type: 'SET_ERROR', entity: 'leaves', error: errorMessage });
      logger.error('Failed to delete leave', error, 'NanoDataContext');
      throw error;
    }
  };

  const updateLeaveStatus = async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Leave | null> => {
    return updateLeave(id, { status });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const value: NanoDataContextType = {
    ...state,
    createUser,
    updateUser,
    deleteUser,
    createSalary,
    updateSalary,
    deleteSalary,
    createOvertime,
    updateOvertime,
    deleteOvertime,
    updateOvertimeStatus,
    createLeave,
    updateLeave,
    deleteLeave,
    updateLeaveStatus,
    refreshData,
    clearErrors,
  };

  return (
    <NanoDataContext.Provider value={value}>
      {children}
    </NanoDataContext.Provider>
  );
};

// Hook
export const useNanoData = (): NanoDataContextType => {
  const context = useContext(NanoDataContext);
  if (context === undefined) {
    throw new Error('useNanoData must be used within a NanoDataProvider');
  }
  return context;
};

export default NanoDataContext;
