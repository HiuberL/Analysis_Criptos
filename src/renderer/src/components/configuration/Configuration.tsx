// src/renderer/src/components/Dashboard.tsx
import React from 'react';
import style from '@styles/Configuration.module.css';
import { DashboardLayout } from '../DashBoard.Layout';
import { Loading } from '../shared/Loading';
import { useConfiguration } from '@renderer/hooks/Configuration/useConfiguration';

export const Configuration: React.FC = () => {
  const {
    configuracion,
    loading,
    updateThreshold,
    configInitial
  } = useConfiguration();
  configInitial();
  return (
    <DashboardLayout>
      <div className={style.containerConfig}>
        {configuracion.map((data, index) => (
            <div key={index} className={style.cardConfig}>       
              <div className={style.labelConfig}>
                <span>{data.label}</span>              
              </div>
              {data.object === 'dropdown' ? (
              <select
                      value={data.value} // El valor seleccionado actual (ej. "USDT")
                      onChange={(e) => updateThreshold(data.dato, e.target.value)}
                      className={style.selectConfig} // Por si quieres darle estilos independientes
                  >
                {data.options.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select> 
              ) : (
                /* ELSE: Para cualquier otro tipo (number, text, etc.) */
                <input 
                  className={style.inputConfig}
                  type={data.type} 
                  value={data.value} 
                  onChange={(e) => updateThreshold(data.dato,e.target.value)}
                />
              )}  

            </div> 
            ))}
      </div> 


    </DashboardLayout>
  );
};