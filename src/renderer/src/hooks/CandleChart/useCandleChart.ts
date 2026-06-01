// src/renderer/src/hooks/useAnalysisView.ts

import { useRef } from 'react';
import { useCandleChartEffects } from './useCandleChartEffects';
import { useCandleChartUtils } from './useCandleChartUtils';
import { IChartApi, ISeriesApi } from 'lightweight-charts';

export const useCandleChart = (
    data,
    predictData
) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);  
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const predictionSeriesRefL = useRef<ISeriesApi<'Line' | 'Custom'>>(null);
  const predictionSeriesRefS = useRef<ISeriesApi<'Line' | 'Custom'>>(null);
  const predictionSeriesRefR = useRef<ISeriesApi<'Line' | 'Custom'>>(null);
  const utils = useCandleChartUtils();
  const effects = useCandleChartEffects(data,
    chartContainerRef,
    chartRef,
    candleSeriesRef,
    ema20SeriesRef,
    ema50SeriesRef,
    ema200SeriesRef,
    utils,
    predictionSeriesRefL,
    predictionSeriesRefR,
    predictionSeriesRefS,
    predictData);
  return {
    chartContainerRef: chartContainerRef
  };
};