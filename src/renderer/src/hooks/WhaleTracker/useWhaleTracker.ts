import { useAnalysisViewState } from "../AnalysisView/useAnalysisViewState";
import { useWhaleTrackerEffects } from "./useWhaleTrackerEffects";
import { useWhaleTrackerState } from "./useWhaleTrackerState";

export const useWhaleTracker = (symbol,thresholdUsdt, stateAnalisis: ReturnType<typeof useAnalysisViewState>,) => {
  const {
    timeframe
  } = stateAnalisis;
  const state = useWhaleTrackerState();
  const effects = useWhaleTrackerEffects(state,symbol,thresholdUsdt,timeframe);
  
return {
    whaleTrades : state.whaleTrades,
    whaleBuyVolume: state.whaleBuyVolume,
    whaleSellVolume: state.whaleSellVolume,
    buyRatio: effects.buyRatio,
    whaleTrack: state.whaleTrack
  };
};