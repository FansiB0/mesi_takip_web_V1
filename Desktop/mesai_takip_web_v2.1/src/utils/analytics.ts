// Analytics and monitoring utilities

import { logger } from './logger';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'navigation' | 'resource' | 'paint' | 'layout' | 'custom';
}

export interface ErrorMetric {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  userId?: string;
  userAgent: string;
  url: string;
}

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private errorMetrics: ErrorMetric[] = [];
  private sessionId: string;
  private userId: string | null = null;
  private isEnabled: boolean = false;
  private maxEvents: number = 1000;
  private flushInterval: number = 30000; // 30 seconds

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private initialize() {
    // Enable analytics in production or when explicitly enabled
    this.isEnabled = !import.meta.env.DEV || import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

    if (this.isEnabled) {
      this.setupPerformanceMonitoring();
      this.setupErrorTracking();
      this.setupUserInteractionTracking();
      this.startPeriodicFlush();
    }
  }

  // Event tracking
  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);
    this.trimEvents();
  }

  // User identification
  identify(userId: string) {
    this.userId = userId;
    this.track('user_identified', { userId });
  }

  // Performance monitoring
  private setupPerformanceMonitoring() {
    // Track page load performance
    if ('performance' in window && 'getEntriesByType' in performance) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordPerformanceMetric({
              name: 'page_load',
              value: navEntry.loadEventEnd - navEntry.loadEventStart,
              timestamp: Date.now(),
              type: 'navigation'
            });

            // Record additional navigation metrics
            this.recordPerformanceMetric({
              name: 'dom_content_loaded',
              value: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              timestamp: Date.now(),
              type: 'navigation'
            });

            this.recordPerformanceMetric({
              name: 'first_paint',
              value: navEntry.responseEnd - navEntry.requestStart,
              timestamp: Date.now(),
              type: 'paint'
            });
          } else if (entry.entryType === 'measure') {
            this.recordPerformanceMetric({
              name: entry.name,
              value: entry.duration,
              timestamp: Date.now(),
              type: 'custom'
            });
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['navigation', 'measure'] });
      } catch (e) {
        logger.warn('Performance observer not supported:', e);
      }
    }

    // Track Core Web Vitals
    this.trackCoreWebVitals();
  }

  private trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordPerformanceMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            type: 'paint'
          });
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordPerformanceMetric({
              name: 'FID',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: Date.now(),
              type: 'layout'
            });
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          this.recordPerformanceMetric({
            name: 'CLS',
            value: clsValue,
            timestamp: Date.now(),
            type: 'layout'
          });
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    }
  }

  // Error tracking
  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        userId: this.userId || undefined,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userId: this.userId || undefined,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
  }

  // User interaction tracking
  private setupUserInteractionTracking() {
    // Track page views
    this.track('page_view', {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });

    // Track route changes (for SPA)
    let lastUrl = window.location.href;
    const checkUrlChange = () => {
      if (window.location.href !== lastUrl) {
        this.track('page_view', {
          url: window.location.href,
          referrer: lastUrl
        });
        lastUrl = window.location.href;
      }
    };

    // Check URL changes periodically
    setInterval(checkUrlChange, 1000);
  }

  // Custom performance measurement
  measurePerformance(name: string, fn: () => void | Promise<void>) {
    const startTime = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now();
        this.recordPerformanceMetric({
          name,
          value: endTime - startTime,
          timestamp: Date.now(),
          type: 'custom'
        });
      });
    } else {
      const endTime = performance.now();
      this.recordPerformanceMetric({
        name,
        value: endTime - startTime,
        timestamp: Date.now(),
        type: 'custom'
      });
    }
  }

  private recordPerformanceMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;
    
    this.performanceMetrics.push(metric);
    this.trimPerformanceMetrics();
  }

  private recordError(error: ErrorMetric) {
    if (!this.isEnabled) return;
    
    this.errorMetrics.push(error);
    this.trimErrorMetrics();
  }

  // Data management
  private trimEvents() {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  private trimPerformanceMetrics() {
    if (this.performanceMetrics.length > this.maxEvents) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxEvents);
    }
  }

  private trimErrorMetrics() {
    if (this.errorMetrics.length > this.maxEvents) {
      this.errorMetrics = this.errorMetrics.slice(-this.maxEvents);
    }
  }

  // Data export
  exportData() {
    return {
      events: this.events,
      performanceMetrics: this.performanceMetrics,
      errorMetrics: this.errorMetrics,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now()
    };
  }

  // Flush data to server (in real app, this would send to analytics service)
  private flushData() {
    if (!this.isEnabled || this.events.length === 0) return;

    const data = this.exportData();
    
    // In development, just log the data
    if (import.meta.env.DEV) {
      logger.debug('Analytics data:', data);
      return;
    }

    // In production, send to analytics service
    // This is where you would integrate with Google Analytics, Mixpanel, etc.
    // For now, we'll just clear the data
    this.events = [];
    this.performanceMetrics = [];
    this.errorMetrics = [];
  }

  private startPeriodicFlush() {
    setInterval(() => {
      this.flushData();
    }, this.flushInterval);
  }

  // Manual flush
  flush() {
    this.flushData();
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Get analytics summary
  getSummary() {
    return {
      totalEvents: this.events.length,
      totalPerformanceMetrics: this.performanceMetrics.length,
      totalErrors: this.errorMetrics.length,
      sessionId: this.sessionId,
      userId: this.userId,
      isEnabled: this.isEnabled
    };
  }
}

// Export singleton instance
export const analytics = AnalyticsManager.getInstance();

// Convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties);
};

export const trackUser = (userId: string) => {
  analytics.identify(userId);
};

export const trackPerformance = (name: string, fn: () => void | Promise<void>) => {
  return analytics.measurePerformance(name, fn);
};

export const getAnalyticsSummary = () => {
  return analytics.getSummary();
};

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: trackEvent,
    identify: trackUser,
    measurePerformance: trackPerformance,
    summary: getAnalyticsSummary()
  };
};
