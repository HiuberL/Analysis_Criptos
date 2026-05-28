import { GlobalSimulation } from '@renderer/interfaces/indicators.interface';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useRef, useState } from 'react';

export const useFavoritesSimulatorState = () => {

  const [globalAmount, setGlobalAmount] = useState<string>('');
  
  const [simulation, setSimulation] = useState<GlobalSimulation>(() => {
    const saved = localStorage.getItem("crypto_global_simulation");
    return saved ? JSON.parse(saved) : { investmentPerCoin: 0, entryPrices: {}, status: 'idle' };
  });

  return {
    globalAmount, 
    setGlobalAmount,
    simulation, 
    setSimulation
  };
};