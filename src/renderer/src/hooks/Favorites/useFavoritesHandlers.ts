// src/renderer/src/hooks/dashboard/useDashboardHandlers.ts
import { ChangeEvent } from 'react';

export const useFavoritesHandlers = (
  setSearch: React.Dispatch<React.SetStateAction<string>>,
  setSelectedSymbol: React.Dispatch<React.SetStateAction<string | null>>
) => {
  
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