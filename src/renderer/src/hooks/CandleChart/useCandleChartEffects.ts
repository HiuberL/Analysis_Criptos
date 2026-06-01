import { useEffect, useCallback } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, LineStyle } from 'lightweight-charts';
import { useCandleChartUtils } from './useCandleChartUtils';
import { MultipleProjections} from '@renderer/interfaces/indicators.interface';

export const useCandleChartEffects = (
  data: any,
  chartContainerRef: any,
  chartRef: any,
  candleSeriesRef: any,
  ema20SeriesRef: any,
  ema50SeriesRef: any,
  ema200SeriesRef: any,
  utils: ReturnType<typeof useCandleChartUtils>,
  predictionSeriesRefL: any,
  predictionSeriesRefR: any,
  predictionSeriesRefS: any,
  predictionData?: MultipleProjections
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
        rightOffset: 15, // Aumentamos levemente para dar más aire visual a los períodos proyectados hacia el futuro
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

    // 🌟 CORRECCIÓN CRÍTICA: Instanciar la serie de predicción dentro del constructor del gráfico
    const predictionSeriesL = chart.addSeries(LineSeries, {
      color: '#F3BA2F',            // Amarillo Binance
      lineWidth: 4,
      lineStyle: LineStyle.Dotted, // Línea punteada para denotar que es una estimación futura
      title: 'Proyección KPI C',
    });

    const predictionSeriesR = chart.addSeries(LineSeries, {
      color: '#2ff339',            // Amarillo Binance
      lineWidth: 4,
      lineStyle: LineStyle.Dotted, // Línea punteada para denotar que es una estimación futura
      title: 'Proyección KPI R',
    });

    const predictionSeriesS = chart.addSeries(LineSeries, {
      color: '#742ff3',            // Amarillo Binance
      lineWidth: 4,
      lineStyle: LineStyle.Dotted, // Línea punteada para denotar que es una estimación futura
      title: 'Proyección KPI S',
    });


    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;
    ema200SeriesRef.current = ema200Series;
    predictionSeriesRefL.current = predictionSeriesL; // Guardamos la referencia persistente
    predictionSeriesRefS.current = predictionSeriesS; // Guardamos la referencia persistente
    predictionSeriesRefR.current = predictionSeriesR; // Guardamos la referencia persistente

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
      predictionSeriesRefL.current = null; // Limpieza defensiva del puntero
      predictionSeriesRefR.current = null; // Limpieza defensiva del puntero
      predictionSeriesRefS.current = null; // Limpieza defensiva del puntero

    };
  }, []);

  const updateChartCandle = useCallback(() => {
    // Si las series básicas no están inicializadas o no hay datos, retenemos la ejecución
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

    // Renderizado por discriminación WebSocket (Ticks en curso vs Historicos)
    if (data.length <= 2 || (data[data.length - 1] && data[data.length - 1].isFinal === false)) {
      const lastIndex = formattedCandles.length - 1;
      candleSeriesRef.current.update(formattedCandles[lastIndex]);
      const lastEma20 = formattedEma20[formattedEma20.length - 1];
      if (lastEma20) ema20SeriesRef.current?.update(lastEma20 as any);

      const lastEma50 = formattedEma50[formattedEma50.length - 1];
      if (lastEma50) ema50SeriesRef.current?.update(lastEma50 as any);

      const lastEma200 = formattedEma200[formattedEma200.length - 1];
      if (lastEma200) ema200SeriesRef.current?.update(lastEma200 as any);
    } else {
      candleSeriesRef.current.setData(formattedCandles);
      ema20SeriesRef.current?.setData(formattedEma20 as any);
      ema50SeriesRef.current?.setData(formattedEma50 as any);
      ema200SeriesRef.current?.setData(formattedEma200 as any);
    }
    // 🌟 ACTUALIZACIÓN SÍNCRONA DE LA PROYECCIÓN DENTRO DEL RENDER LOOP
    if (predictionSeriesRefL.current) {
      if (predictionData?.chartista && predictionData.chartista.length > 0) {
        predictionSeriesRefL.current.setData(predictionData.chartista);
      } else {
        predictionSeriesRefL.current.setData([]);
      }
    }
    if (predictionSeriesRefR.current) {
      if (predictionData?.realista && predictionData.realista.length > 0) {
        predictionSeriesRefR.current.setData(predictionData.realista);
      } else {
        predictionSeriesRefR.current.setData([]);
      }
    }
    if (predictionSeriesRefS.current) {
      if (predictionData?.sentimental && predictionData.sentimental.length > 0) {
        predictionSeriesRefS.current.setData(predictionData.sentimental);
      } else {
        predictionSeriesRefS.current.setData([]);
      }
    }


  }, [data, calculateEMA, predictionData]); // Se añade predictionData como dependencia del cálculo estable

  // EFECTO 1: Inicialización estructural (Gráfico nativo)
  useEffect(() => {
    const cleanup = createChartCandle();
    return () => {
      if (cleanup) cleanup();
    };
  }, [createChartCandle]);

  // EFECTO 2: Observador reactivo de datos en tiempo real
  useEffect(() => {
    updateChartCandle();
  }, [data, updateChartCandle]); 

  return { createChartCandle, updateChartCandle };
};