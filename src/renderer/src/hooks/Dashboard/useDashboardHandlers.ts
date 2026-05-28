// src/renderer/src/hooks/dashboard/useDashboardHandlers.ts
import { ChangeEvent } from 'react';
import { useDashboardState } from './useDashboardState';

export const useDashboardHandlers = (
    state: ReturnType<typeof useDashboardState>
) => {

  const {
    setSearch,
    setSelectedSymbol
  }= state;
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return {
    handleSearchChange,
    handleSelectSymbol
  };
};