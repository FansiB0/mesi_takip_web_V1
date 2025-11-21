import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';
import type { Salary } from '../../types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client if configured
const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export class SalaryService {
  async getAll(): Promise<Salary[]> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('salaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get salaries', error, 'SalaryService');
        throw error;
      }

      const salaries: Salary[] = data.map(data => ({
        id: data.id,
        userId: data.user_id,
        month: data.month.toString(),
        year: data.year.toString(),
        grossSalary: data.base_salary + (data.overtime_pay || 0),
        netSalary: data.base_salary + (data.overtime_pay || 0),
        baseSalary: data.base_salary,
        overtimePay: data.overtime_pay || 0,
        bonus: 0,
        besDeduction: 0,
        paymentDate: data.payment_date,
        created_at: data.created_at
      }));

      return salaries;
    } catch (error) {
      logger.error('Failed to get salaries', error, 'SalaryService');
      throw error;
    }
  }

  async getByUserId(userId: string): Promise<Salary[]> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('salaries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get salaries by user', error, 'SalaryService');
        throw error;
      }

      const salaries: Salary[] = data.map(data => ({
        id: data.id,
        userId: data.user_id,
        month: data.month.toString(),
        year: data.year.toString(),
        grossSalary: data.base_salary + (data.overtime_pay || 0),
        netSalary: data.base_salary + (data.overtime_pay || 0),
        baseSalary: data.base_salary,
        overtimePay: data.overtime_pay || 0,
        bonus: 0,
        besDeduction: 0,
        paymentDate: data.payment_date,
        created_at: data.created_at
      }));

      return salaries;
    } catch (error) {
      logger.error('Failed to get salaries by user', error, 'SalaryService');
      throw error;
    }
  }

  async create(salaryData: Omit<Salary, 'id' | 'createdAt'>): Promise<Salary> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
        .from('salaries')
        .insert({
          user_id: salaryData.userId,
          base_salary: salaryData.baseSalary,
          overtime_pay: salaryData.overtimePay || 0,
          payment_date: salaryData.paymentDate,
          month: salaryData.month,
          year: salaryData.year,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create salary', error, 'SalaryService');
        throw error;
      }

      const salary: Salary = {
        id: data.id,
        userId: data.user_id,
        month: data.month.toString(),
        year: data.year.toString(),
        grossSalary: data.base_salary + (data.overtime_pay || 0),
        netSalary: data.base_salary + (data.overtime_pay || 0),
        baseSalary: data.base_salary,
        overtimePay: data.overtime_pay || 0,
        bonus: 0,
        besDeduction: 0,
        paymentDate: data.payment_date,
        created_at: data.created_at
      };

      logger.info('Salary created', { salaryId: salary.id }, 'SalaryService');
      return salary;
    } catch (error) {
      logger.error('Failed to create salary', error, 'SalaryService');
      throw error;
    }
  }

  async createDemoSalaries(): Promise<void> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      // Check if demo salaries already exist
      const { data: existingSalaries } = await supabase
        .from('salaries')
        .select('id')
        .limit(5);

      if (existingSalaries && existingSalaries.length > 0) {
        logger.info('Demo salaries already exist', { count: existingSalaries.length }, 'SalaryService');
        return;
      }

      // Create demo salaries
      const demoSalaries = [
        {
          user_id: 'demo-user-1',
          base_salary: 15000,
          overtime_pay: 2000,
          payment_date: '2024-01-31',
          month: 1,
          year: 2024
        },
        {
          user_id: 'demo-user-2',
          base_salary: 18000,
          overtime_pay: 1500,
          payment_date: '2024-02-29',
          month: 2,
          year: 2024
        }
      ];

      const { error } = await supabase
        .from('salaries')
        .insert(demoSalaries.map(salary => ({
          ...salary,
          created_at: new Date().toISOString()
        })));

      if (error) {
        logger.error('Failed to create demo salaries', error, 'SalaryService');
        throw error;
      }

      logger.info('Demo salaries created successfully', { count: demoSalaries.length }, 'SalaryService');
    } catch (error) {
      logger.error('Failed to create demo salaries', error, 'SalaryService');
      throw error;
    }
  }

  async update(id: string, updates: Partial<Salary>): Promise<Salary> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.baseSalary) updateData.base_salary = updates.baseSalary;
      if (updates.overtimePay) updateData.overtime_pay = updates.overtimePay;
      if (updates.paymentDate) updateData.payment_date = updates.paymentDate;
      if (updates.month) updateData.month = parseInt(updates.month);
      if (updates.year) updateData.year = parseInt(updates.year);

      const { data, error } = await supabase
        .from('salaries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update salary', error, 'SalaryService');
        throw error;
      }

      const salary: Salary = {
        id: data.id,
        userId: data.user_id,
        month: data.month.toString(),
        year: data.year.toString(),
        grossSalary: data.base_salary + (data.overtime_pay || 0),
        netSalary: data.base_salary + (data.overtime_pay || 0),
        baseSalary: data.base_salary,
        overtimePay: data.overtime_pay || 0,
        bonus: 0,
        besDeduction: 0,
        paymentDate: data.payment_date,
        created_at: data.created_at
      };

      logger.info('Salary updated', { salaryId: id }, 'SalaryService');
      return salary;
    } catch (error) {
      logger.error('Failed to update salary', error, 'SalaryService');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!isConfigured || !supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { error } = await supabase
        .from('salaries')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Failed to delete salary', error, 'SalaryService');
        throw error;
      }

      logger.info('Salary deleted', { salaryId: id }, 'SalaryService');
    } catch (error) {
      logger.error('Failed to delete salary', error, 'SalaryService');
      throw error;
    }
  }

  async getAllSalaries(): Promise<Salary[]> {
    return this.getAll();
  }

  async createSalary(salaryData: Omit<Salary, 'id' | 'createdAt'>): Promise<Salary> {
    return this.create(salaryData);
  }

  async updateSalary(id: string, updates: Partial<Salary>): Promise<Salary> {
    return this.update(id, updates);
  }

  async deleteSalary(id: string): Promise<void> {
    return this.delete(id);
  }
}

// Export the service instance
export const salaryService = new SalaryService();
