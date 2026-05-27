// 1. Definimos exactamente qué forma tendrán nuestros datos de salida
export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price?:string;
  volume?:string;
  change?:string
}
