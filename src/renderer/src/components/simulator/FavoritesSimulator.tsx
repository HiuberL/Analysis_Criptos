import React, { useState, useEffect } from 'react';
import styles from '@styles/Simulator.module.css';
import { useFavorites } from '@renderer/hooks/Favorites/useFavorites';
import { DashboardLayout } from '../DashBoard.Layout';
import { Loading } from '../shared/Loading';

interface GlobalSimulation {
  investmentPerCoin: number;
  entryPrices: { [symbol: string]: number };
  status: 'idle' | 'running';
}

export const FavoritesSimulator: React.FC = () => {
  // 🌟 Consumimos 'rawSymbols' que viene directo del estado crudo del hook
  const { favorites, loadSymbols, rawSymbols, loading, setLoading } = useFavorites();
  
  const [globalAmount, setGlobalAmount] = useState<string>('');
  
  const [simulation, setSimulation] = useState<GlobalSimulation>(() => {
    const saved = localStorage.getItem("crypto_global_simulation");
    return saved ? JSON.parse(saved) : { investmentPerCoin: 0, entryPrices: {}, status: 'idle' };
  });

  // Carga inicial obligatoria al montar la pantalla del Simulador
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        await loadSymbols(); // Descarga de Binance
      } catch (error) {
        console.error("Error al cargar precios en simulador:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  useEffect(() => {
    localStorage.setItem("crypto_global_simulation", JSON.stringify(simulation));
  }, [simulation]);

  // Extracción de precio buscando en la lista cruda (rawSymbols)
  const getCurrentMarketPrice = (symbol: string): number => {
    if (!rawSymbols || rawSymbols.length === 0) return 0;

    const coin = rawSymbols.find((s) => s.symbol === symbol);
    if (coin) {
      // Mapeo defensivo de propiedades según useFavoritesState
      const targetPrice = coin.lastPrice || coin.price || coin.closePrice;
      return targetPrice ? parseFloat(targetPrice) : 0;
    }
    return 0;
  };

  const handleStartGlobalSimulation = () => {
    const amount = parseFloat(globalAmount);
    if (amount <= 0 || isNaN(amount)) {
      alert("Por favor introduce un monto válido mayor a 0.");
      return;
    }

    const pricesSnapshot: { [symbol: string]: number } = {};
    let missingPrices = false;

    favorites.forEach((symbol) => {
      const price = getCurrentMarketPrice(symbol);
      if (price === 0) missingPrices = true;
      pricesSnapshot[symbol] = price;
    });

    if (missingPrices && favorites.length > 0) {
      alert("⚠️ Los precios del mercado se están actualizando. Espera un segundo.");
      return;
    }

    setSimulation({
      investmentPerCoin: amount,
      entryPrices: pricesSnapshot,
      status: 'running'
    });
  };

  const handleResetGlobalSimulation = () => {
    setSimulation({
      investmentPerCoin: 0,
      entryPrices: {},
      status: 'idle'
    });
    setGlobalAmount('');
  };

  const isRunning = simulation.status === 'running';

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
            <p>Fija una inversión única para cada una de tus monedas y evalúa el bloque manualmente.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {!isRunning ? (
              <div className={styles.actionForm} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Monto por moneda (USD)"
                  value={globalAmount}
                  onChange={(e) => setGlobalAmount(e.target.value)}
                  className={styles.amountInput}
                />
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
              const currentPrice = getCurrentMarketPrice(symbol);
              const entryPrice = simulation.entryPrices[symbol] || 0;
              const investment = simulation.investmentPerCoin;

              let pnl = 0;
              let pnlPercent = 0;
              let currentAssetValue = investment;

              if (isRunning && entryPrice > 0) {
                const tokensComprados = investment / entryPrice;
                currentAssetValue = tokensComprados * currentPrice;
                pnl = currentAssetValue - investment;
                pnlPercent = (pnl / investment) * 100;
              }

              const isWinner = pnl >= 0;
              const cardClass = `${styles.cryptoCard} ${isRunning ? (isWinner ? styles.cardWinner : styles.cardLoser) : ''}`;

              return (
                <div key={symbol} className={cardClass}>
                  <div className={styles.cardTop}>
                    <span className={styles.symbolName}>{symbol}</span>
                    <span className={styles.basePrice}>
                      Mercado: {currentPrice > 0 ? `$${currentPrice.toFixed(8)}` : "Cargando..."}
                    </span>
                  </div>

                  {!isRunning ? (
                    <div style={{ color: '#848e9c', fontSize: '13px', textAlign: 'center', padding: '15px 0' }}>
                      Esperando inicio de bloque...
                    </div>
                  ) : (
                    <div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Precio de Entrada:</span>
                        <span className={styles.infoValue}>
                          {entryPrice > 0 ? `$${entryPrice.toFixed(8)}` : '---'}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Inversión Fija:</span>
                        <span className={styles.infoValue}>${investment.toFixed(8)}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Valoración Manual:</span>
                        <span className={styles.infoValue}>${currentAssetValue.toFixed(8)}</span>
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