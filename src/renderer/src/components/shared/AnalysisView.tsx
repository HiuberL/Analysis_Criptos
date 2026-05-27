// src/renderer/src/shared/AnalysisView.tsx

import React, { useEffect, useRef, useState } from 'react';
import styles from '@styles/shared/AnalysisView.module.css';
import { SubLoading } from './SubLoading';
import { fetchKlines, subscribeToKlines } from '@renderer/services/binance-api.services';
import { AnalysisResult, calculateTrend } from '@renderer/utils/AnalisisResult';
import { CandleChart } from './CandleChart';
import { TradeInfoPanel } from '../shared/TradeInfo';
import { getTradeLevels } from '../../utils/Indicators';

interface AnalysisViewProps {
  symbol: string;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ symbol }) => {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [rawKlines, setRawKlines] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<'1h' | '1d' | '1M'>('1h');
  const unsubscribeRef = useRef<(() => void) | null>(null);
 
  useEffect(() => {
    let active = true; // Flag para controlar si este efecto sigue vigente
    let unsubscribe: () => void;

    const init = async () => {
      setLoading(true);
      
      // 1. Obtener histórico
      
      const historicalKlines = await fetchKlines(symbol, timeframe, 500);
      
      // Si el usuario cambió de símbolo mientras esperábamos, no hacemos nada
      if (!active) return; 

      setRawKlines(historicalKlines);
      
      // 2. Suscribirse
      unsubscribe = subscribeToKlines(symbol, timeframe, historicalKlines, (updatedKlines) => {
        // Solo actualizamos si el efecto sigue activo
        if (active) {
          setRawKlines(updatedKlines);
          const result = calculateTrend(updatedKlines);
          setData(result);
          setLoading(false);
        }
      });
    };

    // Limpiar estados antes de iniciar
    setRawKlines([]); 
    setData(null);
    
    init();

    return () => {
      active = false; // Marcamos esta ejecución como inactiva
      if (unsubscribe) unsubscribe(); // Cerramos el socket de esta ejecución
    };
  }, [symbol, timeframe]);

  // Cálculo de los niveles para el panel
  // Usamos los datos calculados en calculateTrend
  const tradeLevels = data ? getTradeLevels(data.lastPrice || 0, data.atr || 0) : null;

  if (loading) return <SubLoading message={`Analizando ${symbol} (${timeframe})...`} />;
  if (!data) return <p className={styles.message}>No hay datos suficientes para analizar {symbol}.</p>;

  // Funciones auxiliares
  const getRsiColorClass = (rsi: number) => {
    if (rsi < 30) return styles.textGreen;
    if (rsi > 70) return styles.textRed;
    return styles.textNeutral;
  };

  const getTrendColor = (percentage: number) => {
    if (percentage >= 60) return '#0ECB81';
    if (percentage <= 40) return '#F6465D';
    return '#F0B90B';
  };

  const trendColor = getTrendColor(data.bullishPercentage);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>{symbol}</h2>
        
        <div className={styles.timeframeSelector}>
          <button className={timeframe === '1h' ? styles.active : ''} onClick={() => setTimeframe('1h')}>1H</button>
          <button className={timeframe === '1d' ? styles.active : ''} onClick={() => setTimeframe('1d')}>1D</button>
          <button className={timeframe === '1M' ? styles.active : ''} onClick={() => setTimeframe('1M')}>1M</button>
        </div>
      </div>

      <div className={styles.chartWrapper} style={{ marginBottom: '20px', height: '400px' }}>
        <CandleChart data={rawKlines} />
      </div>

      {/* Panel integrado */}
      <TradeInfoPanel levels={tradeLevels} />

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>RSI (14)</div>
          <div className={`${styles.cardValue} ${getRsiColorClass(data.rsi)}`}>
            {data.rsi.toFixed(2)}
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardLabel}>Tendencia (EMA 20/50/200)</div>
          <div className={`${styles.cardValue} ${styles.textNeutral}`}>
            {data.bullishPercentage > 50 ? 'Alcista' : 'Bajista'}
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardLabel}>MACD (Impulso)</div>
          <div className={`${styles.cardValue} ${data.bullishPercentage > 50 ? styles.textGreen : styles.textRed}`}>
            {data.bullishPercentage > 50 ? 'Positivo' : 'Negativo'}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Probabilidad Alcista Global</span>
          <span className={styles.progressValue} style={{ color: trendColor }}>
            {data.trend} ({data.bullishPercentage}%)
          </span>
        </div>
        
        <div className={styles.progressTrack}>
          <div 
            className={styles.progressFill}
            style={{ 
              width: `${data.bullishPercentage}%`, 
              backgroundColor: trendColor
            }} 
          />
        </div>
      </div>
    </div>
  );
};