import { useEffect, useCallback } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { useCandleChartUtils } from './useCandleChartUtils';

export const useCandleChartEffects = (
  data: any,
  chartContainerRef: any,
  chartRef: any,
  candleSeriesRef: any,
  ema20SeriesRef: any,
  ema50SeriesRef: any,
  ema200SeriesRef: any,
  utils: ReturnType<typeof useCandleChartUtils>
) => {
  const { calculateEMA } = utils;

  const createChartCandle = useCallback(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#161a1e' }, textColor: '#d1d4dc' },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: { vertLines: { color: '#2b3139' }, horzLines: { color: '#2b3139' } },
      rightPriceScale: { visible: true },
      timeScale: {
        rightOffset: 12,
        barSpacing: 10,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, { upColor: '#0ECB81', downColor: '#F6465D' });

    candleSeries.applyOptions({
      priceFormat: {
        type: 'price',
        precision: 8,
        minMove: 0.00000001,
      },
    });

    const ema20Series = chart.addSeries(LineSeries, { color: '#F0B90B', lineWidth: 2, title: 'EMA 20' });
    const ema50Series = chart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 2, title: 'EMA 50' });
    const ema200Series = chart.addSeries(LineSeries, { color: '#FF00FF', lineWidth: 2, title: 'EMA 200' });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;
    ema200SeriesRef.current = ema200Series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.resize(chartContainerRef.current.clientWidth, 400);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      ema20SeriesRef.current = null;
      ema50SeriesRef.current = null;
      ema200SeriesRef.current = null;
    };
  }, []);

  const updateChartCandle = useCallback(() => {
    // Si las series no están inicializadas o no hay datos, no hacemos nada
    if (!candleSeriesRef.current || !data || data.length === 0) return;

    const closePrices = data.map((item: any) => parseFloat(item.close));
    const times = data.map((item: any) => (typeof item.time === 'number' ? item.time : parseInt(item.time)) / 1000);

    const ema20Data = calculateEMA(closePrices, 20);
    const ema50Data = calculateEMA(closePrices, 50);
    const ema200Data = calculateEMA(closePrices, 200);

    const formattedCandles = data.map((item: any, i: number) => ({
      time: times[i],
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close)
    }));

    const formattedEma20 = times.map((t: any, i: number) => ({ time: t, value: ema20Data[i] })).filter(d => d.value !== null);
    const formattedEma50 = times.map((t: any, i: number) => ({ time: t, value: ema50Data[i] })).filter(d => d.value !== null);
    const formattedEma200 = times.map((t: any, i: number) => ({ time: t, value: ema200Data[i] })).filter(d => d.value !== null);

    // CORRECCIÓN DE DETECCIÓN: Comprobamos de forma segura si la serie está vacía en lightweight-charts
    // Usar setData() si es el primer bloque pesado de datos históricos, o si el WebSocket nos envía una actualización continua
    // Si estás manejando un array "rawKlines" del WebSocket que crece en tamaño, el enfoque óptimo para sincronizar es pasarle el bloque completo,
    // o discriminar basándonos en si la última vela es un tick en tiempo real o no finalizado (isFinal).
    // Para simplificar y asegurar que se refresque sin duplicados, le inyectamos .setData completo si es una carga de cambio de moneda o recarga general
    
    // Si deseas rendimiento fluido en tiempo real sin redibujar todo el historial cada segundo:
    if (data.length <= 2 || (data[data.length - 1] && data[data.length - 1].isFinal === false)) {
      // Es un tick de WebSocket en tiempo real de la vela actual en desarrollo -> Hacemos .update()
      const lastIndex = formattedCandles.length - 1;
      candleSeriesRef.current.update(formattedCandles[lastIndex]);

      const lastEma20 = formattedEma20[formattedEma20.length - 1];
      if (lastEma20) ema20SeriesRef.current?.update(lastEma20 as any);

      const lastEma50 = formattedEma50[formattedEma50.length - 1];
      if (lastEma50) ema50SeriesRef.current?.update(lastEma50 as any);

      const lastEma200 = formattedEma200[formattedEma200.length - 1];
      if (lastEma200) ema200SeriesRef.current?.update(lastEma200 as any);
    } else {
      // Es la carga histórica inicial o una vela que acaba de cerrar definitivamente -> Volcamos el set completo
      candleSeriesRef.current.setData(formattedCandles);
      ema20SeriesRef.current?.setData(formattedEma20 as any);
      ema50SeriesRef.current?.setData(formattedEma50 as any);
      ema200SeriesRef.current?.setData(formattedEma200 as any);
    }

  }, [data, calculateEMA]);

  // EFECTO 1: Inicialización del gráfico (Una sola vez al montar el componente)
  useEffect(() => {
    const cleanup = createChartCandle();
    return () => {
      if (cleanup) cleanup();
    };
  }, [createChartCandle]);

  // EFECTO 2: ¡AQUÍ ESTÁ EL CAMBIO CRÍTICO! 
  // Escucha cambios en 'data' para inyectarle los nuevos precios al gráfico en tiempo real
  useEffect(() => {
    updateChartCandle();
  }, [data, updateChartCandle]); 

  return { createChartCandle, updateChartCandle };
};