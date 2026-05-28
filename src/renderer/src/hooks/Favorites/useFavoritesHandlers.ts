// src/renderer/src/hooks/dashboard/useDashboardHandlers.ts
import { ChangeEvent } from 'react';
import { useFavoritesState } from './useFavoritesState';

export const useFavoritesHandlers = (
    state: ReturnType<typeof useFavoritesState>
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