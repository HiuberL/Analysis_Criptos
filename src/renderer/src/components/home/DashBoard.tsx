// src/renderer/src/components/Dashboard.tsx
import React from 'react';
import styles from '@styles/Dashboard.module.css';
import { useDashboard } from '@renderer/hooks/Dashboard/useDashboard';
import { CryptoTable } from '../shared/CryptoTable';
import { DashboardLayout } from '../DashBoard.Layout';
import { Loading } from '../shared/Loading';
import { Pagination } from '../shared/Pagination';
import { AnalysisView } from '../shared/AnalysisView';

export const Dashboard: React.FC = () => {
  const {
    loading,
    selectedSymbol,
    filteredSymbols,
    currentPage,
    totalPages,
    setCurrentPage,
    handleSelectSymbol,
    loadSymbols,
    favorites,
    toggleFavorite,
    handleSearchChange
  } = useDashboard();

  if (loading) {
    return <Loading message="Cargando mercados activos de Binance..." />;
  }

  return (
    <DashboardLayout>
      <div className={styles.containerModules}>
        <div className={styles.columnOne}>
          <CryptoTable
            symbols={filteredSymbols}
            loading={loading}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={handleSelectSymbol}
            onRefresh={loadSymbols}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            handleSearchChange= {handleSearchChange}
          />
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />        
        </div>

        <div className={styles.columnTwo}>
          <div className={styles.analysisPanel}>
            {selectedSymbol ? (
              // Ya no necesitas Fragmentos aquí si AnalysisView envuelve todo
              <AnalysisView symbol={selectedSymbol} />
            ) : (
              <p>Selecciona una criptomoneda para iniciar.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};