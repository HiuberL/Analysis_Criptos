import { RiskEvaluate, RiskFactor, Score, SupportResistanceLevels } from "@renderer/interfaces/indicators.interface";

export const getTradeLevels = (
  entryPrice: number | string, 
  atr: number | string, 
  multiplier = 2, 
) => {
  const price = parseFloat(entryPrice as string);
  const atrValue = parseFloat(atr as string);

  if (isNaN(price) || isNaN(atrValue)) {
    return { entryPrice: 0, stopLossC: 0, takeProfitC: 0, stopLossV: 0, takeProfitV: 0 };
  }

  const riskAmount = atrValue * multiplier;
  
  const stopLossC = price - riskAmount;
  const takeProfitC = price + (riskAmount * 2);
  const stopLossV = price + riskAmount;
  const takeProfitV = price - (riskAmount * 2);

  return { 
    entryPrice: price, 
    stopLossC: Math.max(0, stopLossC), 
    takeProfitC: Math.max(0, takeProfitC),
    stopLossV: Math.max(0, stopLossV), 
    takeProfitV: Math.max(0, takeProfitV) 
  };
};



export const evaluateDropRisk = (
  currentPriceRaw: number, 
  levels: SupportResistanceLevels, 
  rsiRaw: number, 
  emaRaw: number,
  whaleBuyRatioRaw: number // <-- Inyectamos el ratio en tiempo real del WebSocket
) => {
  let totalScore = 0;
  const breakdown: RiskFactor[] = [];
  
  // 1. Asegurar tipos numéricos para evitar bugs de strings del WebSocket
  const currentPrice = Number(currentPriceRaw);
  const rsi = Number(rsiRaw);
  const ema = Number(emaRaw);
  const whaleBuyRatio = Number(whaleBuyRatioRaw);
  const support1 = Number(levels.support1);
  const support2 = Number(levels.support2);
  const resistance1 = Number(levels.resistance1);
  const resistance2 = Number(levels.resistance2);

  // --- 1. EVALUACIÓN DE SOPORTES (Máximo 45 pts) ---
  let supportPoints = 0;
  if (currentPrice <= support2) {
    supportPoints = 45; 
  } else if (currentPrice <= support1) {
    supportPoints = 30; 
  } else if (currentPrice < support1 * 1.01) {
    supportPoints = 15; 
  }

  totalScore += supportPoints;
  breakdown.push({
    indicator: "Soportes (S1/S2)",
    value: `Precio: ${currentPrice} | S1: ${support1.toFixed(4)} | S2: ${support2.toFixed(4)}`,
    points: supportPoints
  });


  // --- 2. EVALUACIÓN DE RESISTENCIAS / TECHOS (Máximo 15 pts) ---
  let resistancePoints = 0;
  if (currentPrice < resistance1 && currentPrice > resistance1 * 0.99) {
    resistancePoints = 10; 
  } else if (currentPrice > resistance1 && currentPrice < resistance2) {
    resistancePoints = 5;  
  } else if (currentPrice >= resistance2 && rsi > 70) {
    resistancePoints = 15; 
  }

  totalScore += resistancePoints;
  breakdown.push({
    indicator: "Resistencias (R1/R2)",
    value: `R1: ${resistance1.toFixed(4)} | R2: ${resistance2.toFixed(4)}`,
    points: resistancePoints
  });


  // --- 3. EVALUACIÓN DE TENDENCIA EMA (Máximo 20 pts) ---
  let emaPoints = 0;
  if (currentPrice < ema) {
    emaPoints = 20;
  }

  totalScore += emaPoints;
  breakdown.push({
    indicator: "Tendencia EMA",
    value: `Precio: ${currentPrice} | EMA: ${ema.toFixed(4)}`,
    points: emaPoints
  });


  // --- 4. EVALUACIÓN DE IMPULSO RSI (Máximo 20 pts) ---
  let rsiPoints = 0;
  if (rsi > 75) {
    rsiPoints = 20; 
  } else if (rsi < 40) {
    rsiPoints = 10; 
  }

  totalScore += rsiPoints;
  breakdown.push({
    indicator: "Oscilador RSI",
    value: rsi.toFixed(2),
    points: rsiPoints
  });


  // --- 5. NUEVO: COMPORTAMIENTO DE BALLENAS (Modificador de Riesgo de +/- 25 pts) ---
  // Al ser un score de RIESGO DE CAÍDA:
  // - Si el buy ratio es bajo (< 35%), las ballenas venden a mercado => AUMENTA el riesgo.
  // - Si el buy ratio es alto (> 65%), las ballenas absorben y acumulan => DISMINUYE el riesgo.
  let whalePoints = 0;
  let whaleText = "Neutral (Flujo balanceado)";

  if (whaleBuyRatio > 0) { // Validamos que tengamos datos activos del WS
    if (whaleBuyRatio < 35) {
      whalePoints = 25; // Distribución institucional: eleva el riesgo drásticamente
      whaleText = `Alerta: Distribución (${whaleBuyRatio.toFixed(1)}% Compras)`;
    } else if (whaleBuyRatio > 65) {
      whalePoints = -25; // Absorción institucional: frena el riesgo de caída
      whaleText = `Acumulación Fuerte (${whaleBuyRatio.toFixed(1)}% Compras)`;
    } else {
      whaleText = `Flujo Estable (${whaleBuyRatio.toFixed(1)}% Compras)`;
    }
  }

  totalScore += whalePoints;
  breakdown.push({
    indicator: "Flujo Inversión (Ballenas)",
    value: whaleText,
    points: whalePoints
  });


  // --- ESCALAS DE ALERTA AJUSTADAS Y LÓGICA DEFENSIVA ---
  // Dado que sumamos o restamos puntos institucionales, forzamos que el score se mantenga entre 0 y 100
  const finalScore = Math.max(0, Math.min(100, totalScore));

  let label = "Estable / Alcista";
  let color = "#52c41a"; // Verde

  if (finalScore >= 60) {
    label = "Alto Riesgo de Caída";
    color = "#ff4d4f"; // Rojo
  } else if (finalScore >= 30) {
    label = "Neutral / Corrección";
    color = "#faad14"; // Amarillo
  }

  const score: Score = {
    total: finalScore,
    breakdown: breakdown
  };

  const riskEvaluate: RiskEvaluate = {
    score: score,
    label: label,
    color: color
  };

  return riskEvaluate;
};

export const calculateWhaleScore = (ratioData: any[]): number => {
  if (!ratioData || ratioData.length === 0) return 0;

  // Tomamos el registro más reciente (el último elemento del array)
  const latest = ratioData[ratioData.length - 1];
  
  // Binance devuelve campos como longAccount y shortAccount en formato string (ej: "0.5821")
  const longRatio = parseFloat(latest.longAccount);
  const shortRatio = parseFloat(latest.shortAccount);

  // LÓGICA DE FILTRADO:
  // Si las posiciones Long superan el 55%, las ballenas ejercen presión alcista
  if (longRatio >= 0.55) {
    // Retornamos un número positivo proporcional a la fuerza alcista
    return Math.round((longRatio - 0.50) * 100); 
  } 
  // Si las posiciones Short superan el 55%, ejercen presión bajista
  else if (shortRatio >= 0.55) {
    // Retornamos un número negativo proporcional a la fuerza bajista
    return Math.round((shortRatio - 0.50) * -100);
  }

  // Si está en zona de indecisión (ej: 51% vs 49%), es neutral
  return 0;
};

export const getPricePredictionScore = (
  rsi: number, 
  currentPrice: number, 
  ema200: number, 
  whaleTrack: number
) => {
  let score = 0;

  // 1. Sentimiento Institucional (Ballenas)
  score += whaleTrack; // Si las ballenas están en +10, suma 10 puntos.

  // 2. Tendencia Estructural (EMA 200)
  if (currentPrice > ema200) {
    score += 25; // Sesgo estructural alcista
  } else {
    score -= 25; // Sesgo estructural bajista
  }

  // 3. Extremos de Mercado (RSI)
  if (rsi < 30) score += 20; // Exhausto a la venta, potencial rebote alcista futuro
  if (rsi > 70) score -= 20; // Exhausto a la compra, potencial caída futura

  // Retornamos el veredicto para tu HTML
  if (score >= 30) return { verdict: "🟢 Alta Probabilidad Alcista", power: score, color: "#02c076" };
  if (score <= -30) return { verdict: "🔴 Alta Probabilidad Bajista", power: score, color: "#f6465d" };
  return { verdict: "🟡 Zona de Rangos/ Indecisión", power: score, color: "#f0b90b" };
};