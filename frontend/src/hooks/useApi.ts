import { useState, useCallback, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiResponse<T> extends UseApiState<T> {
  fetchData: (url: string, options?: RequestInit) => Promise<void>;
  clearData: () => void;
}

export const useApi = <T>(): UseApiResponse<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const clearData = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const fetchData = useCallback(async (url: string, options?: RequestInit) => {
    const abortController = new AbortController();
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error) {
      if (error instanceof Error) {
        setState({
          data: null,
          loading: false,
          error
        });
      }
    }

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      clearData();
    };
  }, [clearData]);

  return {
    ...state,
    fetchData,
    clearData
  };
};