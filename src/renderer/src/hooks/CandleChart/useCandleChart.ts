// src/renderer/src/hooks/useAnalysisView.ts

import { useRef } from 'react';
import { useCandleChartEffects } from './useCandleChartEffects';
import { useCandleChartUtils } from './useCandleChartUtils';
import { IChartApi, ISeriesApi } from 'lightweight-charts';

export const useCandleChart = (
    data,
) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);  
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const utils = useCandleChartUtils();
  const effects = useCandleChartEffects(data,
    chartContainerRef,
    chartRef,
    candleSeriesRef,
    ema20SeriesRef,
    ema50SeriesRef,
    ema200SeriesRef,
    utils);
  return {
    chartContainerRef: chartContainerRef
  };
};