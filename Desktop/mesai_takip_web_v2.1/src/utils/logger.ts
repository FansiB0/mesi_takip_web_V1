// Production-ready logging system
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor() {
    this.logLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, data?: any, source?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source: source || 'App'
    };
  }

  private log(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output only in development
    if (import.meta.env.DEV) {
      const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
      const levelColors = ['#6B7280', '#3B82F6', '#F59E0B', '#EF4444'];
      const color = levelColors[entry.level];
      
      console.log(
        `%c[${entry.timestamp}] ${levelNames[entry.level]} [${entry.source}]: ${entry.message}`,
        `color: ${color}; font-weight: bold`,
        entry.data || ''
      );
    }
  }

  debug(message: string, data?: any, source?: string) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(this.formatMessage(LogLevel.DEBUG, message, data, source));
    }
  }

  info(message: string, data?: any, source?: string) {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(this.formatMessage(LogLevel.INFO, message, data, source));
    }
  }

  warn(message: string, data?: any, source?: string) {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(this.formatMessage(LogLevel.WARN, message, data, source));
    }
  }

  error(message: string, data?: any, source?: string) {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.log(this.formatMessage(LogLevel.ERROR, message, data, source));
    }
  }

  // Get logs for debugging/admin purposes
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return this.logs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Set log level dynamically
  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for backward compatibility
export const logDebug = (message: string, data?: any, source?: string) => logger.debug(message, data, source);
export const logInfo = (message: string, data?: any, source?: string) => logger.info(message, data, source);
export const logWarn = (message: string, data?: any, source?: string) => logger.warn(message, data, source);
export const logError = (message: string, data?: any, source?: string) => logger.error(message, data, source);
