import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingState, ActivityLogsContainer } from './components';
import { fetchActivityLogs, exportLogsToCSV } from './api';
import { INITIAL_FILTERS, type ActivityLog, type ActivityLogsFilterParams } from './types';

const AdminActivityLogs: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<ActivityLogsFilterParams>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch activity logs
  const fetchLogs = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryFilters: ActivityLogsFilterParams = {
        page: pageNum,
        page_size: pageSize,
        ...(filters.action && { action: filters.action }),
        ...(filters.resource_type && { resource_type: filters.resource_type }),
        ...(filters.user_id && { user_id: filters.user_id }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
      };

      const response = await fetchActivityLogs(queryFilters);

      if (response.success) {
        setLogs(response.data.results);
        setTotalLogs(response.data.count);
        setCurrentPage(pageNum);
      } else {
        setError(response.message || 'Failed to fetch activity logs');
      }
    } catch (error: any) {
      console.error('Fetch logs error:', error);
      setError('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchLogs(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    fetchLogs(1);
  };

  const handleExportCSV = () => {
    try {
      exportLogsToCSV(logs);
    } catch (error: any) {
      console.error('Export error:', error);
      setError('Failed to export logs');
    }
  };

  const totalPages = Math.ceil(totalLogs / pageSize);

  if (loading && logs.length === 0) {
    return <LoadingState />;
  }

  return (
    <ActivityLogsContainer
      logs={logs}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      totalLogs={totalLogs}
      pageSize={pageSize}
      showFilters={showFilters}
      filters={filters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      onExportCSV={handleExportCSV}
      onFilterChange={handleFilterChange}
      onApplyFilters={handleApplyFilters}
      onClearFilters={handleClearFilters}
      onPreviousPage={() => fetchLogs(Math.max(currentPage - 1, 1))}
      onNextPage={() => fetchLogs(Math.min(currentPage + 1, totalPages))}
    />
  );
};

export default AdminActivityLogs;
