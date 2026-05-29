// src/renderer/src/hooks/useAnalysisView.ts

import { useAnalysisViewState } from './useAnalysisViewState';
import { useAnalysisViewEffects } from './useAnalysisViewEffects';
import { useAnalisysViewUtils } from './useAnalisysViewUtils';
import { useWhaleTracker } from '../WhaleTracker/useWhaleTracker';

export const useAnalysisView = (symbol: string, styles) => {
  const state = useAnalysisViewState();
  const { buyRatio,whaleBuyVolume,whaleSellVolume,whaleTrack} = useWhaleTracker(symbol, 50000,state);
  useAnalysisViewEffects(symbol, state,buyRatio);
  const utils = useAnalisysViewUtils(symbol,styles,state);

  return {
    timeframe: state.timeframe,
    loading: state.loading,
    data: state.data,
    setTimeframe: state.setTimeframe,
    rawKlines: state.rawKlines,
    tradeLevels: state.tradeLevels,
    getRsiColorClass: utils.getRsiColorClass,
    trendColor: utils.trendColor,
    scoreRisk: state.scoreRisk,
    pivotLevels: state.pivotLevels,
    handleCopyBlog: utils.handleCopyBlog,
    whaleBuyVolume: whaleBuyVolume,
    whaleSellVolume: whaleSellVolume,
    whaleTrack: whaleTrack
  };
};