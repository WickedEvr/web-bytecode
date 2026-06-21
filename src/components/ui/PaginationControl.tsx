import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationControlProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
};

const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalItems,
  itemsPerPage = 9,
  onPageChange,
  disabled = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-white/5 px-4 py-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>Mostrando {firstItem}-{lastItem} de {totalItems}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={disabled || currentPage <= 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-24 text-center text-xs uppercase tracking-widest text-white/40">
          Página {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={disabled || currentPage >= totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControl;
