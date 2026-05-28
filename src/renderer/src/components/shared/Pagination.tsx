// src/renderer/src/components/Pagination.tsx
import styles from '@styles/shared/Pagination.module.css';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className={styles.paginationControls}>
    <button 
      className={styles.pageButton}
      disabled={currentPage === 1} 
      onClick={() => onPageChange(currentPage - 1)}
    >
      Anterior
    </button>
    
    <span className={styles.pageInfo}>
      Página <strong>{currentPage}</strong> de {totalPages}
    </span>
    
    <button 
      className={styles.pageButton}
      disabled={currentPage === totalPages} 
      onClick={() => onPageChange(currentPage + 1)}
    >
      Siguiente
    </button>
  </div>
);