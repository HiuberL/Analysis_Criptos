import { useAnalysisViewState } from "./useAnalysisViewState";

export const useAnalisysViewUtils = (styles,state: ReturnType<typeof useAnalysisViewState>) => {
  const {data} = state;

  const getRsiColorClass = (rsi: number) => {
    if (rsi < 30) return styles.textGreen;
    if (rsi > 70) return styles.textRed;
    return styles.textNeutral;
  };

  const getTrendColor = (percentage: number) => {
    if (percentage >= 60) return '#0ECB81';
    if (percentage <= 40) return '#F6465D';
    return '#F0B90B';
  };
  const currentPercentage = data?.bullishPercentage ?? 50;
  const trendColor = getTrendColor(currentPercentage);
  
  return {
    getRsiColorClass,
    getTrendColor,
    trendColor
  };
};