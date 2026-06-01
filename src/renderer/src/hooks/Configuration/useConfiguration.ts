import { useConfigurationHandler } from "./useConfigurationHandler";
import { useConfigurationState } from "./useConfigurationState";

export const useConfiguration = () => {
    const state = useConfigurationState();
    const handler = useConfigurationHandler(state);

    return{
        configuracion: state.configuracion,
        loading: state.loading,
        updateThreshold: handler.updateThreshold,
        configInitial: handler.cargarConfiguracionInicial,
        getConfigValue: handler.getConfigValue
    }
};