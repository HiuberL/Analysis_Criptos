
// src/renderer/src/hooks/dashboard/useDashboardState.ts
import { ConfigItem, DEFAULT_CONFIG, useConfigurationState } from './useConfigurationState';

export const useConfigurationHandler = (
  state : ReturnType<typeof useConfigurationState>
) => {
  const  {
    setConfiguracion,
    configuracion
  } = state;

  const updateThreshold = (datoToUpdate: string, newValue: string) => {
    setConfiguracion((prevConfig) => {
      const nuevaConfig = prevConfig.map((item) => {
        if (item.dato === datoToUpdate) {
          return { ...item, value: newValue };
        }
        return item;
      });
      localStorage.setItem("crypto_config", JSON.stringify(nuevaConfig));
      return nuevaConfig;
    });
  };

  const getConfigValue = (datoToFind: string) => {
    // Buscamos el objeto dentro del array que coincida con la propiedad 'dato'
    cargarConfiguracionInicial();
    const configItem = configuracion.find((item) => item.dato === datoToFind);
    
    // Si lo encuentra, devuelve su valor. Si no existe, devuelve undefined o un fallback.
    return configItem ? configItem.value : undefined;
  };

  const cargarConfiguracionInicial = (): ConfigItem[] => {
    const savedText = localStorage.getItem("crypto_config");
    
    // 1. Si no hay nada, guardamos la configuración actual por defecto y la devolvemos
    if (!savedText) {
      localStorage.setItem("crypto_config", JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }

    try {
      const savedConfig: ConfigItem[] = JSON.parse(savedText);

      // 2. RE-MAPEAR: Recorremos la configuración del código (DEFAULT_CONFIG) 
      // para asegurar que todos los campos existan en la guardada.
      const configActualizada = DEFAULT_CONFIG.map((defaultItem) => {
        // Buscamos si el usuario ya tiene este 'dato' guardado en su disco
        const usuarioTieneItem = savedConfig.find(item => item.dato === defaultItem.dato);
        
        // Si ya lo tiene, conservamos su valor. Si es NUEVO, usamos el valor por defecto.
        return usuarioTieneItem ? usuarioTieneItem : defaultItem;
      });

      // 3. Si detectamos que el tamaño cambió (se agregaron configuraciones nuevas)
      // actualizamos el localStorage inmediatamente para que quede al día.
      if (savedConfig.length !== configActualizada.length) {
        localStorage.setItem("crypto_config", JSON.stringify(configActualizada));
      }

      return configActualizada;
    } catch (error) {
      // Por si el JSON guardado se corrompe por alguna razón
      return DEFAULT_CONFIG;
    }  
  };

  return {
    updateThreshold,
    cargarConfiguracionInicial,
    getConfigValue
  };
};