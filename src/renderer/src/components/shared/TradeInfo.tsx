// src/renderer/src/components/TradeInfoPanel.tsx
import React from 'react';
import styles from '@styles/shared/TradeInfoPanel.module.css';
import { RiskEvaluate, SupportResistanceLevels } from '@renderer/interfaces/indicators.interface';

interface TradeInfoProps {
  // Parámetros calculados para la orden de trading
  levels: {
    entryPrice: number;
    stopLossC: number;
    takeProfitC: number;
    stopLossV: number;
    takeProfitV: number;
  } | null | any;

  // Valores crudos de los pivotes calculados en el gráfico
  technicalLevels: SupportResistanceLevels;
  scoreRisk: RiskEvaluate;
  whaleTrack: number;
  whaleFuture: any;
  veredict: any;
  globalTrack: any
}

export const TradeInfoPanel: React.FC<TradeInfoProps> = ({ levels, technicalLevels, scoreRisk, whaleTrack, whaleFuture, veredict, globalTrack }) => {
  if (!levels || !scoreRisk || !levels.entryPrice) {
    return <div className={styles.panelEmpty}>Esperando señal de mercado...</div>;
  }
  const labelText = scoreRisk.label || "Analizando...";
  const labelColor = scoreRisk.color || "#faad14";
  const totalPoints = scoreRisk.score?.total !== undefined ? scoreRisk.score.total : 0;
  const labelWhale = scoreRisk.score.breakdown[4].value;
  const globalTrackData = Number((globalTrack.long- globalTrack.short).toFixed(2));
  return (
    <div className={styles.panelContainer}>

      {/* 1. SECCIÓN DE ESTADO PRINCIPAL */}
      <div className={styles.topRow}>
        <div className={styles.entrySide}>
          <span>Precio Entrada</span>
          <strong>{Number(levels.entryPrice).toFixed(8)}</strong>
        </div>

        <div className={styles.statusBox} style={{ borderLeft: `4px solid ${labelColor}` }}>
          <span style={{ color: labelColor, fontWeight: '700', fontSize: '12px' }}>Centro de decisión</span>
          <div className={styles.statusBoxData}>
            <strong style={{ marginTop: '5px', fontSize: '14px', fontWeight: 'bold' }}>{labelText} ({totalPoints} pts)</strong>
            <strong style={{ marginTop: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              {whaleFuture > 0 ? (
                <span style={{ color: '#02c076' }}>🟢 Ballenas Comprando (Acumulan Longs: +{whaleFuture}%)</span>
              ) : whaleFuture < 0 ? (
                <span style={{ color: '#f6465d' }}>🔴 Ballenas Vendiendo (Acumulan Shorts: {whaleFuture}%)</span>
              ) : (
                <span style={{ color: '#f0b90b' }}>🟡 Ballenas en Neutro (Ratios equilibrados)</span>
              )}
            </strong>
            <strong style={{ marginTop: '5px', fontSize: '14px', fontWeight: 'bold' }}>{whaleTrack > 0 ? (
              <span >🟢 (${whaleTrack.toFixed(2)})</span>
            ) : whaleTrack < 0 ? (
              <span>🔴 (${whaleTrack.toFixed(2)})</span>
            ) : (
              <span>🟡 (${whaleTrack.toFixed(2)})</span>
            )} / {labelWhale}</strong>

            <strong style={{ marginTop: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              <span style={{ color: veredict.color }}>{veredict.verdict} ({veredict.power}%)</span>
            </strong>
            <div></div>
            <strong style={{ marginTop: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              {globalTrackData > 0 ? (
                <span style={{ color: '#02c076' }}>🟢 Futuros Globales: +{globalTrackData}%</span>
              ) : globalTrackData < 0 ? (
                <span style={{ color: '#f6465d' }}>🔴 Futuros Globales {globalTrackData}%</span>
              ) : (
                <span style={{ color: '#f0b90b' }}>🟡 Futuros Globales {globalTrackData}%</span>
              )}
            </strong>

          </div>
        </div>
      </div>

      {/* 2. OBJETIVOS DE PRECIO DEL CANAL (Lo que necesitabas ver: S1, S2, R1, R2) */}
      <div className={styles.containerInformationSection}>
        {technicalLevels && (
          <div className={styles.technicalSection}>
            <div className={styles.gridTitle}>Canal Técnico de Soportes y Resistencias:</div>
            <div className={styles.techRowGrid}>
              <div className={`${styles.techBox} ${styles.support}`}>
                <span>Soporte 2 (Crítico)</span>
                <strong>{Number(technicalLevels.support2).toFixed(8)}</strong>
              </div>
              <div className={`${styles.techBox} ${styles.support}`}>
                <span>Soporte 1 (Suelo)</span>
                <strong>{Number(technicalLevels.support1).toFixed(8)}</strong>
              </div>
              <div className={`${styles.techBox} ${styles.resistance}`}>
                <span>Resistencia 1 (Techo)</span>
                <strong>{Number(technicalLevels.resistance1).toFixed(8)}</strong>
              </div>
              <div className={`${styles.techBox} ${styles.resistance}`}>
                <span>Resistencia 2 (Extrema)</span>
                <strong>{Number(technicalLevels.resistance2).toFixed(8)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* 3. PARÁMETROS OPERATIVOS DE ORDEN (SL / TP) */}
        <div className={styles.technicalSection}>
          <div className={styles.gridTitle}>Niveles de Salida de la Orden:</div>
          <div className={styles.levelsGrid}>
            <div className={styles.levelBox}>
              <span>SL Compra</span>
              <strong className={styles.slText}>{Number(levels.stopLossC).toFixed(8)}</strong>
            </div>
            <div className={styles.levelBox}>
              <span>TP Compra</span>
              <strong className={styles.tpText}>{Number(levels.takeProfitC).toFixed(8)}</strong>
            </div>
            <div className={styles.levelBox}>
              <span>SL Venta</span>
              <strong className={styles.slText}>{Number(levels.stopLossV).toFixed(8)}</strong>
            </div>
            <div className={styles.levelBox}>
              <span>TP Venta</span>
              <strong className={styles.tpText}>{Number(levels.takeProfitV).toFixed(8)}</strong>
            </div>
          </div>
        </div>
      </div>
      {/* 4. AUDITORÍA EXPLICATIVA (Métricas del algoritmo) */}


    </div>
  );
};