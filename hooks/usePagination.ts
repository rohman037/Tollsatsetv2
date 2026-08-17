import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions<T> {
  items: T[];
  initialPage?: number;
  pageSize?: number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  paginatedItems: T[];
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
}

/**
 * High-performance lightweight pagination hook to keep DOM node count low (<50 elements)
 * even if datasets have thousands of records.
 */
export function usePagination<T>({
  items,
  initialPage = 1,
  pageSize = 10,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is within valid range
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, validCurrentPage, pageSize]);

  const setPage = useCallback(
    (page: number) => {
      const target = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(target);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage: validCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    setPage,
    nextPage,
    prevPage,
    resetPage,
  };
}
