
export const useCandleChartUtils = () => {
  const calculateEMA = (data: number[], period: number) => {
    let ema: (number | null)[] = new Array(data.length).fill(null);
    let k = 2 / (period + 1);
    
    if (data.length < period) return ema;

    // EMA inicial: SMA simple de los primeros 'period' datos
    let sum = data.slice(0, period).reduce((a, b) => a + b, 0);
    ema[period - 1] = sum / period;

    for (let i = period; i < data.length; i++) {
      ema[i] = data[i] * k + (ema[i - 1] as number) * (1 - k);
    }
    return ema;
  };
  
  return {
    calculateEMA
  };
};