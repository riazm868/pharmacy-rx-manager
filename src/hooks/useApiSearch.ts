import { useState, useEffect, useCallback, useRef } from 'react';

interface SearchOptions {
  minSearchLength?: number;
  debounceMs?: number;
  limit?: number;
  cache?: boolean;
}

interface SearchResult<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

// Simple in-memory cache
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useApiSearch<T>(
  endpoint: string,
  searchTerm: string,
  options: SearchOptions = {}
): SearchResult<T> {
  const {
    minSearchLength = 2,
    debounceMs = 300,
    limit = 10,
    cache = true
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (search: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    const cacheKey = `${endpoint}:${search}:${limit}`;
    if (cache) {
      const cached = searchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setData(cached.data.data);
        setTotal(cached.data.total);
        setError(null);
        return;
      }
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        search,
        limit: limit.toString(),
        offset: '0'
      });

      const response = await fetch(`${endpoint}?${params}`, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Cache the result
      if (cache) {
        searchCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch data');
        setData([]);
        setTotal(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, limit, cache]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length === 0 || searchTerm.length >= minSearchLength) {
        fetchData(searchTerm);
      } else {
        setData([]);
        setTotal(0);
        setError(null);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      // Cancel request on cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchTerm, fetchData, minSearchLength, debounceMs]);

  return { data, total, isLoading, error };
}

// Specialized hooks for each entity type
export function usePatientSearch(searchTerm: string, options?: SearchOptions) {
  return useApiSearch<any>('/api/patients', searchTerm, options);
}

export function useMedicationSearch(searchTerm: string, options?: SearchOptions) {
  return useApiSearch<any>('/api/medications', searchTerm, options);
}

export function useDoctorSearch(searchTerm: string, options?: SearchOptions) {
  return useApiSearch<any>('/api/doctors', searchTerm, options);
} 