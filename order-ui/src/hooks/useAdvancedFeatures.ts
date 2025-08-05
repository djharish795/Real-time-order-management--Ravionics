import { useState, useEffect, useCallback } from 'react';

export interface CacheConfig {
  maxAge: number; // in milliseconds
  maxSize: number; // maximum number of items
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

export class AdvancedCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private accessOrder = new Set<string>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { maxAge: 300000, maxSize: 100 }) { // 5 minutes default
    this.config = config;
  }

  set(key: string, data: T, customMaxAge?: number): void {
    const now = Date.now();
    const maxAge = customMaxAge || this.config.maxAge;
    
    // Remove expired items before adding new one
    this.cleanup();
    
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.config.maxSize) {
      const lruKey = this.accessOrder.values().next().value;
      if (lruKey) {
        this.delete(lruKey);
      }
    }

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + maxAge,
      key
    };

    this.cache.set(key, item);
    this.updateAccessOrder(key);
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    this.updateAccessOrder(key);
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
  }

  private updateAccessOrder(key: string): void {
    this.accessOrder.delete(key);
    this.accessOrder.add(key);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      utilization: (this.cache.size / this.config.maxSize) * 100
    };
  }

  getAllKeys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  export(): Record<string, any> {
    const data: Record<string, any> = {};
    for (const [key, item] of this.cache.entries()) {
      if (Date.now() <= item.expiresAt) {
        data[key] = {
          data: item.data,
          timestamp: item.timestamp,
          expiresAt: item.expiresAt
        };
      }
    }
    return data;
  }

  import(data: Record<string, any>): void {
    const now = Date.now();
    for (const [key, item] of Object.entries(data)) {
      if (item.expiresAt && now <= item.expiresAt) {
        this.cache.set(key, {
          data: item.data,
          timestamp: item.timestamp,
          expiresAt: item.expiresAt,
          key
        });
        this.updateAccessOrder(key);
      }
    }
  }
}

// Performance Monitoring Hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  });

  const [renderTimes, setRenderTimes] = useState<number[]>([]);

  const startTiming = useCallback(() => {
    return performance.now();
  }, []);

  const endTiming = useCallback((startTime: number, operation: string = 'render') => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    setRenderTimes(prev => {
      const newTimes = [...prev, duration].slice(-50); // Keep last 50 measurements
      const average = newTimes.reduce((sum, time) => sum + time, 0) / newTimes.length;

      setMetrics(prevMetrics => ({
        ...prevMetrics,
        renderCount: prevMetrics.renderCount + 1,
        lastRenderTime: duration,
        averageRenderTime: average,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }));

      return newTimes;
    });

    if (duration > 16.67) { // More than 60fps threshold
      console.warn(`Slow ${operation}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ((performance as any).memory) {
      return {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }, []);

  return {
    metrics,
    startTiming,
    endTiming,
    getMemoryUsage
  };
};

// Advanced Error Boundary Hook
export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<any>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setError(error);
    setErrorInfo(errorInfo);
    setErrorId(id);

    // Log to console
    console.error('Error Boundary Caught:', error);
    if (errorInfo) {
      console.error('Error Info:', errorInfo);
    }

    // Send to error tracking service (implement your service)
    try {
      // Example: Sentry, LogRocket, etc.
      // Sentry.captureException(error, { extra: errorInfo, tags: { errorId: id } });
      
      // Or send to your own endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId: id,
          message: error.message,
          stack: error.stack,
          errorInfo,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      }).catch(console.error);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
    setErrorId(null);
  }, []);

  const retry = useCallback(() => {
    clearError();
    window.location.reload();
  }, [clearError]);

  return {
    error,
    errorInfo,
    errorId,
    captureError,
    clearError,
    retry
  };
};

// Advanced Loading States Hook
export const useAdvancedLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map());
  const [loadingProgress, setLoadingProgress] = useState<Map<string, number>>(new Map());
  const [loadingMessages, setLoadingMessages] = useState<Map<string, string>>(new Map());

  const setLoading = useCallback((key: string, isLoading: boolean, message?: string) => {
    setLoadingStates(prev => new Map(prev).set(key, isLoading));
    if (message) {
      setLoadingMessages(prev => new Map(prev).set(key, message));
    }
    if (!isLoading) {
      setLoadingProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
      setLoadingMessages(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  }, []);

  const setProgress = useCallback((key: string, progress: number) => {
    setLoadingProgress(prev => new Map(prev).set(key, Math.max(0, Math.min(100, progress))));
  }, []);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates.get(key) || false;
    }
    return Array.from(loadingStates.values()).some(Boolean);
  }, [loadingStates]);

  const getProgress = useCallback((key: string) => {
    return loadingProgress.get(key) || 0;
  }, [loadingProgress]);

  const getMessage = useCallback((key: string) => {
    return loadingMessages.get(key) || '';
  }, [loadingMessages]);

  const getAllLoadingStates = useCallback(() => {
    return {
      states: Object.fromEntries(loadingStates),
      progress: Object.fromEntries(loadingProgress),
      messages: Object.fromEntries(loadingMessages)
    };
  }, [loadingStates, loadingProgress, loadingMessages]);

  return {
    setLoading,
    setProgress,
    isLoading,
    getProgress,
    getMessage,
    getAllLoadingStates
  };
};

// Optimistic Updates Hook
export const useOptimisticUpdates = <T>(
  initialData: T[],
  keyExtractor: (item: T) => string
) => {
  const [data, setData] = useState(initialData);
  const [optimisticOperations, setOptimisticOperations] = useState<Map<string, {
    type: 'create' | 'update' | 'delete';
    originalData?: T;
    newData?: T;
    timestamp: number;
  }>>(new Map());

  const optimisticCreate = useCallback((newItem: T, serverOperation: () => Promise<T>) => {
    const key = keyExtractor(newItem);
    const timestamp = Date.now();
    
    // Add optimistically
    setData(prev => [...prev, newItem]);
    setOptimisticOperations(prev => new Map(prev).set(key, {
      type: 'create',
      newData: newItem,
      timestamp
    }));

    // Perform server operation
    serverOperation()
      .then((serverResult) => {
        // Replace optimistic data with server data
        setData(prev => prev.map(item => 
          keyExtractor(item) === key ? serverResult : item
        ));
        setOptimisticOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      })
      .catch((error) => {
        // Revert optimistic change
        setData(prev => prev.filter(item => keyExtractor(item) !== key));
        setOptimisticOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
        throw error;
      });
  }, [keyExtractor]);

  const optimisticUpdate = useCallback((updatedItem: T, serverOperation: () => Promise<T>) => {
    const key = keyExtractor(updatedItem);
    const originalItem = data.find(item => keyExtractor(item) === key);
    const timestamp = Date.now();
    
    if (!originalItem) return;

    // Update optimistically
    setData(prev => prev.map(item => 
      keyExtractor(item) === key ? updatedItem : item
    ));
    setOptimisticOperations(prev => new Map(prev).set(key, {
      type: 'update',
      originalData: originalItem,
      newData: updatedItem,
      timestamp
    }));

    // Perform server operation
    serverOperation()
      .then((serverResult) => {
        // Replace optimistic data with server data
        setData(prev => prev.map(item => 
          keyExtractor(item) === key ? serverResult : item
        ));
        setOptimisticOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      })
      .catch((error) => {
        // Revert optimistic change
        if (originalItem) {
          setData(prev => prev.map(item => 
            keyExtractor(item) === key ? originalItem : item
          ));
        }
        setOptimisticOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
        throw error;
      });
  }, [data, keyExtractor]);

  const optimisticDelete = useCallback((itemKey: string, serverOperation: () => Promise<void>) => {
    const originalItem = data.find(item => keyExtractor(item) === itemKey);
    const timestamp = Date.now();
    
    if (!originalItem) return;

    // Delete optimistically
    setData(prev => prev.filter(item => keyExtractor(item) !== itemKey));
    setOptimisticOperations(prev => new Map(prev).set(itemKey, {
      type: 'delete',
      originalData: originalItem,
      timestamp
    }));

    // Perform server operation
    serverOperation()
      .then(() => {
        // Confirm deletion
        setOptimisticOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(itemKey);
          return newMap;
        });
      })
      .catch((error) => {
        // Revert optimistic change
        setData(prev => [...prev, originalItem]);
        setOptimisticOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(itemKey);
          return newMap;
        });
        throw error;
      });
  }, [data, keyExtractor]);

  const isOptimistic = useCallback((itemKey: string) => {
    return optimisticOperations.has(itemKey);
  }, [optimisticOperations]);

  const getOptimisticState = useCallback((itemKey: string) => {
    return optimisticOperations.get(itemKey);
  }, [optimisticOperations]);

  return {
    data,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    isOptimistic,
    getOptimisticState,
    hasOptimisticOperations: optimisticOperations.size > 0
  };
};

export default {
  AdvancedCache,
  usePerformanceMonitor,
  useErrorBoundary,
  useAdvancedLoading,
  useOptimisticUpdates
};
