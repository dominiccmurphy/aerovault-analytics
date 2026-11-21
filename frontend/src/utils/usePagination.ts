import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [prevItems, setPrevItems] = useState<T[]>(items);

  // Reset to page 1 synchronously during render when items array reference changes
  if (items !== prevItems) {
    setPrevItems(items);
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, safePage, itemsPerPage]);

  return {
    currentPage: safePage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    totalItems: items.length,
    itemsPerPage,
  };
}