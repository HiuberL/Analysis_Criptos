import styles from '@styles/shared/AnalysisView.module.css';
import { SubLoading } from './SubLoading';
import { CandleChart } from './CandleChart';
import { TradeInfoPanel } from '../shared/TradeInfo';
import { useAnalysisView } from '@renderer/hooks/AnalysisView/useAnalysisView';
import { useWhaleTracker } from '@renderer/hooks/WhaleTracker/useWhaleTracker';

interface AnalysisViewProps {
  symbol: string;
}
export const AnalysisView: React.FC<AnalysisViewProps> = ({ symbol }) => {
  const {
    timeframe,
    loading,
    data,
    setTimeframe,
    rawKlines,
    tradeLevels,
    getRsiColorClass,
    trendColor,
    scoreRisk,
    pivotLevels,
    handleCopyBlog,
    whaleBuyVolume,
    whaleSellVolume,
    whaleTrack
  } = useAnalysisView(symbol,styles);

  if (loading) return <SubLoading message={`Analizando ${symbol} (${timeframe})...`} />;
  if (!data) return <p className={styles.message}>No hay datos suficientes para analizar {symbol}.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>{symbol}</h2>
        
        <div className={styles.timeframeSelector}>
          <button className={timeframe === '15m' ? styles.active : ''} onClick={() => setTimeframe('15m')}>15m</button>
          <button className={timeframe === '1h' ? styles.active : ''} onClick={() => setTimeframe('1h')}>1H</button>
          <button className={timeframe === '1d' ? styles.active : ''} onClick={() => setTimeframe('1d')}>1D</button>
          <button className={timeframe === '1M' ? styles.active : ''} onClick={() => setTimeframe('1M')}>1M</button>
          {/* BOTÓN NUEVO PARA COPIAR AL BLOG */}
          <button 
            className={styles.copyBlogButton} 
            onClick={handleCopyBlog}
            title="Copiar informe formateado para Blog"
          >
            📋 Copiar Informe
          </button>
        </div>
      </div>

      <div className={styles.chartWrapper} style={{ marginBottom: '20px', height: '400px' }}>
        <CandleChart data={rawKlines} />
      </div>

      {/* Panel integrado */}
      <TradeInfoPanel levels={tradeLevels} scoreRisk= {scoreRisk} technicalLevels={pivotLevels} whaleTrack={whaleBuyVolume-whaleSellVolume} whaleFuture={whaleTrack}/>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>RSI (14)</div>
          <div className={`${styles.cardValue} ${getRsiColorClass(data.rsi)}`}>
            {data.rsi.toFixed(3)}
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