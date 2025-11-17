import React from 'react';
import { Search, Filter, Download } from 'lucide-react';

interface TableHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onFiltersToggle: () => void;
  onExport: () => void;
  canExport: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  searchValue,
  onSearchChange,
  showFilters,
  onFiltersToggle,
  onExport,
  canExport
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Users & Subscriptions</h2>
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by email or username..."
          className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default TableHeader;
