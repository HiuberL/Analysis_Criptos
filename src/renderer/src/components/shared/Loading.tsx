// src/renderer/src/components/Loading.tsx
import React from 'react';
import styles from '@styles/shared/Loading.module.css';
import { DashboardLayout } from '../DashBoard.Layout';

export const Loading: React.FC<{ message?: string }> = ({ message = "Cargando..." }) => {
  return (
    <DashboardLayout>
    
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>{message}</p>
    </div>
    </DashboardLayout>
  );
};