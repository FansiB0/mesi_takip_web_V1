// Memory leak prevention utility for managing timeouts, intervals, and event listeners

export class CleanupManager {
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();
  private eventListeners: Map<EventTarget, Array<{ type: string; listener: EventListener; options?: boolean | AddEventListenerOptions }>> = new Map();
  private observers: Set<{ disconnect: () => void }> = new Set();

  // Timeout management
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);
      callback();
    }, delay);
    
    this.timeouts.add(timeout);
    return timeout;
  }

  clearTimeout(timeout: NodeJS.Timeout): void {
    clearTimeout(timeout);
    this.timeouts.delete(timeout);
  }

  // Interval management
  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  // Event listener management
  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener, options);
    
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, []);
    }
    
    const listeners = this.eventListeners.get(target)!;
    listeners.push({ type, listener, options });
  }

  removeEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions
  ): void {
    target.removeEventListener(type, listener, options);
    
    const listeners = this.eventListeners.get(target);
    if (listeners) {
      const index = listeners.findIndex(l => l.type === type && l.listener === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      
      if (listeners.length === 0) {
        this.eventListeners.delete(target);
      }
    }
  }

  // Observer management (IntersectionObserver, MutationObserver, etc.)
  addObserver<T extends { disconnect: () => void }>(observer: T): T {
    this.observers.add(observer);
    return observer;
  }

  removeObserver(observer: { disconnect: () => void }): void {
    observer.disconnect();
    this.observers.delete(observer);
  }

  // Clean up all resources
  cleanup(): void {
    // Clear all timeouts
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();

    // Remove all event listeners
    this.eventListeners.forEach((listeners, target) => {
      listeners.forEach(({ type, listener, options }) => {
        target.removeEventListener(type, listener, options);
      });
    });
    this.eventListeners.clear();

    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  // Get counts for debugging
  getResourceCounts(): {
    timeouts: number;
    intervals: number;
    eventListeners: number;
    observers: number;
  } {
    let eventListenerCount = 0;
    this.eventListeners.forEach(listeners => {
      eventListenerCount += listeners.length;
    });

    return {
      timeouts: this.timeouts.size,
      intervals: this.intervals.size,
      eventListeners: eventListenerCount,
      observers: this.observers.size
    };
  }
}

// React hook for automatic cleanup
export const useCleanupManager = (): CleanupManager => {
  const cleanupManager = new CleanupManager();

  // Auto-cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanupManager.cleanup();
    };
  }, []);

  return cleanupManager;
};

// Global cleanup manager instance
export const globalCleanupManager = new CleanupManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalCleanupManager.cleanup();
  });
}

// React hook import (to avoid circular dependency)
import React from 'react';
