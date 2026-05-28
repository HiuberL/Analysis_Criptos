// src/renderer/src/components/shared/CandleChart.tsx
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, IChartApi, ISeriesApi } from 'lightweight-charts';

// Función robusta para calcular EMA
const calculateEMA = (data: number[], period: number) => {
  let ema: (number | null)[] = new Array(data.length).fill(null);
  let k = 2 / (period + 1);
  
  if (data.length < period) return ema;

  // EMA inicial: SMA simple de los primeros 'period' datos
  let sum = data.slice(0, period).reduce((a, b) => a + b, 0);
  ema[period - 1] = sum / period;

  for (let i = period; i < data.length; i++) {
    ema[i] = data[i] * k + (ema[i - 1] as number) * (1 - k);
  }
  return ema;
};

export const CandleChart = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Referencias mutables para mantener las instancias vivas sin renderizados extra
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // 1. EFECTO: Crear e inicializar el gráfico UNA SOLA VEZ al montar el componente
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#161a1e' }, textColor: '#d1d4dc' },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: { vertLines: { color: '#2b3139' }, horzLines: { color: '#2b3139' } },
      rightPriceScale: {
        visible: true,
      },
      timeScale: {
        rightOffset: 12,    // Deja 12 velas de espacio libre a la derecha
        barSpacing: 10,     // Ajusta el zoom inicial
        fixLeftEdge: false,
        fixRightEdge: false, // IMPORTANTE: Al quitar el "pegado" rígido, el scroll respeta al usuario
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

    // Añadir las series para las medias móviles
    const ema20Series = chart.addSeries(LineSeries, { color: '#F0B90B', lineWidth: 2, title: 'EMA 20' });
    const ema50Series = chart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 2, title: 'EMA 50' });
    const ema200Series = chart.addSeries(LineSeries, { color: '#FF00FF', lineWidth: 2, title: 'EMA 200' });

    // Guardar las instancias en las referencias permanentes
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;
    ema200SeriesRef.current = ema200Series;

    // Manejar el redimensionamiento del panel
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.resize(chartContainerRef.current.clientWidth, 400);
      }
    };
    window.addEventListener('resize', handleResize);

    // Limpieza al desmontar (solo destruye el gráfico cuando cierras o cambias de vista)
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []); // Array vacío = No se destruye al actualizar precios


  // 2. EFECTO: Actualizar datos de forma inteligente manteniendo la posición
  useEffect(() => {
    // Validar que las instancias ya estén listas y contengan información
    if (!candleSeriesRef.current || !data || data.length === 0) return;

    // Formatear tiempos y cierres
    const closePrices = data.map(item => parseFloat(item.close));
    const times = data.map(item => (typeof item.time === 'number' ? item.time : parseInt(item.time)) / 1000);

    // Calcular los vectores de medias móviles
    const ema20Data = calculateEMA(closePrices, 20);
    const ema50Data = calculateEMA(closePrices, 50);
    const ema200Data = calculateEMA(closePrices, 200);

    // Mapear los datos completos del historial
    const formattedCandles = data.map((item, i) => ({
      time: times[i], open: parseFloat(item.open), high: parseFloat(item.high), low: parseFloat(item.low), close: parseFloat(item.close)
    }));

    const formattedEma20 = times.map((t, i) => ({ time: t, value: ema20Data[i] })).filter(d => d.value !== null);
    const formattedEma50 = times.map((t, i) => ({ time: t, value: ema50Data[i] })).filter(d => d.value !== null);
    const formattedEma200 = times.map((t, i) => ({ time: t, value: ema200Data[i] })).filter(d => d.value !== null);

    // Comprobar si es el primer renderizado de datos de la moneda actual
    if (candleSeriesRef.current.data.length === 0) {
      // Carga inicial del set completo de datos
      candleSeriesRef.current.setData(formattedCandles);
      ema20SeriesRef.current?.setData(formattedEma20 as any);
      ema50SeriesRef.current?.setData(formattedEma50 as any);
      ema200SeriesRef.current?.setData(formattedEma200 as any);

      // Solo va al tiempo real la primera vez que se carga el mercado
      chartRef.current?.timeScale().scrollToRealTime();
    } else {
      // ¡Solución al Reset! Si ya hay historial cargado, tomamos únicamente la última vela recibida.
      // `.update()` modificará los valores actuales si la vela no ha cerrado, o creará la nueva barra.
      const lastIndex = formattedCandles.length - 1;

      candleSeriesRef.current.update(formattedCandles[lastIndex]);

      // Hacer lo mismo para las EMAs respectivas en tiempo real
      const lastEma20 = formattedEma20[formattedEma20.length - 1];
      if (lastEma20) ema20SeriesRef.current?.update(lastEma20 as any);

      const lastEma50 = formattedEma50[formattedEma50.length - 1];
      if (lastEma50) ema50SeriesRef.current?.update(lastEma50 as any);

      const lastEma200 = formattedEma200[formattedEma200.length - 1];
      if (lastEma200) ema200SeriesRef.current?.update(lastEma200 as any);
    }
  }, [data]); // Solo actualiza datos y líneas sin parpadear ni desplazar la escala

  return <div ref={chartContainerRef} style={{ width: '100%', position: 'relative' }} />;
};