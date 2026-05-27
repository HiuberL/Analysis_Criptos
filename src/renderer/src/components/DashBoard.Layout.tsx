// src/renderer/src/components/layouts/DashboardLayout.tsx

import React from 'react';
import styles from '@styles/Dashboard.module.css';
import { NavLink } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({

  children
}) => {
  return (
    <div className={styles.dashboardContainer}>

      {/* Barra superior */}
      <div className={styles.topBar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoBadge}>BINANCE</div>
          <h2>Terminal Personal de Análisis</h2>
        </div>
        <div className={styles.menuBar}>
          <NavLink to="/home" className={({ isActive }) => isActive ? styles.active : styles.inactive}>
            Inicio
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => isActive ? styles.active : styles.inactive}>
            Favorito
          </NavLink>
          <NavLink to="/simulator" className={({ isActive }) => isActive ? styles.active : styles.inactive}>
            Simulador
          </NavLink>
        </div> 
      </div>

      {/* Aquí se renderizan los hijos */}
      <div className={styles.contentGrid}>
        {children}
      </div>

    </div>
  );
};