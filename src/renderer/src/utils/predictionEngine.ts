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
  
  if (!klines || klines.length === 0 || isNaN(currentPrice)) {
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

  // Lógica Base Estándar de Tendencia e Indicadores
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
  // 🔮 CONSTRUCTOR DE VECTORES
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

    switch (profile) {
      case 'sentimental':
        if (trendNormalized.includes('fuerte')) trendBiasProfile *= 1.6;
        futuresMomentumProfile *= 1.3;
        weightSpot = 0.15; weightFutures = 0.85;
        attenuationFactor = 0.06; volatilityMultiplier = 0.45;
        break;

      case 'chartista':
        // 🔥 CONFIGURACIÓN DE ANALISTA DE FORMAS:
        weightSpot = 0.40; weightFutures = 0.60;
        volatilityMultiplier = 0.28;
        attenuationFactor = 0.10; // Permite arcos extendidos simulando proyecciones de figuras

        // Modificamos el sesgo basándonos puramente en la "forma geométrica" detectada
        if (detectedPattern === 'DobleTecho') {
          // Un analista sabe que el doble techo es bajista
          trendBiasProfile = -1.8; 
          futuresMomentumProfile -= 1.0;
          chartEffectMultiplier = 1.5; // Agudiza la caída
        } else if (detectedPattern === 'DobleSuelo') {
          // Un analista sabe que el doble suelo es alcista
          trendBiasProfile = 1.8;
          futuresMomentumProfile += 1.0;
          chartEffectMultiplier = 1.5; // Agudiza el rebote
        } else if (detectedPattern === 'CompresionTriangular') {
          // Los triángulos comprimen el precio y revientan con fuerza hacia un lado.
          // Si el ratio de ballenas empuja arriba, proyectamos una ruptura alcista violenta masiva
          attenuationFactor = 0.04; // Se desboca la línea imitando un "breakout"
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
        break;
    }

    let baseDirection = (trendBiasProfile + emaSignal) + (spotPressure * weightSpot) + (futuresMomentumProfile * weightFutures);
    
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
      // El perfil chartista asume "Ruptura de figuras" (Breakouts), por lo que si hay compresión o patrones de suelo/techo, perfora los niveles con fuerza
      else if (profile === 'chartista' && (detectedPattern === 'CompresionTriangular' || detectedPattern === 'DobleSuelo' || detectedPattern === 'DobleTecho')) {
        delta *= 1.2; // Acelera el paso ignorando parcialmente los límites estáticos porque la forma "ya rompió"
      }

      projectedPrice += delta;
      vector.push({
        time: Math.floor(lastTimeSec + (i * timeStep)),
        value: parseFloat(projectedPrice.toFixed(8))
      });
    }

    return vector;
  };

  return {
    sentimental: buildVector('sentimental'),
    chartista: buildVector('chartista'), // Retorna la curva basada en la forma geométrica
    realista: buildVector('realista')
  };
};


// 📐 DETECTOR DE FORMAS GEOMÉTRICAS (Chartismo)
const detectChartPattern = (klines: any[]): 'DobleTecho' | 'DobleSuelo' | 'CompresionTriangular' | 'CanalAlcista' | 'CanalBajista' | 'Ninguno' => {
  if (klines.length < 30) return 'Ninguno';

  // Extraemos los precios de cierre recientes para buscar "valles" y "crestas"
  const prices = klines.slice(-30).map(c => Array.isArray(c) ? parseFloat(c[4]) : parseFloat(c.close));
  
  // Encontrar picos (máximos y mínimos locales)
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

  // 1. Forma de "Doble Techo" (M-Pattern) -> Resistencia psicológica fuerte, caída inminente
  const peakDifference = Math.abs(lastPeak - prevPeak) / prevPeak;
  if (peakDifference < 0.002 && prices[prices.length - 1] < lastPeak) {
    return 'DobleTecho';
  }

  // 2. Forma de "Doble Suelo" (W-Pattern) -> Soporte psicológico fuerte, rebote inminente
  const valleyDifference = Math.abs(lastValley - prevValley) / prevValley;
  if (valleyDifference < 0.002 && prices[prices.length - 1] > lastValley) {
    return 'DobleSuelo';
  }

  // 3. Forma de "Compresión o Triángulo Simétrico" -> Picos cada vez más bajos, valles cada vez más altos
  if (lastPeak < prevPeak && lastValley > prevValley) {
    return 'CompresionTriangular';
  }

  // 4. Forma de "Canal Tendencial" -> Picos y valles subiendo juntos o bajando juntos
  if (lastPeak > prevPeak && lastValley > prevValley) return 'CanalAlcista';
  if (lastPeak < prevPeak && lastValley < prevValley) return 'CanalBajista';

  return 'Ninguno';
};