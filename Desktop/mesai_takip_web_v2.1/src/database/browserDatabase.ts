import { logger } from '../utils/logger'

// Browser-compatible database using IndexedDB
export class NanoDatabase {
  private dbName = 'mesi_takip_db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    try {
      logger.info('Initializing Nano Database (IndexedDB)', null, 'NanoDatabase');
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);

        request.onerror = () => {
          logger.error('Failed to open database', request.error, 'NanoDatabase');
          reject(request.error);
        };

        request.onsuccess = () => {
          this.db = request.result;
          logger.info('Nano Database initialized successfully', null, 'NanoDatabase');
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores
          if (!db.objectStoreNames.contains('users')) {
            db.createObjectStore('users', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('salaries')) {
            db.createObjectStore('salaries', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('overtimes')) {
            db.createObjectStore('overtimes', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('leaves')) {
            db.createObjectStore('leaves', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('holidays')) {
            db.createObjectStore('holidays', { keyPath: 'id' });
          }
          
          logger.info('Database schema created', null, 'NanoDatabase');
        };
      });
    } catch (error) {
      logger.error('Database initialization failed', error, 'NanoDatabase');
      throw error;
    }
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Generic CRUD operations
  async create<T>(storeName: string, data: T): Promise<T> {
    try {
      const store = this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.add(data);
        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error(`Failed to create in ${storeName}`, error, 'NanoDatabase');
      throw error;
    }
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    try {
      const store = this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error(`Failed to get from ${storeName}`, error, 'NanoDatabase');
      throw error;
    }
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const store = this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error(`Failed to get all from ${storeName}`, error, 'NanoDatabase');
      throw error;
    }
  }

  async update<T>(storeName: string, data: T): Promise<T> {
    try {
      const store = this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error(`Failed to update in ${storeName}`, error, 'NanoDatabase');
      throw error;
    }
  }

  async delete(storeName: string, id: string): Promise<void> {
    try {
      const store = this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error(`Failed to delete from ${storeName}`, error, 'NanoDatabase');
      throw error;
    }
  }

  async clear(storeName: string): Promise<void> {
    try {
      const store = this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error(`Failed to clear ${storeName}`, error, 'NanoDatabase');
      throw error;
    }
  }

  // Demo data methods
  async createDemoData(): Promise<void> {
    try {
      logger.info('Creating demo data', null, 'NanoDatabase');

      // Demo users
      const demoUsers = [
        {
          id: 'demo-user-1',
          email: 'ahmet@company.com',
          name: 'Ahmet Yılmaz',
          role: 'user' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-user-2',
          email: 'admin@company.com',
          name: 'Admin User',
          role: 'admin' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Demo salaries
      const demoSalaries = [
        {
          id: 'salary-1',
          userId: 'demo-user-1',
          baseSalary: 25000,
          overtimePay: 2000,
          paymentDate: '2024-11-30',
          month: 11,
          year: 2024,
          created_at: new Date().toISOString()
        }
      ];

      // Demo overtimes
      const demoOvertimes = [
        {
          id: 'overtime-1',
          userId: 'demo-user-1',
          date: '2024-11-15',
          hours: 8,
          reason: 'Proje teslimi',
          status: 'approved' as const,
          created_at: new Date().toISOString()
        }
      ];

      // Demo leaves
      const demoLeaves = [
        {
          id: 'leave-1',
          userId: 'demo-user-1',
          startDate: '2024-12-01',
          endDate: '2024-12-03',
          type: 'annual' as const,
          status: 'approved' as const,
          created_at: new Date().toISOString()
        }
      ];

      // Clear existing data
      await this.clear('users');
      await this.clear('salaries');
      await this.clear('overtimes');
      await this.clear('leaves');

      // Insert demo data
      for (const user of demoUsers) {
        await this.create('users', user);
      }
      for (const salary of demoSalaries) {
        await this.create('salaries', salary);
      }
      for (const overtime of demoOvertimes) {
        await this.create('overtimes', overtime);
      }
      for (const leave of demoLeaves) {
        await this.create('leaves', leave);
      }

      logger.info('Demo data created successfully', null, 'NanoDatabase');
    } catch (error) {
      logger.error('Failed to create demo data', error, 'NanoDatabase');
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.db !== null;
  }
}

// Export singleton instance
export const nanoDatabase = new NanoDatabase();
