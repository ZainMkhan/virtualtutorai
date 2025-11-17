import React from 'react';
import type { ActivityLog, ActivityLogsFilterParams } from '../types';
import PageHeader from './PageHeader';
import FilterSection from './FilterSection';
import ErrorAlert from './ErrorAlert';
import ActivityLogsTable from './ActivityLogsTable';
import Pagination from './Pagination';

interface ActivityLogsContainerProps {
  logs: ActivityLog[];
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalLogs: number;
  pageSize: number;
  showFilters: boolean;
  filters: ActivityLogsFilterParams;
  onToggleFilters: () => void;
  onExportCSV: () => void;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const ActivityLogsContainer: React.FC<ActivityLogsContainerProps> = ({
  logs,
  error,
  currentPage,
  totalPages,
  totalLogs,
  pageSize,
  showFilters,
  filters,
  onToggleFilters,
  onExportCSV,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onPreviousPage,
  onNextPage,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <PageHeader
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
        onExport={onExportCSV}
        logsCount={logs.length}
      />

      {showFilters && (
        <FilterSection
          filters={filters}
          onFilterChange={onFilterChange}
          onApplyFilters={onApplyFilters}
          onClearFilters={onClearFilters}
        />
      )}

      {error && <ErrorAlert message={error} />}

      <ActivityLogsTable logs={logs} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalLogs={totalLogs}
        pageSize={pageSize}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  );
};

export default ActivityLogsContainer;
