import { useAnalysisViewState } from "./useAnalysisViewState";

export const useAnalisysViewUtils = (symbol,styles,state: ReturnType<typeof useAnalysisViewState>) => {
  const {data,scoreRisk,tradeLevels} = state;

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
  const currentPercentage = data?.bullishPercentage ?? 50;
  const trendColor = getTrendColor(currentPercentage);

  const handleCopyBlog = async () => {
    if (!data) return;

    const condicionMercado = scoreRisk?.label ?? 'N/A';
    const puntosScore = scoreRisk?.score !== undefined ? scoreRisk.score : 0;

    const textoBlog = `
    📊 **INFORME TÉCNICO AUTOMÁTICO: ${symbol}**
    ---
    📈 **Análisis de Tendencia Global:**
    • Probabilidad Alcista Global: ${data.bullishPercentage}% (${data.trend})
    • Indicador RSI (14): ${data.rsi.toFixed(3)}
    • Tendencia de EMAs: ${data.bullishPercentage > 50 ? '🟢 Alcista' : '🔴 Bajista'}
    • Impulso MACD: ${data.bullishPercentage > 50 ? '🟢 Positivo' : '🔴 Negativo'}

    🛡️ **Riesgo y Volatilidad:**
    • Condición del Mercado: ${condicionMercado} (Score de Caída: ${puntosScore} pts)

    🎯 **Niveles Operativos Sugeridos (ATR):**
    • Precio Base: $${tradeLevels?.entryPrice ? tradeLevels.entryPrice.toFixed(4) : '0.00'}
    • [COMPRA] Stop Loss: $${tradeLevels?.stopLossC ? tradeLevels.stopLossC.toFixed(4) : '0.00'}
    • [COMPRA] Take Profit: $${tradeLevels?.takeProfitC ? tradeLevels.takeProfitC.toFixed(4) : '0.00'}
    • [VENTA]  Stop Loss: $${tradeLevels?.stopLossV ? tradeLevels.stopLossV.toFixed(4) : '0.00'}
    • [VENTA]  Take Profit: $${tradeLevels?.takeProfitV ? tradeLevels.takeProfitV.toFixed(4) : '0.00'}

    _Generado automáticamente por Dashboard Crypto Analyzer_
      `.trim();

      try {
        await navigator.clipboard.writeText(textoBlog);
        alert(`¡Informe de ${symbol} copiado al portapapeles con éxito!`);
      } catch (err) {
        console.error("Error al copiar al portapapeles: ", err);
      }
    };

    return {
      getRsiColorClass,
      getTrendColor,
      trendColor,
      handleCopyBlog
    };
  };