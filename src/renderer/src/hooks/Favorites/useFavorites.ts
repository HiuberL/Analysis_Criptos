import { useFavoritesHandlers } from "./useFavoritesHandlers";
import { useFavoritesState } from "./useFavoritesState";
import { useFavoritesEffects } from "./useFavoritesEffects"; // Asegúrate de importar tus efectos si usas loadSymbols

export const useFavorites = () => {
  const state = useFavoritesState();
  const handlers = useFavoritesHandlers(state);
  const effects = useFavoritesEffects(state);
  
return {
    search: state.search,
    loading: state.loading,
    selectedSymbol: state.selectedSymbol,
    
    // Dejamos esto para tus tablas de favoritos
    filteredSymbols: effects.paginatedSymbols, 
    
    // 🌟 NUEVA LÍNEA CLAVE: Exponemos el listado original de Binance sin pasar por filtros
    rawSymbols: state.symbols, 
    setLoading: state.setLoading, // Exponemos para controlar la UI de carga
    
    currentPage: effects.currentPage,
    setCurrentPage: effects.setCurrentPage,
    totalPages: effects.totalPages,
    handleSearchChange: handlers.handleSearchChange,
    loadSymbols: effects.loadSymbols, 
    favorites: state.favorites,
    toggleFavorite: effects.toggleFavorite,    
    handleSelectSymbol: (symbol: string) => {
      handlers.handleSelectSymbol(symbol);
    }
  };
};