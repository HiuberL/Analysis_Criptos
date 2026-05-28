// src/renderer/src/services/binanceApi.ts
import { KlineData, SymbolInfo } from "@renderer/interfaces/binance.interface";

const BASE_URL = import.meta.env.VITE_API_BINANCE;
const API_KEY = import.meta.env.VITE_BINANCE_API_KEY;

/**
 * Obtiene el historial de precios y volumen (Klines)
 */
// Añade esta función a tu archivo binanceApi.ts
// En tu archivo de servicios donde tienes subscribeToKlines
export const fetchKlines = async (
  symbol: string = 'BTCUSDT', 
  interval: '15m' |'1h' | '1d'| '1M' = '1h',
  limit: number = 100
): Promise<KlineData[]> => {
  try {
    const url = `${BASE_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);

    const data: any[][] = await response.json();
    return data.map(candle => ({
      time: candle[0] as number,
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
    }));
  } catch (error) {
    console.error(`Error en fetchKlines:`, error);
    return [];
  }
};

export const subscribeToKlines = (
  symbol: string,
  interval: string,
  initialKlines: any[], // AÑADE: Necesitas pasar el histórico inicial que obtuviste previamente
  onUpdate: (updatedKlines: any[]) => void
) => {
  // Creamos una copia del histórico para no mutar el original
  let klinesBuffer = [...initialKlines];

  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const k = message.k;

    const newCandle = {
      time: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      volume: parseFloat(k.v),
      isFinal: k.x
    };

    // Lógica para actualizar el buffer:
    // Si el tiempo de la última vela es igual, la reemplazamos (está abierta)
    // Si es diferente, añadimos la nueva (la anterior cerró)
    if (klinesBuffer.length > 0 && newCandle.time === klinesBuffer[klinesBuffer.length - 1].time) {
      klinesBuffer[klinesBuffer.length - 1] = newCandle;
    } else {
      klinesBuffer.push(newCandle);
      klinesBuffer.shift(); // Mantenemos el tamaño fijo (ej. 500)
    }

    // Enviamos el array completo a tu componente
    onUpdate([...klinesBuffer]);
  };

  return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
};

export const getOpportunityScore = (symbolData: any, ema200: number, rsi: number) => {
  let score = 0;
  
  // 1. Filtro de Tendencia (EMA 200)
  if (parseFloat(symbolData.price) > ema200) score += 3;
  
  // 2. Filtro de RSI (Salud de la tendencia)
  if (rsi > 45 && rsi < 65) score += 3;
  
  // 3. Filtro de Liquidez
  if (parseFloat(symbolData.volume) > 100000) score += 2;
  
  return score;
};
/**
 * OBTENCIÓN EFICIENTE: Trae toda la lista y precios en solo 2 peticiones.
 * Evita el bloqueo por Rate Limit (error 429).
 */
export const fetchAvailableSymbols = async (): Promise<SymbolInfo[]> => {
  try {
    const [exchangeResponse, tickerResponse] = await Promise.all([
      fetch(`${BASE_URL}/exchangeInfo`),
      fetch(`${BASE_URL}/ticker/24hr`)
    ]);

    const exchangeData = await exchangeResponse.json();
    const tickerData = await tickerResponse.json();
    
    // Creamos el mapa con los datos necesarios
    const statsMap = new Map(tickerData.map((t: any) => [t.symbol, {
      price: t.lastPrice,
      volume: parseFloat(t.quoteVolume) || 0,
      change: parseFloat(t.priceChangePercent) || 0
    }]));

    return exchangeData.symbols
      .filter((item: any) => item.status === 'TRADING' && item.quoteAsset === 'USDT')
      .map((item: any) => {
        const stats = statsMap.get(item.symbol) || { price: '0.00', volume: 0, change: 0 };
        return {
          symbol: item.symbol,
          baseAsset: item.baseAsset,
          quoteAsset: item.quoteAsset,
          price: stats.price,
          volume: stats.volume,
          change: stats.change
        };
      })
      // --- FILTROS DE PROTECCIÓN DE CAPITAL ---
      .filter((item: SymbolInfo) => item.volume > 50000) // Suficiente liquidez
      .filter((item: SymbolInfo) => {
        const absChange = Math.abs(item.change);
        // Filtramos monedas que se mueven más de 1% pero menos de 10% (volatilidad saludable)
        return absChange > 1 && absChange < 10;
      })
      .filter((item: SymbolInfo) => parseFloat(item.price) > 0.0001)
      // ----------------------------------------
      .sort((a: SymbolInfo, b: SymbolInfo) => b.volume - a.volume);

  } catch (error) {
    console.error('Error al filtrar símbolos:', error);
    return [];
  }
};

export const fetchAvailableSymbolsNoFilter = async (): Promise<SymbolInfo[]> => {
  try {
    const [exchangeResponse, tickerResponse] = await Promise.all([
      fetch(`${BASE_URL}/exchangeInfo`),
      fetch(`${BASE_URL}/ticker/24hr`)
    ]);

    const exchangeData = await exchangeResponse.json();
    const tickerData = await tickerResponse.json();
    
    // Creamos el mapa con los datos necesarios
    const statsMap = new Map(tickerData.map((t: any) => [t.symbol, {
      price: t.lastPrice,
      volume: parseFloat(t.quoteVolume) || 0,
      change: parseFloat(t.priceChangePercent) || 0
    }]));

    return exchangeData.symbols
      .filter((item: any) => item.status === 'TRADING' && item.quoteAsset === 'USDT')
      .map((item: any) => {
        const stats = statsMap.get(item.symbol) || { price: '0.00', volume: 0, change: 0 };
        return {
          symbol: item.symbol,
          baseAsset: item.baseAsset,
          quoteAsset: item.quoteAsset,
          price: stats.price,
          volume: stats.volume,
          change: stats.change
        };
      })
      // ----------------------------------------
      .sort((a: SymbolInfo, b: SymbolInfo) => b.volume - a.volume);

  } catch (error) {
    console.error('Error al filtrar símbolos:', error);
    return [];
  }
};

/**
 * CONEXIÓN WEBSOCKET: Para datos en tiempo real (evita setInterval de REST)
 * Llama a esta función dentro de un useEffect.
 */
export const subscribeToPrice = (symbol: string, onMessage: (price: string) => void) => {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data.c); // 'c' es el precio actual
  };

  ws.onerror = (err) => console.error("WebSocket Error:", err);
  
  // Retorna la función para cerrar la conexión cuando el componente se desmonte
  return () => ws.close();
};