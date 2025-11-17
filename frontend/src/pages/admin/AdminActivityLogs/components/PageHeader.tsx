import React from 'react';
import { Filter, Download } from 'lucide-react';

interface PageHeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  onExport: () => void;
  logsCount: number;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  showFilters,
  onToggleFilters,
  onExport,
  logsCount,
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Activity Logs</h2>
        <div className="flex gap-2">
          <button
            onClick={onToggleFilters}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={onExport}
            disabled={logsCount === 0}
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

export default PageHeader;
