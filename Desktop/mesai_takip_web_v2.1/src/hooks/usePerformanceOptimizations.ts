// Performance optimization hooks for the application

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { debounce, throttle } from '../utils/errorHandler';

// Memoized callback hook with dependency tracking
export const useSmartCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Parameters<T>) => callbackRef.current(...args), deps);
};

// Debounced value hook
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttled function hook
export const useThrottledFunction = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  const funcRef = useRef(func);
  funcRef.current = func;

  return useCallback(
    throttle((...args: Parameters<T>) => funcRef.current(...args), limit) as T,
    [limit]
  );
};

// Virtual scrolling for large lists
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      top: (visibleRange.startIndex + index) * itemHeight
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    scrollTop
  };
};

// Infinite scroll hook
export const useInfiniteScroll = (
  hasNextPage: boolean,
  fetchNextPage: () => Promise<void>,
  options: {
    threshold?: number;
    rootMargin?: string;
  } = {}
) => {
  const { threshold = 100, rootMargin = '0px' } = options;
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const fetchNext = useCallback(async () => {
    if (isFetching || !hasNextPage) return;
    
    setIsFetching(true);
    try {
      await fetchNextPage();
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetching) {
          fetchNext();
        }
      },
      {
        threshold: threshold / 100,
        rootMargin
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNext, hasNextPage, isFetching, threshold, rootMargin]);

  return {
    elementRef,
    isFetching
  };
};

// Image lazy loading hook
export const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
          };
          img.onerror = () => {
            setHasError(true);
            setIsLoading(false);
          };
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src]);

  return {
    imgRef,
    imageSrc,
    isLoading,
    hasError
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    if (import.meta.env.DEV && renderTime > 16) { // 16ms = 60fps
      console.warn(
        `${componentName} took ${renderTime.toFixed(2)}ms to render (render #${renderCount.current})`
      );
    }
  });

  const measureFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    functionName: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (import.meta.env.DEV && end - start > 10) {
        console.warn(`${functionName} took ${(end - start).toFixed(2)}ms to execute`);
      }
      
      return result;
    }) as T;
  }, []);

  return { measureFunction };
};

// Memoized calculation hook
export const useMemoizedCalculation = <T, R>(
  calculate: (input: T) => R,
  input: T,
  equalityFn?: (a: T, b: T) => boolean
): R => {
  return useMemo(() => calculate(input), equalityFn ? [input, equalityFn] : [input]);
};

// Window size hook with debounced updates
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const debouncedHandleResize = useMemo(
    () => debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 250),
    []
  );

  useEffect(() => {
    window.addEventListener('resize', debouncedHandleResize);
    return () => window.removeEventListener('resize', debouncedHandleResize);
  }, [debouncedHandleResize]);

  return windowSize;
};

// Local storage hook with sync across tabs
export const useSyncedLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Sync across tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(valueToStore)
      }));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
};
