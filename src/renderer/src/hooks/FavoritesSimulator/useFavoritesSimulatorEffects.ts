import { useEffect } from 'react';
import { useFavoritesSimulatorState } from './useFavoritesSimulatorState';

export const useFavoritesSimulatorEffects = (
  setLoading: any,
  loadSymbols: any,
  state: ReturnType<typeof useFavoritesSimulatorState>
) => {
  const {
    simulation
  } = state;
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        await loadSymbols(); // Descarga de Binance
      } catch (error) {
        console.error("Error al cargar precios en simulador:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  useEffect(() => {
    localStorage.setItem("crypto_global_simulation", JSON.stringify(simulation));
  }, [simulation]);


  return;
};