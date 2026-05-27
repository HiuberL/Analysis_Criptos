export const getTradeLevels = (
    entryPrice: number, 
    atr: number, 
    multiplier = 2, 
) => {
    // Calculamos la distancia del riesgo basada en volatilidad
    const riskAmount = atr * multiplier;
    
    let stopLossC: number;
    let takeProfitC: number;
    let stopLossV: number;
    let takeProfitV: number;

    stopLossC = entryPrice - riskAmount;
    takeProfitC = entryPrice + (riskAmount * 2);
    stopLossV = entryPrice + riskAmount;
    takeProfitV = entryPrice - (riskAmount * 2);
    // Retornamos valores asegurándonos de que no sean negativos
    return { 
        entryPrice, 
        stopLossC: Math.max(0, stopLossC), 
        takeProfitC: Math.max(0, takeProfitC),
        stopLossV: Math.max(0, stopLossV), 
        takeProfitV: Math.max(0, takeProfitV) 

    };
};