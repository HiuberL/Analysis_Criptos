// src/renderer/src/components/Dashboard.tsx
import React from 'react';
import styles from '@styles/Dashboard.module.css';
import { DashboardLayout } from '../DashBoard.Layout';
import { Loading } from '../shared/Loading';
import { Pagination } from '../shared/Pagination';
import { AnalysisView } from '../shared/AnalysisView';
import { CryptoTableSimple } from '../shared/CryptoTableSimple';
import { useFavorites } from '@renderer/hooks/Favorites/useFavorites';

export const FavoritoView: React.FC = () => {
  const {
    loading,
    selectedSymbol,
    filteredSymbols,
    currentPage,
    totalPages,
    setCurrentPage,
    handleSelectSymbol,
    favorites,
    toggleFavorite,
    handleSearchChange
  } = useFavorites();

  if (loading) {
    return <Loading message="Cargando mercados activos de Binance..." />;
  }

  return (
    <DashboardLayout>
      <div className={styles.containerModules}>
        <div className={styles.columnOne}>
          <CryptoTableSimple
            symbols={filteredSymbols}
            loading={loading}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={handleSelectSymbol}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            handleSearchChange={handleSearchChange}
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