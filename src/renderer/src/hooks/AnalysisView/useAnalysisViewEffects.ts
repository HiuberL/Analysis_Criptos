import { useEffect, useCallback } from 'react';
import { useAnalysisViewState } from './useAnalysisViewState';
import { fetchKlines, subscribeToKlines } from '@renderer/services/binance-api.services';
import { calculatePivotSupports, calculateTrend } from '@renderer/utils/AnalisisResult';
import { evaluateDropRisk, getTradeLevels } from '@renderer/utils/Indicators';

export const useAnalysisViewEffects = (
  symbol: string,
  state: ReturnType<typeof useAnalysisViewState>,
  whaleBuyRatioRaw: number
) => {
  const {
    setLoading,
    timeframe,
    setRawKlines,
    setData, 
    setTradeLevels,
    setScoreRisk,
    setPivotLevels
  } = state;

  const AnalysisCalculateFetch = useCallback(() => {
    let active = true;
    let unsubscribe: () => void;

    const init = async () => {
      setLoading(true);      
      const historicalKlines = await fetchKlines(symbol, timeframe, 500);      
      if (!active) return; 
      
      setRawKlines(historicalKlines);      
      
      // Cálculo y carga inicial con data histórica
      const initialTrend = calculateTrend(historicalKlines);
      if (initialTrend) {
        const pivotLevels = calculatePivotSupports(historicalKlines);
        const currentPrice = historicalKlines.length > 0 ? parseFloat(historicalKlines[historicalKlines.length - 1][4]) : 0;
        const currentRsi = initialTrend.rsi ?? 50;
        const currentEma = initialTrend.ema200 ?? currentPrice;
        setPivotLevels(pivotLevels);
        const initialEvaluateRisk = evaluateDropRisk(initialTrend.currentPrice ?? 0, pivotLevels, currentRsi, currentEma,whaleBuyRatioRaw);
        setTradeLevels(getTradeLevels(initialTrend.lastPrice || currentPrice, initialTrend.atr || 0));
        setData(initialTrend);
        setScoreRisk(initialEvaluateRisk);
      }
      setLoading(false);      
      
      // Suscripción al WebSocket vivo
      unsubscribe = subscribeToKlines(symbol, timeframe, historicalKlines, (updatedKlines) => {
        if (!active) return;

        // Usamos siempre updatedKlines (frescas), evitando usar estados que causen parpadeos
        setRawKlines(updatedKlines);
        
        const result = calculateTrend(updatedKlines);
        const pivotLevels = calculatePivotSupports(updatedKlines);    
        setPivotLevels(pivotLevels);
        
        const currentPrice = updatedKlines.length > 0 ? parseFloat(updatedKlines[updatedKlines.length - 1][4]) : 0;      
        const currentRsi = result?.rsi ?? 50; 
        const currentEma = result?.ema200 ?? currentPrice;
        
        const evaluateRisk = evaluateDropRisk(result?.currentPrice ?? currentPrice, pivotLevels, currentRsi, currentEma,whaleBuyRatioRaw);
        setTradeLevels(result ? getTradeLevels(result.lastPrice || currentPrice, result.atr || 0) : null);
        
        setData(result);
        setScoreRisk(evaluateRisk);
      });
    };
    setPivotLevels(null);
    setRawKlines([]); 
    setData(null);
    setTradeLevels(null);
    setScoreRisk(null);
    
    init();

    return () => {
      active = false; 
      if (unsubscribe) unsubscribe(); 
    };
  }, [symbol, timeframe, setRawKlines, setData, setLoading, setTradeLevels]);

  useEffect(() => {
    const cleanupWebSocket = AnalysisCalculateFetch();
    
    return () => {
      if (cleanupWebSocket) cleanupWebSocket();
    };
  }, [AnalysisCalculateFetch]); 
  return { AnalysisCalculateFetch };
};