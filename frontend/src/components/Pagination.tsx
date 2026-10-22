import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);
  const [pageInput, setPageInput] = useState<string>(String(safeCurrentPage));

  useEffect(() => {
    setPageInput(String(safeCurrentPage));
  }, [safeCurrentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handleInputSubmit = () => {
    let parsed = parseInt(pageInput, 10);
    if (isNaN(parsed)) {
      setPageInput(String(safeCurrentPage));
      return;
    }
    if (parsed < 1) parsed = 1;
    if (parsed > safeTotalPages) parsed = safeTotalPages;
    setPageInput(String(parsed));
    if (parsed !== safeCurrentPage) {
      onPageChange(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  return (
    <div className="unified-pagination-bar">
      {/* ── LEFT: ITEMS PER PAGE DROPDOWN (10 | 20 | 50 | 100) ── */}
      <div className="pagination-left">
        <span className="pagination-label">Hiển thị:</span>
        <select
          className="pagination-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="pagination-label">/ trang</span>
      </div>

      {/* ── RIGHT: TRƯỚC - TRANG [INPUT] / [TOTAL] - SAU ── */}
      <div className="pagination-right">
        <button
          type="button"
          className="pagination-btn nav-btn"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
        >
          <ChevronLeft size={16} />
          <span>Trước</span>
        </button>

        <div className="pagination-page-input-wrap">
          <span className="pagination-label">Trang</span>
          <input
            type="number"
            className="pagination-page-input"
            min={1}
            max={safeTotalPages}
            value={pageInput}
            onChange={handleInputChange}
            onBlur={handleInputSubmit}
            onKeyDown={handleKeyDown}
          />
          <span className="pagination-label">/ {safeTotalPages}</span>
        </div>

        <button
          type="button"
          className="pagination-btn nav-btn"
          disabled={safeCurrentPage >= safeTotalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
        >
          <span>Sau</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
