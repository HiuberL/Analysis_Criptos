import { SymbolInfo } from '@renderer/interfaces/binance.interface';
import { fetchAvailableSymbols } from '@renderer/services/binance-api.services';
import { useEffect, useCallback } from 'react';

export const useDashboardEffects = (
  setSymbols: React.Dispatch<React.SetStateAction<SymbolInfo[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Usamos useCallback para que la función sea estable
  const loadSymbols = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAvailableSymbols();
      setSymbols(data);
    } catch (error) {
      console.error("Error al cargar símbolos:", error);
    } finally {
      setLoading(false);
    }
  }, [setSymbols, setLoading]);

  useEffect(() => {
    loadSymbols();
  }, [loadSymbols]);

  return { loadSymbols }; // Retornamos la función para usarla en el Dashboard
};