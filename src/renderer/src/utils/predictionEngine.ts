import { GlobalTrack, Indicators, MultipleProjections, PredictionPoint, SupportResistanceLevels } from "@renderer/interfaces/indicators.interface";

export const generatePriceProjection = (
  klines: any[],
  currentPrice: number,
  indicators: Indicators,
  technicalLevels: SupportResistanceLevels,
  globalTrack: GlobalTrack,
  whaleFuture: number,
  scoreRisk: { score: number },
  trend: string,
  timeframe: '15m' | '1h' | '1d' | '1M',
  periodsToPredict: number = 15
): MultipleProjections => {
  
  // 1. Defensas de datos corruptos o insuficientes para el entrenamiento de la IA
  if (!klines || klines.length < 15 || isNaN(currentPrice)) {
    return { sentimental: [], chartista: [], realista: [] };
  }

  const lastCandle = klines[klines.length - 1];
  let lastTimeSec = 0;
  if (Array.isArray(lastCandle)) {
    lastTimeSec = (typeof lastCandle[0] === 'number' ? lastCandle[0] : parseFloat(lastCandle[0])) / 1000;
  } else if (lastCandle && lastCandle.time) {
    const rawTime = typeof lastCandle.time === 'number' ? lastCandle.time : parseFloat(lastCandle.time);
    lastTimeSec = rawTime > 5000000000 ? rawTime / 1000 : rawTime;
  }
  
  if (!lastTimeSec || isNaN(lastTimeSec)) return { sentimental: [], chartista: [], realista: [] };

  let timeStep = 3600;
  if (timeframe === '15m') timeStep = 900;
  if (timeframe === '1h') timeStep = 3600;
  if (timeframe === '1d') timeStep = 86400;
  if (timeframe === '1M') timeStep = 86400 * 30;

  // Detectar la forma geométrica antes de empezar
  const detectedPattern = detectChartPattern(klines);

  // =========================================================================
  // 🧠 MOTOR DE INTELIGENCIA ARTIFICIAL (Regresión Lineal por Mínimos Cuadrados)
  // =========================================================================
  // La IA analiza las últimas 45 velas para aprender la correlación temporal del momentum.
  const aiSampleSize = Math.min(45, klines.length - 1);
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = klines.length - aiSampleSize; i < klines.length; i++) {
    const currentC = klines[i];
    const prevC = klines[i - 1];
    
    const cPrice = Array.isArray(currentC) ? parseFloat(currentC[4]) : currentC.close;
    const pPrice = Array.isArray(prevC) ? parseFloat(prevC[4]) : prevC.close;
    
    if (isNaN(cPrice) || isNaN(pPrice)) continue;

    const x = i - (klines.length - aiSampleSize); // Índice temporal relativo (Feature X)
    const y = cPrice - pPrice;                    // Delta de cambio real (Feature Y)

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const aiDenominator = (aiSampleSize * sumXX - sumX * sumX);
  // Pendiente matemática real extraída de la inercia actual de Binance
  const aiLearpedSlope = aiDenominator !== 0 ? (aiSampleSize * sumXY - sumX * sumY) / aiDenominator : 0;

  // Lógica Base Estándar de Tendencia Cualitativa (Se usa para sesgar los vectores entrenados)
  let trendBias = 0;
  const trendNormalized = trend.toLowerCase();
  if (trendNormalized.includes('fuerte alcista')) trendBias = 1.2;
  else if (trendNormalized.includes('alcista')) trendBias = 0.6;
  else if (trendNormalized.includes('fuerte bajista')) trendBias = -1.2;
  else if (trendNormalized.includes('bajista')) trendBias = -0.6;

  const emaSignal = indicators.ema20 > indicators.ema50 ? 0.3 : -0.3;
  const volTotal = (globalTrack.buyVol || 0) + (globalTrack.sellVol || 0);
  const buyRatio = volTotal > 0 ? (globalTrack.buyVol / volTotal) : 0.50;
  const spotPressure = (Math.max(-1, Math.min(1, globalTrack.longShortRatio - 1)) * 0.4) + (((buyRatio - 0.50) * 2) * 0.6);

  let futuresMomentum = 0;
  if (typeof whaleFuture === 'number' && !isNaN(whaleFuture)) {
    futuresMomentum = Math.max(-5, Math.min(5, whaleFuture / 5));
  }

  let baseVolatility = currentPrice * 0.001;
  let counted = 0;
  let totalDiff = 0;
  const sample = Math.min(klines.length, 7);
  for (let i = klines.length - sample; i < klines.length; i++) {
    const c = klines[i];
    const h = Array.isArray(c) ? parseFloat(c[2]) : parseFloat(c.high);
    const l = Array.isArray(c) ? parseFloat(c[3]) : parseFloat(c.low);
    if (!isNaN(h) && !isNaN(l)) { totalDiff += (h - l); counted++; }
  }
  if (counted > 0) baseVolatility = (totalDiff / counted);

  // ==========================================
  // 🔮 CONSTRUCTOR DE VECTORES ENRIQUECIDO POR IA
  // ==========================================
  const buildVector = (profile: 'sentimental' | 'chartista' | 'realista'): PredictionPoint[] => {
    let trendBiasProfile = trendBias;
    let futuresMomentumProfile = futuresMomentum;
    let weightSpot = 0.35;
    let weightFutures = 0.65;
    let attenuationFactor = 0.13;
    let volatilityMultiplier = 0.30;
    let chartEffectMultiplier = 1.0; 
    let breakDirection = 1; // Para simular rupturas geométricas alternas
    
    // Peso de la pendiente aprendida por Inteligencia Artificial
    let aiSlopeWeight = 0.5; 

    switch (profile) {
      case 'sentimental':
        if (trendNormalized.includes('fuerte')) trendBiasProfile *= 1.6;
        futuresMomentumProfile *= 1.3;
        weightSpot = 0.15; weightFutures = 0.85;
        attenuationFactor = 0.06; volatilityMultiplier = 0.45;
        aiSlopeWeight = 0.2; // El sentimiento ignora la rigidez de la IA matemática e histérica
        break;

      case 'chartista':
        weightSpot = 0.40; weightFutures = 0.60;
        volatilityMultiplier = 0.28;
        attenuationFactor = 0.10; 
        aiSlopeWeight = 0.6; // Alta confluencia con la inercia lineal

        if (detectedPattern === 'DobleTecho') {
          trendBiasProfile = -1.8; 
          futuresMomentumProfile -= 1.0;
          chartEffectMultiplier = 1.5; 
        } else if (detectedPattern === 'DobleSuelo') {
          trendBiasProfile = 1.8;
          futuresMomentumProfile += 1.0;
          chartEffectMultiplier = 1.5; 
        } else if (detectedPattern === 'CompresionTriangular') {
          attenuationFactor = 0.04; 
          chartEffectMultiplier = 1.8;
          breakDirection = futuresMomentum > 0 ? 1.4 : -1.4;
        } else if (detectedPattern === 'CanalAlcista') {
          trendBiasProfile += 0.4;
        } else if (detectedPattern === 'CanalBajista') {
          trendBiasProfile -= 0.4;
        }
        break;

      case 'realista':
        weightSpot = 0.35; weightFutures = 0.65;
        attenuationFactor = 0.12; volatilityMultiplier = 0.32;
        aiSlopeWeight = 0.8; // El perfil realista confía firmemente en el sesgo regresivo de la IA
        break;
    }

    // Integramos el coeficiente predictivo lineal (aiLearnedSlope normalizado sobre volatilidad base)
    const aiInertiaFactor = baseVolatility > 0 ? (aiLearpedSlope / baseVolatility) : 0;
    
    // Combinamos las fuerzas cuantitativas clásicas junto a la neurona lineal entrenada
    let baseDirection = (trendBiasProfile + GlenSign(emaSignal)) + (spotPressure * weightSpot) + (futuresMomentumProfile * weightFutures);
    
    // Mezcla equilibrada: Fórmula Clásica + Dirección sugerida por IA
    baseDirection = (baseDirection * (1 - aiSlopeWeight)) + (aiInertiaFactor * aiSlopeWeight);
    
    // Multiplicamos por la fuerza o dirección de las figuras del análisis chartista
    baseDirection *= chartEffectMultiplier * (profile === 'chartista' ? breakDirection : 1);

    // Filtros de RSI y Riesgo para Realista y Chartista
    let rsiDamping = 1.0;
    if (profile !== 'sentimental') {
      if (indicators.rsi > 70 && baseDirection > 0) rsiDamping = Math.max(0.05, 1 - ((indicators.rsi - 70) / 30));
      else if (indicators.rsi < 30 && baseDirection < 0) rsiDamping = Math.max(0.05, 1 - ((30 - indicators.rsi) / 30));
    }

    let riskFactor = 1.0;
    if (profile !== 'sentimental' && scoreRisk.score > 50) riskFactor = Math.max(0.0, 1 - (scoreRisk.score / 100));

    const avgVolatility = baseVolatility * volatilityMultiplier;
    const vector: PredictionPoint[] = [];
    let projectedPrice = currentPrice;

    vector.push({ time: Math.floor(lastTimeSec), value: currentPrice });

    let stepDirection = baseDirection * rsiDamping;
    if (stepDirection > 0) stepDirection *= riskFactor;

    for (let i = 1; i <= periodsToPredict; i++) {
      const inertia = Math.exp(-attenuationFactor * i);
      let delta = avgVolatility * stepDirection * inertia;

      // El perfil realista respeta soportes institucionales amortiguados
      if (profile === 'realista') {
        if (delta > 0 && technicalLevels.resistance1 > 0) {
          const overshot = projectedPrice - technicalLevels.resistance1;
          if (overshot >= 0) delta *= 0.15 * Math.exp(-0.4 * i);
          else if ((technicalLevels.resistance1 - projectedPrice) < avgVolatility) delta *= 0.7;
        }
        if (delta < 0 && technicalLevels.support1 > 0) {
          const undershot = technicalLevels.support1 - projectedPrice;
          if (undershot >= 0) delta *= 0.15 * Math.exp(-0.4 * i);
          else if ((projectedPrice - technicalLevels.support1) < avgVolatility) delta *= 0.7;
        }
      }
      // El perfil chartista asume "Ruptura de figuras" (Breakouts)
      else if (profile === 'chartista' && (detectedPattern === 'CompresionTriangular' || detectedPattern === 'DobleSuelo' || detectedPattern === 'DobleTecho')) {
        delta *= 1.2; 
      }

      projectedPrice += delta;
      vector.push({
        time: Math.floor(lastTimeSec + (i * timeStep)),
        value: parseFloat(projectedPrice.toFixed(8))
      });
    }

    return vector;
  };

  // Función de apoyo interna para mantener señales limpias
  function GlenSign(val: number): number { return isNaN(val) ? 0 : val; }

  return {
    sentimental: buildVector('sentimental'),
    chartista: buildVector('chartista'), 
    realista: buildVector('realista')
  };
};

// 📐 DETECTOR DE FORMAS GEOMÉTRICAS (Se mantiene intacto abajo)
export const detectChartPattern = (klines: any[]): 'DobleTecho' | 'DobleSuelo' | 'CompresionTriangular' | 'CanalAlcista' | 'CanalBajista' | 'Ninguno' => {
  if (klines.length < 30) return 'Ninguno';

  const prices = klines.slice(-30).map(c => Array.isArray(c) ? parseFloat(c[4]) : parseFloat(c.close));
  
  const peaks: number[] = [];
  const valleys: number[] = [];
  
  for (let i = 1; i < prices.length - 1; i++) {
    if (prices[i] > prices[i-1] && prices[i] > prices[i+1]) peaks.push(prices[i]);
    if (prices[i] < prices[i-1] && prices[i] < prices[i+1]) valleys.push(prices[i]);
  }

  const lastPeak = peaks[peaks.length - 1];
  const prevPeak = peaks[peaks.length - 2];
  const lastValley = valleys[valleys.length - 1];
  const prevValley = valleys[valleys.length - 2];

  if (!lastPeak || !prevPeak || !lastValley || !prevValley) return 'Ninguno';

  const peakDifference = Math.abs(lastPeak - prevPeak) / prevPeak;
  if (peakDifference < 0.002 && prices[prices.length - 1] < lastPeak) {
    return 'DobleTecho';
  }

  const valleyDifference = Math.abs(lastValley - prevValley) / prevValley;
  if (valleyDifference < 0.002 && prices[prices.length - 1] > lastValley) {
    return 'DobleSuelo';
  }

  if (lastPeak < prevPeak && lastValley > prevValley) {
    return 'CompresionTriangular';
  }

  if (lastPeak > prevPeak && lastValley > prevValley) return 'CanalAlcista';
  if (lastPeak < prevPeak && lastValley < prevValley) return 'CanalBajista';

  return 'Ninguno';
};