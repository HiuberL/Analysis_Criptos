import { Indicators, MultipleProjections } from "@renderer/interfaces/indicators.interface";
import { detectChartPattern, generatePriceProjection } from "@renderer/utils/predictionEngine";
export const generateAIPricreProjection = async (
  urlPredict: string,
  klines: any[],
  currentPrice: number,
  indicators: Indicators,
  technicalLevels: any, // SupportResistanceLevels
  globalTrack: any,     // GlobalTrack
  whaleFuture: number,
  scoreRisk: { score: number },
  trend: string,
  timeframe: '15m' | '1h' | '1d' | '1M',
  periodsToPredict: number = 15
): Promise<MultipleProjections> => {
  
  // 1. Estado de fallback seguro por si la red o las validaciones fallan

  if(!urlPredict){
    const result = generatePriceProjection(
      klines,
      currentPrice,
      indicators,
      technicalLevels,
      globalTrack,
      whaleFuture,
      scoreRisk,
      trend,
      timeframe,
      periodsToPredict
    );
    return result;
  }

  const fallbackResponse: MultipleProjections = {
    sentimental: [],
    chartista: [],
    realista: []
  };

  // 2. Defensas de datos corruptos o insuficientes antes de la solicitud de red
  if (!klines || klines.length < 15 || isNaN(currentPrice)) {
    return fallbackResponse;
  }

  // 3. Extraer tiempo base de la última vela de forma ultra defensiva
  const lastCandle = klines[klines.length - 1];
  let lastTimeSec = 0;
  if (Array.isArray(lastCandle)) {
    lastTimeSec = (typeof lastCandle[0] === 'number' ? lastCandle[0] : parseFloat(lastCandle[0])) / 1000;
  } else if (lastCandle && lastCandle.time) {
    const rawTime = typeof lastCandle.time === 'number' ? lastCandle.time : parseFloat(lastCandle.time);
    lastTimeSec = rawTime > 5000000000 ? rawTime / 1000 : rawTime;
  }
  
  if (!lastTimeSec || isNaN(lastTimeSec)) return fallbackResponse;

  // 4. Ejecutar el detector de patrones geométricos locales
  const detectedPattern = detectChartPattern(klines);

  // 5. Construcción del JSON enriquecido que espera recibir FastAPI
  const payload = {
    klines: klines,
    currentPrice: currentPrice,
    lastTimeSec: lastTimeSec,
    detectedPattern: detectedPattern,
    trend: trend,
    timeframe: timeframe,
    periodsToPredict: periodsToPredict,
    whaleFuture: whaleFuture,
    scoreRisk: scoreRisk.score,
    indicators: {
      rsi: indicators.rsi || 50,
      ema20: indicators.ema20 || currentPrice,
      ema50: indicators.ema50 || currentPrice
    },
    technicalLevels: {
      support1: technicalLevels.support1 || 0,
      resistance1: technicalLevels.resistance1 || 0
    },
    globalTrack: {
      buyVol: globalTrack.buyVol || 0,
      sellVol: globalTrack.sellVol || 0,
      longShortRatio: globalTrack.longShortRatio || 1.0
    }
  };

  try {
    const response = await fetch(urlPredict, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error en el motor predictivo: ${response.statusText}`);
    }

    const predictions: MultipleProjections = await response.json();
    return predictions;

  } catch (error) {
    console.error("Fallo de conexión con el backend de IA en Python:", error);
    // Si la IA de Python está apagada, devolvemos la estructura limpia para no romper la UI
    return fallbackResponse;
  }
};

