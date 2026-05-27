import { useState, useMemo, useEffect } from "react"; 
import { useDashboardEffects } from "./useDashboardEffects";
import { useDashboardHandlers } from "./useDashboardHandlers";
import { useDashboardState } from "./useDashboardState";

export const useDashboard = () => {
  const state = useDashboardState();
  
  // 1. Estado local de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // CAPTURAMOS loadSymbols del hook de efectos
  const { loadSymbols } = useDashboardEffects(state.setSymbols, state.setLoading);
  const [favorites, setFavorites] = useState<string[]>(() => {
      const saved = localStorage.getItem("crypto_favorites");
      return saved ? JSON.parse(saved) : [];
    });  
  const handlers = useDashboardHandlers(state.setSearch, state.setSelectedSymbol);
// Función para alternar favorito
  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };
  // 2. Filtramos (se mantiene igual)
  const filteredSymbols = useMemo(() => {
    return state.symbols.filter(item => 
      item.symbol.toLowerCase().includes(state.search.toLowerCase()) ||
      item.baseAsset.toLowerCase().includes(state.search.toLowerCase())
    );
  }, [state.symbols, state.search]);
  useEffect(() => {
    setCurrentPage(1);
  }, [state.search]); // Solo depende de la búsqueda, no de los favoritos
  // Si el usuario busca algo, reiniciamos a la página 1 automáticamente
  useEffect(() => {
    localStorage.setItem("crypto_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // 3. Paginamos (slice sobre el resultado del filtro)
  const paginatedSymbols = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSymbols.slice(start, start + itemsPerPage);
  }, [filteredSymbols, currentPage]);

  const totalPages = Math.ceil(filteredSymbols.length / itemsPerPage);

  // 4. Retornamos todo lo necesario para la UI
  return {
    search: state.search,
    loading: state.loading,
    selectedSymbol: state.selectedSymbol,
    
    // UI consume estos valores
    filteredSymbols: paginatedSymbols, 
    currentPage,
    setCurrentPage,
    totalPages,
    
    handleSearchChange: handlers.handleSearchChange,
    
    // EXPONEMOS la función para el botón de actualizar
    loadSymbols, 
    favorites,
    toggleFavorite,    
    handleSelectSymbol: (symbol: string) => {
      handlers.handleSelectSymbol(symbol);
    }
  };
};