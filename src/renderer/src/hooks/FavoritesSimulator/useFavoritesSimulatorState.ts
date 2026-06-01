import { GlobalSimulation } from '@renderer/interfaces/indicators.interface';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useRef, useState } from 'react';

export const useFavoritesSimulatorState = () => {

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [customMarketPrices, setCustomMarketPrices] = useState<Record<string, string>>({});
  
  const [simulation, setSimulation] = useState<GlobalSimulation>(() => {
    const saved = localStorage.getItem("crypto_global_simulation");
    return saved ? JSON.parse(saved) : { investmentPerCoin: 0, entryPrices: {}, marketPrice: {}, currentPrice:{}, status: 'idle' };
  });

  return {
    simulation, 
    setSimulation,
    customAmounts, setCustomAmounts,
    customMarketPrices, setCustomMarketPrices
  };
};