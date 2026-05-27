import React from 'react';
import styles from '@styles/CryptoTable.module.css';
import { SymbolInfo } from '@renderer/interfaces/binance.interface';

interface CryptoTableSimpleProps {
  symbols: SymbolInfo[];
  loading: boolean;
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string | null;
  favorites: string[] | null,
  toggleFavorite: (symbol:string) => void;
}

export const CryptoTableSimple: React.FC<CryptoTableSimpleProps> = ({
  symbols,
  loading,
  onSelectSymbol,
  selectedSymbol,
  favorites,
  toggleFavorite
}) => {
  return (
    <div className={styles.cryptoTableContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className={styles.title}>Mercados Spot (USDT)</h3>
      </div>
      
      <table className={styles.cryptoTable}>
        <thead>
          <tr>
            <th> - </th>
            <th>Par</th>
            <th>Moneda Base</th>
            <th>Precio</th>
            <th>Volumen</th>
            <th>Cambio</th>
            <th style={{ textAlign: 'right' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((item) => (
            <tr 
              key={item.symbol}
              className={`${styles.cryptoRow} ${selectedSymbol === item.symbol ? styles.selected : ''}`}
              onClick={() => onSelectSymbol(item.symbol)}
            >
              <td>
                <button className={styles.favorites} onClick={() => toggleFavorite(item.symbol)}>
                    {favorites?.includes(item.symbol) ? "★" : "☆"}
                </button>
              </td> 
              <td className={styles.symbolCell}>{item.symbol}</td>
              <td className={styles.baseAssetCell}>{item.baseAsset}</td>
              <td className={styles.baseAssetCell}>{item.price}</td>
              <td className={styles.baseAssetCell}>{item.volume}</td>
              <td className={styles.baseAssetCell} 
              style={{color: item.change > 0 ? '#00c087' : (item.change < 0 ? '#ff3b3b' : '#ffa500') 
                }}>{item.change}%</td>
              <td style={{ textAlign: 'right' }}>
                <button className={styles.actionButton}>
                  {selectedSymbol === item.symbol ? 'Analizando' : 'Ver'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};