import { useFavoritesSimulatorState } from "./useFavoritesSimulatorState";

export const useFavoritesSimulatorHandler = (
  rawSymbols,
  favorites,
  state: ReturnType<typeof useFavoritesSimulatorState>
) => {
  const {
    setSimulation,
    simulation,
    setCustomAmounts,
    customAmounts,
    customMarketPrices,
    setCustomMarketPrices
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
    const amount = Number(Object.keys(customAmounts).length);
    const favoritoTotal = Number(favorites.length);
    if (amount === 0 || amount != favoritoTotal) {
      alert("Por favor introduce un monto válido mayor a 0.");
      return;
    }

    const pricesSnapshot: { [symbol: string]: number } = {};
    const investSnapshot: { [symbol: string]: number } = {};
    const marketSnapshot: { [symbol: string]: number } = {};

    let missingPrices = false;
    let missingValue = false;
    let missingMarket = false;

    favorites.forEach((symbol) => {
      const price = Number(customMarketPrices[symbol]);
      const invest = Number(customAmounts[symbol]);
      const market  = getCurrentMarketPrice(symbol);
      if (price === 0) missingPrices = true;
      pricesSnapshot[symbol] = price;

      if (invest === 0) missingValue = true;
      investSnapshot[symbol] = invest;

      if (market === 0) missingPrices = true;
      marketSnapshot[symbol] = price;

    });

    if (missingMarket && favorites.length > 0) {
      alert("⚠️ Los precios del mercado se están actualizando. Espera un segundo.");
      return;
    }

    setSimulation({
      investmentPerCoin: investSnapshot,
      entryPrices: pricesSnapshot,
      marketPrice: marketSnapshot,
      status: 'running'
    });
  };

  const handleResetGlobalSimulation = () => {
    setSimulation({
      investmentPerCoin: {},
      entryPrices: {},      
      marketPrice:{},
      status: 'idle'
    });
  };

  const isRunning = simulation.status === 'running';
  const handleCustomAmountChange = (symbol: string, value: string) => {
    setCustomAmounts(prev => ({ ...prev, [symbol]: value }));
  };

  const handleCustomPriceChange = (symbol: string, value: string) => {
    setCustomMarketPrices(prev => ({ ...prev, [symbol]: value }));
  };


  return {
    isRunning,
    handleResetGlobalSimulation,
    handleStartGlobalSimulation,
    getCurrentMarketPrice,
    handleCustomAmountChange,
    handleCustomPriceChange
  }
};