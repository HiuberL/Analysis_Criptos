import React, { useState, useEffect } from 'react';
import styles from '@styles/Simulator.module.css';
import { useFavorites } from '@renderer/hooks/Favorites/useFavorites';
import { DashboardLayout } from '../DashBoard.Layout';
import { Loading } from '../shared/Loading';
import { useFavoritesSimulator } from '@renderer/hooks/FavoritesSimulator/useFavoritesSimulator';

export const FavoritesSimulator: React.FC = () => {
  const { favorites, loadSymbols, rawSymbols, loading, setLoading } = useFavorites();
  const {
    isRunning,
    handleStartGlobalSimulation,
    handleResetGlobalSimulation,
    getCurrentMarketPrice,
    simulation,
    handleCustomAmountChange,
    handleCustomPriceChange,
    customMarketPrices,
    customAmounts
  } = useFavoritesSimulator(
    setLoading,
    loadSymbols,
    rawSymbols,
    favorites,
    
  );

  // Manejadores para actualizar los diccionarios por cada moneda

  // Spinner de seguridad si la lista está vacía en el primer milisegundo
  if (loading && (!rawSymbols || rawSymbols.length === 0)) {
    return (
      <Loading message='Cargando Información'></Loading>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.simulatorContainer}>
        
        {/* Encabezado Unificado */}
        <div className={styles.simulatorHeader}>
          <div className={styles.titleArea}>
            <h2>Simulador Estático de Favoritos</h2>
            <p>Fija una inversión única para cada una de tus monedas o evalúa el bloque manualmente.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {!isRunning ? (
              <div className={styles.actionForm} style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleStartGlobalSimulation} className={styles.playButton}>
                  ▶ Iniciar Bloque
                </button>
              </div>
            ) : (
              <button onClick={handleResetGlobalSimulation} className={styles.resetButton} style={{ width: 'auto', padding: '10px 20px' }}>
                ⏹ Detener / Limpiar Simulación
              </button>
            )}

            <button
              onClick={async () => {
                setLoading(true);
                await loadSymbols();
                setLoading(false);
              }}
              className={styles.refreshButton}
            >
              {loading ? "🔄 Sincronizando..." : "🔄 Refrescar Precios Mercado"}
            </button>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className={styles.noData}>
            No tienes criptomonedas agregadas a tus favoritos todavía.
          </div>
        ) : (
          /* Grid de Cards */
          <div className={styles.cardsGrid}>
            {favorites.map((symbol) => {
              const realMarketPrice = getCurrentMarketPrice(symbol);
              const entryPrice = simulation.entryPrices[symbol] || 0;
              const investment = simulation.investmentPerCoin[symbol]||0;
              let pnl = 0;
              let pnlPercent = 0;
              let currentAssetValue = investment;
              if (isRunning && entryPrice > 0) {
                const tokensComprados = investment / entryPrice;
                currentAssetValue = tokensComprados * realMarketPrice;
                pnl = currentAssetValue - investment;
                pnlPercent = investment > 0 ? (pnl / investment) * 100 : 0;
              }

              const isWinner = pnl >= 0;
              const cardClass = `${styles.cryptoCard} ${isRunning ? (isWinner ? styles.cardWinner : styles.cardLoser) : ''}`;

              return (
                <div key={symbol} className={cardClass}>
                  <div className={styles.cardTop}>
                    <span className={styles.symbolName}>{symbol}</span>
                    <span className={styles.basePrice}>
                      Mercado Real: {realMarketPrice > 0 ? `$${realMarketPrice.toFixed(8)}` : "Cargando..."}
                    </span>
                  </div>

                  {/* Inputs modificables mostrados únicamente ANTES de iniciar la simulación */}
                  {!isRunning ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#848e9c' }}>Inversión Individual (USD):</label>
                        <input
                          type="number"
                          value={customAmounts[symbol] || ''}
                          onChange={(e) => handleCustomAmountChange(symbol, e.target.value)}
                          style={{
                            backgroundColor: '#1e2329',
                            color: '#eaecef',
                            border: '1px solid #2b3139',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            fontSize: '13px'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#848e9c' }}>Modificar Precio Mercado Inicial (USD):</label>
                        <input
                          type="number"
                          placeholder={`Actual: $${realMarketPrice.toFixed(8)}`}
                          value={customMarketPrices[symbol] || ''}
                          onChange={(e) => handleCustomPriceChange(symbol, e.target.value)}
                          style={{
                            backgroundColor: '#1e2329',
                            color: '#eaecef',
                            border: '1px solid #2b3139',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Vista de Resultados en Simulación Activa */
                    <div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Precio de Entrada:</span>
                        <span className={styles.infoValue}>
                          {entryPrice > 0 ? `$${entryPrice.toFixed(8)}` : '---'}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Inversión Utilizada:</span>
                        <span className={styles.infoValue}>${investment.toFixed(8)}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Precio Mercado:</span>
                        <span className={styles.infoValue}>${realMarketPrice.toFixed(8)}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Valoración Manual:</span>
                        <span className={styles.infoValue}>${currentAssetValue.toFixed(8)}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Ganancia:</span>
                        <span className={styles.infoValue}>${pnl.toFixed(8)}</span>
                      </div>
                      <hr className={styles.divider} />

                      <div className={`${styles.statusBadge} ${isWinner ? styles.badgeWinner : styles.badgeLoser}`}>
                        {isWinner ? '🏆 GANADOR' : '📉 PERDEDOR'} 
                        <span style={{ marginLeft: '8px' }}>
                          {isWinner ? '+' : ''}{pnlPercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};