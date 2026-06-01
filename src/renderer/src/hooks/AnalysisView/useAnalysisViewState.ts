import { SymbolInfo } from '@renderer/interfaces/binance.interface';
import { AnalysisResultData } from '@renderer/interfaces/indicators.interface';
import { useState } from 'react';

export const useAnalysisViewState = () => {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'15m'|'1h' | '1d' | '1M'>('1d');
  const [rawKlines, setRawKlines] = useState<any[]>([]);
  const [data, setData] = useState<AnalysisResultData | null>(null);
  const [tradeLevels, setTradeLevels] = useState<any>(null);
  const [scoreRisk, setScoreRisk] = useState<any>(null);
  const [pivotLevels, setPivotLevels] = useState<any>(null);
  

  return {
    symbols, setSymbols,
    loading, setLoading,
    selectedSymbol, setSelectedSymbol,
    search, setSearch,
    timeframe, setTimeframe,
    rawKlines,setRawKlines,
    data, setData,
    tradeLevels, setTradeLevels,
    scoreRisk, setScoreRisk,
    pivotLevels, setPivotLevels
  };
};