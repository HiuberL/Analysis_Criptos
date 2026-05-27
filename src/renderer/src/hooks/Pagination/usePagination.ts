// src/renderer/src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

export const usePagination = <T>(data: T[], itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return { paginatedData, currentPage, setCurrentPage, totalPages };
};