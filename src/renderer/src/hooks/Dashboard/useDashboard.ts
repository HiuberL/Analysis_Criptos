import { useConfiguration } from "../Configuration/useConfiguration";
import { useDashboardEffects } from "./useDashboardEffects";
import { useDashboardHandlers } from "./useDashboardHandlers";
import { useDashboardState } from "./useDashboardState";

export const useDashboard = () => {

  const state = useDashboardState();
  const config = useConfiguration();
  const effects = useDashboardEffects(state,config);
  const handlers = useDashboardHandlers(state);
  return {
    search: state.search,
    loading: state.loading,
    selectedSymbol: state.selectedSymbol,
    
    // UI consume estos valores
    filteredSymbols: effects.paginatedSymbols, 
    currentPage: effects.currentPage,
    setCurrentPage:effects.setCurrentPage,
    totalPages: effects.totalPages,
    
    handleSearchChange: handlers.handleSearchChange,
    
    loadSymbols: effects.loadSymbols, 
    favorites: state.favorites,
    toggleFavorite:effects.toggleFavorite,    
    handleSelectSymbol: (symbol: string) => {
      handlers.handleSelectSymbol(symbol);
    }
  };
};