// src/renderer/src/components/shared/CandleChart.tsx
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';

// Función robusta para calcular EMA
const calculateEMA = (data: number[], period: number) => {
  let ema: (number | null)[] = new Array(data.length).fill(null);
  let k = 2 / (period + 1);
  
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

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#161a1e' }, textColor: '#d1d4dc' },
      width: chartContainerRef.current.clientWidth,
      height: 400, // Un poco más alto para que quepan bien las 3 líneas
      grid: { vertLines: { color: '#2b3139' }, horzLines: { color: '#2b3139' } },
      rightPriceScale: {
        visible: true,
      },
      timeScale: {
        rightOffset: 12, // Deja 12 velas de espacio libre a la derecha
        barSpacing: 10,   // Ajusta el zoom inicial
        fixLeftEdge: false,
        fixRightEdge: true, // Esto es lo que mantiene "pegado" al último precio
      },
    });

    

    const candleSeries = chart.addSeries(CandlestickSeries, { upColor: '#0ECB81', downColor: '#F6465D' });

    candleSeries.applyOptions({
        priceFormat: {
            type: 'price',
            precision: 8, // Ajusta este número según la precisión que necesites
            minMove: 0.00000001,
        },
    });
    // Preparar datos
    const closePrices = data.map(item => parseFloat(item.close));
    const times = data.map(item => (typeof item.time === 'number' ? item.time : parseInt(item.time)) / 1000);

    // Calcular las 3 EMAs
    const ema20 = calculateEMA(closePrices, 20);
    const ema50 = calculateEMA(closePrices, 50);
    const ema200 = calculateEMA(closePrices, 200);

    // Crear las 3 series de líneas
    const seriesConfig = [
      { data: ema20, color: '#F0B90B', title: 'EMA 20' }, // Amarillo
      { data: ema50, color: '#2962FF', title: 'EMA 50' }, // Azul
      { data: ema200, color: '#FF00FF', title: 'EMA 200' } // Magenta/Fucsia para resaltar
    ];

    candleSeries.setData(data.map((item, i) => ({
      time: times[i], open: parseFloat(item.open), high: parseFloat(item.high), low: parseFloat(item.low), close: parseFloat(item.close)
    })));

    seriesConfig.forEach(cfg => {
      const lineSeries = chart.addSeries(LineSeries, { color: cfg.color, lineWidth: 2, title: cfg.title });
      lineSeries.setData(times.map((t, i) => ({ time: t, value: cfg.data[i] })).filter(d => d.value !== null));
    });

//    chart.timeScale().fitContent();
    chart.timeScale().scrollToRealTime();
    return () => chart.remove();
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: '100%' }} />;
};