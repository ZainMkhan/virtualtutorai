import React from 'react';
import { Filter, Download } from 'lucide-react';
import type { PaymentFilters } from '../types';

interface TableHeaderProps {
  showFilters: boolean;
  onFiltersToggle: () => void;
  onExport: () => void;
  canExport: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  showFilters,
  onFiltersToggle,
  onExport,
  canExport,
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">All Transactions</h2>
        <div className="flex gap-2">
          <button
            onClick={onFiltersToggle}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={onExport}
            disabled={!canExport}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};
