// src/renderer/src/hooks/dashboard/useDashboardState.ts
import { SymbolInfo } from '@renderer/interfaces/binance.interface';
import { useState } from 'react';

export const useFavoritesState = () => {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("crypto_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error al recuperar favoritos:", error);
      return [];
    }
  });

  return {
    symbols, setSymbols,
    loading, setLoading,
    selectedSymbol, setSelectedSymbol,
    search, setSearch,
    favorites,setFavorites
  };
};