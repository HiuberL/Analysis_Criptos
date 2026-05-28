import { useFavoritesSimulatorState } from "./useFavoritesSimulatorState";

export const useFavoritesSimulatorHandler = (
  rawSymbols,
  favorites,
  state: ReturnType<typeof useFavoritesSimulatorState>
) => {
  const {
    globalAmount,
    setSimulation,
    setGlobalAmount,
    simulation
  }= state;
  const getCurrentMarketPrice = (symbol: string): number => {
    if (!rawSymbols || rawSymbols.length === 0) return 0;

    const coin = rawSymbols.find((s) => s.symbol === symbol);
    if (coin) {
      // Mapeo defensivo de propiedades según useFavoritesState
      const targetPrice = coin.lastPrice || coin.price || coin.closePrice;
      return targetPrice ? parseFloat(targetPrice) : 0;
    }
    return 0;
  };

  const handleStartGlobalSimulation = () => {
    const amount = parseFloat(globalAmount);
    if (amount <= 0 || isNaN(amount)) {
      alert("Por favor introduce un monto válido mayor a 0.");
      return;
    }

    const pricesSnapshot: { [symbol: string]: number } = {};
    let missingPrices = false;

    favorites.forEach((symbol) => {
      const price = getCurrentMarketPrice(symbol);
      if (price === 0) missingPrices = true;
      pricesSnapshot[symbol] = price;
    });

    if (missingPrices && favorites.length > 0) {
      alert("⚠️ Los precios del mercado se están actualizando. Espera un segundo.");
      return;
    }

    setSimulation({
      investmentPerCoin: amount,
      entryPrices: pricesSnapshot,
      status: 'running'
    });
  };

  const handleResetGlobalSimulation = () => {
    setSimulation({
      investmentPerCoin: 0,
      entryPrices: {},
      status: 'idle'
    });
    setGlobalAmount('');
  };

  const isRunning = simulation.status === 'running';


  return {
    isRunning,
    handleResetGlobalSimulation,
    handleStartGlobalSimulation,
    getCurrentMarketPrice
  }
};