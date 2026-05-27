import { useState, useMemo, useEffect } from "react"; 
import { useFavoritesHandlers } from "./useFavoritesHandlers";
import { useFavoritesState } from "./useFavoritesState";
import { useFavoritesEffects } from "./useFavoritesEffects"; // Asegúrate de importar tus efectos si usas loadSymbols

export const useFavorites = () => {
  const state = useFavoritesState();
  
  // 1. Estado local de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Estado inicializado desde localStorage para los favoritos
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("crypto_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error al recuperar favoritos:", error);
      return [];
    }
  });

  // CORRECCIÓN SINTAXIS: Capturamos loadSymbols desde tu hook de efectos usando el estado global
  const { loadSymbols } = useFavoritesEffects(state.setSymbols, state.setLoading);
  
  const handlers = useFavoritesHandlers(state.setSearch, state.setSelectedSymbol);

  // Guardar en localStorage automáticamente cada vez que cambien los favoritos
  useEffect(() => {
    localStorage.setItem("crypto_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Función para alternar favoritos (agregar o quitar)
  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  // 2. FILTRADO ADAPTADO: Ahora solo trae las monedas cuyo símbolo exista en el array de "favorites"
  const filteredSymbols = useMemo(() => {
    return state.symbols
      .filter(item => favorites.includes(item.symbol)) // <--- CLAVE: Filtra solo lo que está en favoritos
      .filter(item => 
        item.symbol.toLowerCase().includes(state.search.toLowerCase()) ||
        item.baseAsset.toLowerCase().includes(state.search.toLowerCase())
      );
  }, [state.symbols, state.search, favorites]); // Se añade 'favorites' como dependencia para refrescar la vista en tiempo real

  // Si el usuario escribe algo en el buscador, reiniciamos a la página 1 automáticamente
  useEffect(() => {
    setCurrentPage(1);
  }, [state.search]);

  // 3. Paginación (slice sobre el resultado filtrado de favoritos)
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
    
    // Dejamos esto para tus tablas de favoritos
    filteredSymbols: paginatedSymbols, 
    
    // 🌟 NUEVA LÍNEA CLAVE: Exponemos el listado original de Binance sin pasar por filtros
    rawSymbols: state.symbols, 
    setLoading: state.setLoading, // Exponemos para controlar la UI de carga
    
    currentPage,
    setCurrentPage,
    totalPages,
    handleSearchChange: handlers.handleSearchChange,
    loadSymbols, 
    favorites,
    toggleFavorite,    
    handleSelectSymbol: (symbol: string) => {
      handlers.handleSelectSymbol(symbol);
    }
  };
};