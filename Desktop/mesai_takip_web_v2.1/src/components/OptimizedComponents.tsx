// Performance-optimized components with React.memo and lazy loading

import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { logger } from '../utils/logger';

// Lazy loaded heavy components
const Dashboard = lazy(() => import('./Dashboard/Dashboard'));
const SalaryManagement = lazy(() => import('./Salary/SalaryManagement'));
const OvertimeTracking = lazy(() => import('./Overtime/OvertimeTracking'));
const CalendarView = lazy(() => import('./Calendar/CalendarView'));
const LeaveManagement = lazy(() => import('./Leaves/LeaveManagement'));
const ReportsAnalytics = lazy(() => import('./Reports/ReportsAnalytics'));
const Settings = lazy(() => import('./Settings/Settings'));
const CompensationCalculators = lazy(() => import('./Calculators/CompensationCalculators'));

// Loading fallback component
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600 dark:text-gray-400">Yükleniyor...</span>
  </div>
);

// Optimized component wrapper with lazy loading
export const OptimizedDashboard = memo((props: any) => (
  <Suspense fallback={<ComponentLoader />}>
    <Dashboard {...props} />
  </Suspense>
));

export const OptimizedSalaryManagement = memo((props: any) => (
  <Suspense fallback={<ComponentLoader />}>
    <SalaryManagement {...props} />
  </Suspense>
));

export const OptimizedOvertimeTracking = memo((props: any) => (
  <Suspense fallback={<ComponentLoader />}>
    <OvertimeTracking {...props} />
  </Suspense>
));

export const OptimizedCalendarView = memo((props: any) => (
  <Suspense fallback={<ComponentLoader />}>
    <CalendarView {...props} />
  </Suspense>
));

export const OptimizedLeaveManagement = memo((props: any) => (
  <Suspense fallback={<ComponentLoader />}>
    <LeaveManagement {...props} />
  </Suspense>
));

export const OptimizedReportsAnalytics = memo((props: any) => (
  <Suspense fallback={<ComponentLoader />}>
    <ReportsAnalytics {...props} />
  </Suspense>
));

export const OptimizedSettings = memo((props: any) => (
  <Suspense fallback={<ComponentLoader />}>
    <Settings {...props} />
  </Suspense>
));

export const OptimizedCompensationCalculators = memo((props: any) => (
  <Suspense fallback={<ComponentLoader />}>
    <CompensationCalculators {...props} />
  </Suspense>
));

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useMemo(() => performance.now(), []);
  
  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (import.meta.env.DEV && renderTime > 100) {
      logger.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  });
};

// Debounced search hook
export const useDebouncedSearch = (
  searchTerm: string,
  delay: number = 300
) => {
  const [debouncedTerm, setDebouncedTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedTerm;
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll
  };
};

// Memoized calculation utilities
export const useMemoizedCalculations = () => {
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  }, []);

  const calculateNetSalary = useCallback((gross: number, tax: number = 0.15): number => {
    return gross * (1 - tax);
  }, []);

  const formatDate = useCallback((date: string | Date): string => {
    return new Intl.DateTimeFormat('tr-TR').format(new Date(date));
  }, []);

  return {
    formatCurrency,
    calculateNetSalary,
    formatDate
  };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

// Image optimization component
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}>
        <span className="text-gray-500 dark:text-gray-400">Görsel yüklenemedi</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />
    </div>
  );
});
