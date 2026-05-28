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
  emaRaw: number
) => {
  let totalScore = 0;
  const breakdown: RiskFactor[] = [];
  
  // 1. Asegurar tipos numéricos para evitar bugs de strings del WebSocket
  const currentPrice = Number(currentPriceRaw);
  const rsi = Number(rsiRaw);
  const ema = Number(emaRaw);
  const support1 = Number(levels.support1);
  const support2 = Number(levels.support2);
  const resistance1 = Number(levels.resistance1);
  const resistance2 = Number(levels.resistance2);

  // --- 1. EVALUACIÓN DE SOPORTES (Máximo 45 pts) ---
  // Perder soportes es el factor de riesgo más pesado para un desplome
  let supportPoints = 0;

  if (currentPrice <= support2) {
    supportPoints = 45; // Ruptura total de la zona baja
  } else if (currentPrice <= support1) {
    supportPoints = 30; // Perdió el primer piso
  } else if (currentPrice < support1 * 1.01) {
    supportPoints = 15; // Testeando el soporte cercano (zona de peligro)
  }

  totalScore += supportPoints;
  breakdown.push({
    indicator: "Soportes (S1/S2)",
    value: `Precio: ${currentPrice} | S1: ${support1.toFixed(4)} | S2: ${support2.toFixed(4)}`,
    points: supportPoints
  });


  // --- 2. EVALUACIÓN DE RESISTENCIAS / TECHOS (Máximo 15 pts) ---
  // Estar atrapado debajo de una resistencia densa aumenta el riesgo de rechazo y caída
  let resistancePoints = 0;

  if (currentPrice < resistance1 && currentPrice > resistance1 * 0.99) {
    resistancePoints = 10; // Cerca del techo, puede ser rechazado hacia abajo
  } else if (currentPrice > resistance1 && currentPrice < resistance2) {
    resistancePoints = 5;  // Consolidando entre techos
  } else if (currentPrice >= resistance2 && rsi > 70) {
    resistancePoints = 15; // ¡ALERTA! Tocando el techo máximo CON sobrecompra. Riesgo de reversión alto.
  }

  totalScore += resistancePoints;
  breakdown.push({
    indicator: "Resistencias (R1/R2)",
    value: `R1: ${resistance1.toFixed(4)} | R2: ${resistance2.toFixed(4)}`,
    points: resistancePoints
  });


  // --- 3. EVALUACIÓN DE TENDENCIA EMA (Máximo 20 pts) ---
  // Cotizar por debajo de la EMA indica tendencia bajista activa
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
    rsiPoints = 20; // Sobrecompra extrema (Riesgo inminente de corrección/toma de ganancias)
  } else if (rsi < 40) {
    rsiPoints = 10; // Debilidad/Falta de fuerza compradora
  }

  totalScore += rsiPoints;
  breakdown.push({
    indicator: "Oscilador RSI",
    value: rsi.toFixed(2),
    points: rsiPoints
  });


  // --- ESCALAS DE ALERTA (Total Máximo Perfecto: 100 pts) ---
  let label = "Estable / Alcista";
  let color = "#52c41a"; // Verde

  if (totalScore >= 60) {
    label = "Alto Riesgo de Caída";
    color = "#ff4d4f"; // Rojo
  } else if (totalScore >= 30) {
    label = "Neutral / Corrección";
    color = "#faad14"; // Amarillo
  }

  const score: Score = {
    total: totalScore,
    breakdown: breakdown
  };

  const riskEvaluate: RiskEvaluate = {
    score: score,
    label: label,
    color: color
  };

  return riskEvaluate;
};