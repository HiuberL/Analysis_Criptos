import { fetchAvailableSymbols } from '@renderer/services/binance-api.services';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { useDashboardState } from './useDashboardState';
import { useConfiguration } from '../Configuration/useConfiguration';

export const useDashboardEffects = (
    state: ReturnType<typeof useDashboardState>,
    config: ReturnType<typeof useConfiguration>
) => {
  const {
    setLoading,
    setSymbols,
    setFavorites,
    favorites
  }= state;

  const {
    getConfigValue
  } = config;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Number(getConfigValue("paginacion"));

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };


  const loadSymbols = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAvailableSymbols(getConfigValue("conversor"),getConfigValue("sort"));
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

  const filteredSymbols = useMemo(() => {
    return state.symbols.filter(item => 
      item.symbol.toLowerCase().includes(state.search.toLowerCase()) ||
      item.baseAsset.toLowerCase().includes(state.search.toLowerCase())
    );
  }, [state.symbols, state.search]);  

  const paginatedSymbols = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSymbols.slice(start, start + itemsPerPage);
  }, [filteredSymbols, currentPage]);


  useEffect(() => {
    setCurrentPage(1);
  }, [state.search]); // Solo depende de la búsqueda, no de los favoritos

  useEffect(() => {
    localStorage.setItem("crypto_favorites", JSON.stringify(favorites));
  }, [favorites]);
  
  const totalPages = Math.ceil(filteredSymbols.length / itemsPerPage);


  return { loadSymbols,toggleFavorite,paginatedSymbols,currentPage,setCurrentPage,totalPages }; // Retornamos la función para usarla en el Dashboard
};