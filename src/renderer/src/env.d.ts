/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BINANCE_API_KEY: string;
  readonly VITE_API_BINANCE: string;
  // Agrega aquí más variables de entorno si las necesitas en el futuro
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}