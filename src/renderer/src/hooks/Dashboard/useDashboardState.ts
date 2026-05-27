// src/renderer/src/hooks/dashboard/useDashboardState.ts
import { SymbolInfo } from '@renderer/interfaces/binance.interface';
import { useState } from 'react';

export const useDashboardState = () => {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  return {
    symbols, setSymbols,
    loading, setLoading,
    selectedSymbol, setSelectedSymbol,
    search, setSearch
  };
};