import { useEffect, useCallback } from 'react';
import { useAnalysisViewState } from './useAnalysisViewState';
import { fetchKlines, subscribeToKlines } from '@renderer/services/binance-api.services';
import { calculatePivotSupports, calculateTrend } from '@renderer/utils/AnalisisResult';
import { evaluateDropRisk, getTradeLevels } from '@renderer/utils/Indicators';
import { useConfiguration } from '../Configuration/useConfiguration';
import { generateAIPricreProjection } from '@renderer/services/predictor-api.services';

export const useAnalysisViewEffects = (
  symbol: string,
  state: ReturnType<typeof useAnalysisViewState>,
  whaleBuyRatioRaw: number,
  config: ReturnType<typeof useConfiguration>,
  globalTrackDetail: any,
  whaleTrack: any
) => {
  const {
    setLoading,
    timeframe,
    setRawKlines,
    setData, 
    setTradeLevels,
    setScoreRisk,
    setPivotLevels,
    rawKlines,
    data,
    pivotLevels,
    scoreRisk,
    setPredictionData
  } = state;

  const {
    getConfigValue
  } = config;
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
        setTradeLevels(getTradeLevels(initialTrend.lastPrice || currentPrice, initialTrend.atr || 0,Number(getConfigValue("apalancamiento"))));
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
        setTradeLevels(result ? getTradeLevels(result.lastPrice || currentPrice, result.atr || 0, Number(getConfigValue("apalancamiento"))) : null,);
        
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

  useEffect(() => {
    let isMounted = true;

    const fetchAndPredict = async () => {
      // 1. Defensa estricta para evitar llamar a la IA sin datos listos
      if (!rawKlines || rawKlines.length === 0 || !data?.currentPrice) return;

      try {
        // 2. 🔥 INVOCACIÓN ASÍNCRONA CORRECTA
        const dataReceived = await generateAIPricreProjection(
          getConfigValue("urlPredict")?? "",
          rawKlines,
          data.currentPrice,
          {
            rsi: data.rsi,
            volume: data.volume,
            ema20: data.ema20,
            ema50: data.ema50,
            ema200: data.ema200
          },       // { rsi, ema200 }
          pivotLevels,  // Soportes/Resistencias Pivot
          globalTrackDetail,      // Datos de Ratios
          whaleTrack,      // Métrica numérica +/- de ballenas
          scoreRisk,        // { score: X }
          data.trend,            // "Alcista" | "Bajista" | etc.
          timeframe,        // '15m' | '1h' | '1d' | '1M'
          15                // períodos a predecir
        );

        // 3. Setear el estado solo si el componente sigue montado en pantalla
        if (isMounted) {
          setPredictionData(dataReceived);
        }
      } catch (error) {
        console.error("Error cargando la proyección de la IA:", error);
      }
    };

    fetchAndPredict();

    return () => {
      isMounted = false; // Cleanup para evitar condiciones de carrera
    };
  }, [rawKlines, timeframe, data, whaleTrack]);

  return { AnalysisCalculateFetch };
};