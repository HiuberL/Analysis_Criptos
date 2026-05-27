// src/renderer/src/components/TradeInfoPanel.tsx
import React from 'react';
import styles from '@styles/shared/TradeInfoPanel.module.css';


interface TradeInfoProps {
  levels: {
    entryPrice: number;
    stopLossC: number;
    takeProfitC: number;
    stopLossV: number;
    takeProfitV: number;
} | null;
}

// En tu TradeInfoPanel.tsx
export const TradeInfoPanel: React.FC<TradeInfoProps> = ({ levels }) => {
  if (!levels) return <div className={styles.panelEmpty}>Esperando señal...</div>;

  return (
<div className={styles.tradingRow}>
    {/* Izquierda: Precio Fijo */}
    <div className={styles.entrySide}>
        <span>Entrada: </span>
        <strong>{levels.entryPrice.toFixed(8)}</strong>
    </div>

    {/* Derecha: Grid de 4 valores */}
    <div className={styles.levelsGrid}>
        <div className={styles.levelBox}>
            <span>SL Compra</span>
            <strong className={styles.slText}>{levels.stopLossC.toFixed(8)}</strong>
        </div>
        <div className={styles.levelBox}>
            <span>TP Compra</span>
            <strong className={styles.tpText}>{levels.takeProfitC.toFixed(8)}</strong>
        </div>
        <div className={styles.levelBox}>
            <span>SL Venta</span>
            <strong className={styles.slText}>{levels.stopLossV.toFixed(8)}</strong>
        </div>
        <div className={styles.levelBox}>
            <span>TP Venta</span>
            <strong className={styles.tpText}>{levels.takeProfitV.toFixed(8)}</strong>
        </div>
    </div>
</div>
  );
};