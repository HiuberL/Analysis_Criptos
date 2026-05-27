// src/renderer/src/components/Loading.tsx
import React from 'react';
import styles from '@styles/shared/Loading.module.css';

export const SubLoading: React.FC<{ message?: string }> = ({ message = "Cargando..." }) => {
  return (    
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
};