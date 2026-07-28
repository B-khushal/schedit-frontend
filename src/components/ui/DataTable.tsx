import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, MoreVertical } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { EmptyState } from './EmptyState';
import { useResponsive } from '../../hooks/useMediaQuery';

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  className?: string;
  /** Priority: 1 = always visible, 2 = hidden on mobile, 3 = hidden on tablet */
  priority?: 1 | 2 | 3;
  /** Label used in mobile card view */
  mobileLabel?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  className?: string;
  /** Render a custom mobile card for each row */
  mobileCardRenderer?: (row: T, index: number) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchKey,
  pageSize = 10,
  onRowClick,
  className,
  mobileCardRenderer,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const { isMobile, isTablet } = useResponsive();

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchQuery || !searchKey) return data;
    return data.filter((row) => {
      const val = row[searchKey];
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery, searchKey]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const order = sortOrder === 'asc' ? 1 : -1;
      return aVal > bVal ? order : -order;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filter visible columns based on priority and breakpoint
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => {
      const priority = col.priority || 1;
      if (isMobile && priority > 1) return false;
      if (isTablet && priority > 2) return false;
      return true;
    });
  }, [columns, isMobile, isTablet]);

  // Mobile: render as cards
  const renderMobileCards = () => {
    if (paginatedData.length === 0) return null;

    return (
      <div className="space-y-3">
        {paginatedData.map((row, rowIdx) => {
          if (mobileCardRenderer) {
            return <div key={rowIdx}>{mobileCardRenderer(row, rowIdx)}</div>;
          }

          return (
            <div
              key={rowIdx}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2',
                onRowClick && 'cursor-pointer active:bg-gray-50'
              )}
            >
              {columns.map((col, colIdx) => {
                let cellContent: React.ReactNode;
                if (typeof col.accessorKey === 'function') {
                  cellContent = col.accessorKey(row);
                } else {
                  cellContent = row[col.accessorKey] as unknown as React.ReactNode;
                }
                return (
                  <div key={colIdx} className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500 shrink-0">
                      {col.mobileLabel || col.header}
                    </span>
                    <span className="text-xs text-gray-900 font-semibold text-right min-w-0 truncate">
                      {cellContent}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('space-y-3 sm:space-y-4', className)}>
      {searchKey && (
        <div className="flex items-center justify-between gap-3">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            icon={<Search className="w-4 h-4 text-gray-400" />}
            className="max-w-full sm:max-w-sm"
          />
        </div>
      )}

      {/* Mobile card view */}
      {isMobile ? (
        <div>
          {renderMobileCards()}
          {sortedData.length === 0 && (
            <EmptyState
              title="No records found"
              description="We couldn't find any items matching your criteria."
              className="py-12"
            />
          )}
        </div>
      ) : (
        /* Desktop/Tablet table view */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {visibleColumns.map((col, idx) => {
                    const isSortable = col.sortable && typeof col.accessorKey === 'string';
                    return (
                      <th
                        key={idx}
                        onClick={() => isSortable && handleSort(col.accessorKey as keyof T)}
                        className={cn(
                          'px-4 sm:px-6 py-3 sm:py-4 font-medium select-none',
                          isSortable && 'cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors',
                          col.className
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.header}
                          {isSortable && sortKey === col.accessorKey && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {paginatedData.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'transition-colors duration-150',
                      onRowClick ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50/50'
                    )}
                  >
                    {visibleColumns.map((col, colIdx) => {
                      let cellContent: React.ReactNode;
                      if (typeof col.accessorKey === 'function') {
                        cellContent = col.accessorKey(row);
                      } else {
                        cellContent = row[col.accessorKey] as unknown as React.ReactNode;
                      }
                      return (
                        <td key={colIdx} className={cn('px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-700', col.className)}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedData.length === 0 && (
            <EmptyState
              title="No records found"
              description="We couldn't find any items matching your criteria."
              className="py-12"
            />
          )}
        </div>
      )}

      {/* Pagination */}
      {sortedData.length > pageSize && (
        <div className="flex items-center justify-between bg-white border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-card gap-2">
          <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
            Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-gray-900">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-900">{sortedData.length}</span>
          </div>
          <div className="text-xs text-gray-500 sm:hidden">
            {currentPage} / {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              icon={<ChevronLeft className="w-4 h-4" />}
            />
            {/* Page numbers — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (currentPage <= 3) {
                  pageNum = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = currentPage - 2 + idx;
                }
                const isCurrent = pageNum === currentPage;
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrent ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 px-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              icon={<ChevronRight className="w-4 h-4" />}
            />
          </div>
        </div>
      )}
    </div>
  );
}
