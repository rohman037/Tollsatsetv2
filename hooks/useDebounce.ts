import { useState, useEffect } from 'react';

/**
 * Hook to debounce value changes (e.g. search input).
 * Reduces re-renders and heavy filtering computations when multiple users/inputs type fast.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
