import { AnalysisResult, CandleData, PivotLevel, SupportResistanceLevels } from '@renderer/interfaces/indicators.interface';
import { EMA, RSI, SMA, MACD, ATR } from 'technicalindicators';



export const calculateTrend = (data: CandleData[]): AnalysisResult | null => {
  if (!data || data.length < 20) return null;

  const closes = data.map(d => parseFloat(d.close as string));
  const highs = data.map(d => parseFloat(d.high as string));
  const lows = data.map(d => parseFloat(d.low as string));
  const volumes = data.map(d => parseFloat(d.volume as string));

  const last = (arr: number[]) => (arr && arr.length > 0 ? arr[arr.length - 1] : 0);

  const rsiValues = RSI.calculate({ period: 14, values: closes });
  const ema20Values = EMA.calculate({ period: 20, values: closes });
  const ema50Values = data.length >= 50 ? EMA.calculate({ period: 50, values: closes }) : [];
  const ema200Values = data.length >= 200 ? EMA.calculate({ period: 200, values: closes }) : [];
  const volSma = SMA.calculate({ period: 20, values: volumes });
  
  const atrValues = ATR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14
  });

  const macdValues = data.length >= 26 ? MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  }) : [];

  const currentPrice = closes[closes.length - 1];
  const currentVolume = volumes[volumes.length - 1];
  const currentRsi = last(rsiValues);
  const cEma20 = last(ema20Values);
  const cEma50 = last(ema50Values);
  const cEma200 = last(ema200Values);
  const avgVolume = last(volSma);
  const macd = last(macdValues);
  const currentAtr = last(atrValues);

  let score = 50;
  if (currentPrice > cEma20) score += 10; else score -= 10;
  if (cEma50 > 0 && cEma200 > 0) {
    if (cEma50 > cEma200) score += 15; else score -= 15;
  }
  if (currentRsi > 0) {
    if (currentRsi < 30) score += 15;
    else if (currentRsi > 70) score -= 15;
  }
  if (macd && typeof macd !== 'number' && macd.histogram !== undefined) {
    if (macd.histogram > 0) score += 15; else score -= 15;
  }
  if (avgVolume > 0 && currentVolume > avgVolume) score += 5;

  const finalPercentage = Math.max(0, Math.min(100, Math.round(score)));

  let trendLabel: AnalysisResult['trend'] = 'Neutral';
  if (finalPercentage >= 80) trendLabel = 'Fuerte Alcista';
  else if (finalPercentage >= 60) trendLabel = 'Alcista';
  else if (finalPercentage <= 20) trendLabel = 'Fuerte Bajista';
  else if (finalPercentage <= 40) trendLabel = 'Bajista';

  return {
    currentPrice,
    lastPrice: currentPrice,
    ema20: cEma20,
    ema50: cEma50,
    ema200: cEma200,
    rsi: currentRsi,
    volume: currentVolume,
    avgVolume,
    bullishPercentage: finalPercentage,
    trend: trendLabel,
    atr: currentAtr
  };
};


export const calculatePivotSupports = (klines: any[]): SupportResistanceLevels => {
  if (klines.length < 2) {
    return { support1: 0, support2: 0, resistance1: 0, resistance2: 0 };
  }
  const prevCandle = klines[klines.length - 2 ];
  const high = prevCandle.high;
  const low = prevCandle.low;
  const close = prevCandle.close;
  const pivot = (high + low + close) / 3;
  const r1 = (2 * pivot) - low;
  const s1 = (2 * pivot) - high;
  
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);
  const levelsPivot: SupportResistanceLevels = {
    support1: s1,
    support2: s2,
    resistance1: r1,
    resistance2: r2
  }
  return levelsPivot;
};