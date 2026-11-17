import { useState, useMemo, useEffect } from 'react';

export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset back to Page 1 whenever the filtered/sorted items list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    totalItems: items.length,
    itemsPerPage,
  };
}