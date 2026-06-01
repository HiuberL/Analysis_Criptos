import { useAnalysisViewState } from "../AnalysisView/useAnalysisViewState";
import { useConfiguration } from "../Configuration/useConfiguration";
import { useWhaleTrackerEffects } from "./useWhaleTrackerEffects";
import { useWhaleTrackerState } from "./useWhaleTrackerState";

export const useWhaleTracker = (symbol, stateAnalisis: ReturnType<typeof useAnalysisViewState>,) => {
  const {
    timeframe
  } = stateAnalisis;
  const config = useConfiguration();
  const state = useWhaleTrackerState();
  const effects = useWhaleTrackerEffects(state,symbol,Number(config.getConfigValue("threshold")),timeframe);
  
return {
    whaleTrades : state.whaleTrades,
    whaleBuyVolume: state.whaleBuyVolume,
    whaleSellVolume: state.whaleSellVolume,
    buyRatio: effects.buyRatio,
    whaleTrack: state.whaleTrack,
    globalTrack:state.globalTrack,
    globalTrackDetail: state.globalTrackDetail
  };
};