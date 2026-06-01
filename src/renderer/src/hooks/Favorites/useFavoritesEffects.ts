import { fetchAvailableSymbolsNoFilter } from '@renderer/services/binance-api.services';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { useFavoritesState } from './useFavoritesState';
import { useConfiguration } from '../Configuration/useConfiguration';

export const useFavoritesEffects = (
    state: ReturnType<typeof useFavoritesState>,
    config: ReturnType<typeof useConfiguration>
) => {

  const {
    setLoading,
    setSymbols,
    setFavorites,
    favorites
  }= state;
  const{
    getConfigValue
  } = config;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Number(getConfigValue("paginacion"));

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };  

  const filteredSymbols = useMemo(() => {
    return state.symbols
      .filter(item => favorites.includes(item.symbol)) // <--- CLAVE: Filtra solo lo que está en favoritos
      .filter(item => 
        item.symbol.toLowerCase().includes(state.search.toLowerCase()) ||
        item.baseAsset.toLowerCase().includes(state.search.toLowerCase())
      );
  }, [state.symbols, state.search, favorites]); // Se añade 'favorites' como dependencia para refrescar la vista en tiempo real
  const paginatedSymbols = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSymbols.slice(start, start + itemsPerPage);
  }, [filteredSymbols, currentPage]);

  const totalPages = Math.ceil(filteredSymbols.length / itemsPerPage);
  const loadSymbols = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAvailableSymbolsNoFilter(getConfigValue("conversor"));
      setSymbols(data);
    } catch (error) {
      console.error("Error al cargar símbolos:", error);
    } finally {
      setLoading(false);
    }
  }, [setSymbols, setLoading]);
  useEffect(() => {
    setCurrentPage(1);
  }, [state.search]);
  useEffect(() => {
    localStorage.setItem("crypto_favorites", JSON.stringify(favorites));
  }, [favorites]);
  
  useEffect(() => {
    loadSymbols();
  }, [loadSymbols]);

  return { loadSymbols,
    paginatedSymbols, 
    toggleFavorite,   
    currentPage,
    setCurrentPage,
    totalPages,}; // Retornamos la función para usarla en el Dashboard
};