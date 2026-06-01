// src/renderer/src/hooks/useAnalysisView.ts

import { useAnalysisViewState } from './useAnalysisViewState';
import { useAnalysisViewEffects } from './useAnalysisViewEffects';
import { useAnalisysViewUtils } from './useAnalisysViewUtils';
import { useWhaleTracker } from '../WhaleTracker/useWhaleTracker';
import { useConfiguration } from '../Configuration/useConfiguration';

export const useAnalysisView = (symbol: string, styles) => {
  const state = useAnalysisViewState();
  const { buyRatio,whaleBuyVolume,whaleSellVolume,whaleTrack,globalTrack,globalTrackDetail} = useWhaleTracker(symbol,state);
  const config = useConfiguration();
  useAnalysisViewEffects(symbol, state,buyRatio,config);
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
    whaleTrack: whaleTrack,
    globalTrack: globalTrack,
    buyRatio: buyRatio,
    globalTrackDetail:globalTrackDetail
  };
};