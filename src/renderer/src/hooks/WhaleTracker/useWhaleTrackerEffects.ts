import { fetchGlobalLongShortRatio, fetchHistoricalWhaleTrades, fetchWhaleLongShortRatio, subscribeToWhaleTrades } from "@renderer/services/binance-api.services";
import { useWhaleTrackerState } from "./useWhaleTrackerState";
import { useEffect } from "react";
import { calculateWhaleScore } from "@renderer/utils/Indicators";

export const useWhaleTrackerEffects = (
    state: ReturnType<typeof useWhaleTrackerState>,
    symbol: string, thresholdUsdt: number = 50000,
    timeStamp
) => {
  const {
    whaleTrades, setWhaleTrades,
    whaleBuyVolume, setWhaleBuyVolume,
    whaleSellVolume, setWhaleSellVolume,
    setLoading,
    setWhaleTrack,
    globalTrack, setGlobalTrack
  } = state;
  
  useEffect(() => {
    let isMounted = true; // Flag defensivo para evitar memory leaks si cambian rápido de moneda
    let unsubscribeWebSocket: (() => void) | null = null;

    // Resetear estados al cambiar de moneda para no mezclar datos viejos
    setWhaleTrades([]);
    setWhaleBuyVolume(0);
    setWhaleSellVolume(0);

    const initWhaleTracker = async () => {
      // 1. CARGA HISTÓRICA INICIAL (Pasado cercano)
      // Jalamos los últimos 1000 trades para buscar ballenas recientes
      const history = await fetchHistoricalWhaleTrades(symbol, thresholdUsdt, 1000);
      
      if (!isMounted) return;

      // Calcular los volúmenes acumulados del historial inicial
      let initialBuyVol = 0;
      let initialSellVol = 0;
      history.forEach(t => {
        if (t.side === 'BUY') initialBuyVol += t.totalUsdt;
        else initialSellVol += t.totalUsdt;
      });

      // Guardamos la base histórica (reducida a los últimos 30 registros para visualización limpia en UI)
      setWhaleTrades(history.slice(0, 30));
      setWhaleBuyVolume(initialBuyVol);
      setWhaleSellVolume(initialSellVol);

      // 2. CONEXIÓN EN TIEMPO REAL (Futuro)
      // Una vez montado el pasado, nos enganchamos al WebSocket para actualizar en vivo
      unsubscribeWebSocket = subscribeToWhaleTrades(symbol, thresholdUsdt, (newTrade) => {
        if (!isMounted) return;

        setWhaleTrades((prevTrades) => {
          // Validamos que no metamos un ID duplicado si la API REST y el WS se solapan
          if (prevTrades.some(t => t.id === newTrade.id)) return prevTrades;
          
          const updated = [newTrade, ...prevTrades];
          return updated.slice(0, 30); // Mantener un buffer saludable en memoria
        });

        if (newTrade.side === 'BUY') {
          setWhaleBuyVolume((prev) => prev + newTrade.totalUsdt);
        } else {
          setWhaleSellVolume((prev) => prev + newTrade.totalUsdt);
        }
      });
    };

    initWhaleTracker();

    // Función de limpieza asíncrona perfecta para React
    return () => {
      isMounted = false;
      if (unsubscribeWebSocket) {
        unsubscribeWebSocket();
      }
    };
  }, [symbol, thresholdUsdt]);
  const totalVolume = whaleBuyVolume + whaleSellVolume;
  const buyRatio = totalVolume > 0 ? (whaleBuyVolume / totalVolume) * 100 : 50;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const getWhaleData = async () => {
      const data = await fetchWhaleLongShortRatio(symbol, timeStamp); // Evaluamos en base a bloques de 1 hora
      if (isMounted) {
        const score = calculateWhaleScore(data);
        setWhaleTrack(score);
        setLoading(false);
      }
    };
    const getWhaleDataGlobal = async () => {
      const globalData = await fetchGlobalLongShortRatio(symbol, timeStamp);
      if (globalData && globalData.length > 0) {
        const latestGlobal = globalData[globalData.length - 1];
        
        const globalLong = parseFloat(latestGlobal.longAccount);  // Porcentaje global long
        const globalShort = parseFloat(latestGlobal.shortAccount); // Porcentaje global short
        
        // Guardas esto en un estado para pintarlo en tu interfaz
        setGlobalTrack({ long: globalLong * 100, short: globalShort * 100 });
      }    
    }
    getWhaleData();
    getWhaleDataGlobal();
    return () => {
      isMounted = false; // Evita fugas de memoria al cambiar rápido de moneda
    };
  }, [symbol]);

  return {
    whaleTrades,
    whaleBuyVolume,
    whaleSellVolume,
    buyRatio
  };
};