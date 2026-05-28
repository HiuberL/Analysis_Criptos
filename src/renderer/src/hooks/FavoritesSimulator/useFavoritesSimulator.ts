// src/renderer/src/hooks/useAnalysisView.ts

import { useFavoritesSimulatorEffects } from "./useFavoritesSimulatorEffects";
import { useFavoritesSimulatorHandler } from "./useFavoritesSimulatorHandler";
import { useFavoritesSimulatorState } from "./useFavoritesSimulatorState";

export const useFavoritesSimulator = (
  setLoading,
  loadSymbols,
  rawSymbols,
  favorites,
) => {
  const state = useFavoritesSimulatorState();
  useFavoritesSimulatorEffects(setLoading,loadSymbols,state);
  const handler = useFavoritesSimulatorHandler(rawSymbols,favorites,state);
  return {
    isRunning: handler.isRunning,
    globalAmount: state.globalAmount,
    setGlobalAmount: state.setGlobalAmount,
    handleStartGlobalSimulation: handler.handleStartGlobalSimulation,
    handleResetGlobalSimulation: handler.handleResetGlobalSimulation,
    getCurrentMarketPrice: handler.getCurrentMarketPrice,
    simulation: state.simulation    
  };
};