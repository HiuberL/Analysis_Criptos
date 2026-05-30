export interface SupportResistanceLevels {
  support1: number;
  support2: number;
  resistance1: number;
  resistance2: number;
}

export interface RiskFactor {
  indicator: string; // Nombre de la métrica evaluada
  value: string | number; // Valor actual del mercado
  points: number; // Puntos añadidos al score de riesgo
}
export interface GlobalSimulation {
  investmentPerCoin: number;
  entryPrices: { [symbol: string]: number };
  status: 'idle' | 'running';
}

export interface CandleData {
  time: number | string;
  open: number | string;
  high: number | string;
  low: number | string;
  close: number | string;
  volume: number | string;
}

export interface AnalysisResult {
  currentPrice: number;
  lastPrice: number;
  ema20: number;
  ema50: number;
  ema200: number;
  rsi: number;
  volume: number;
  avgVolume: number;
  bullishPercentage: number;
  trend: 'Fuerte Alcista' | 'Alcista' | 'Neutral' | 'Bajista' | 'Fuerte Bajista';
  atr: number; 
}

export interface RiskEvaluate {
    score: Score;
    label: string;
    color: string;
}

export interface Score{
    total: number,
    breakdown: RiskFactor[]
}

export interface GlobalDataFuture{
  long: number,
  short:number
}