
// src/renderer/src/hooks/dashboard/useDashboardState.ts
import { useState } from 'react';

export interface ConfigItem {
  label: string;
  dato: string;
  type: string;
  value: string;
  object: string;
  options: any;
  helptext: string;
}

export const DEFAULT_CONFIG: ConfigItem[] = [
  { label: "Umbral Ballenas", dato: "threshold",type:"number", object:"input", options:[], helptext:"Valor de minimo para considerar una apuesta de ballena" , value: "30000" },
  { label: "Conversor Preferido", dato: "conversor",type: "text", object:"dropdown", options:["USDT","USDC","EUR"], helptext:"Conversor a moneda estable preferido", value: "USDT" },
  { label: "Apalancamiento", dato: "apalancamiento", type:"number", object:"input", options:[], helptext:"Apalancamiento para cálculo de valores", value: "2" },
  { label: "Máximo por Página", dato: "paginacion", type:"number", object:"input", options:[], helptext:"Total de filas por página en consultas", value: "25" },
  { label: "Ordenar Principal", dato: "sort", type:"text", object:"dropdown", options:["cambio","volumen","precio"], helptext:"Ordenamiento de informacion en ventana principal", value: "precio" },
  { label: "Ordenes Ballenas", dato: "whaleVolume", type:"number", object:"input", options:[], helptext:"Total de ordenes analizadas para verificar flujo (Historico)", value: "1000" },

];

export const useConfigurationState = () => {

    const [loading, setLoading] = useState<boolean>(true);
    const [configuracion, setConfiguracion] = useState<ConfigItem[]>(()=>{
        const saved = localStorage.getItem("crypto_config");
        return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    });
  return {
    loading, setLoading,
    configuracion, setConfiguracion
  };
};