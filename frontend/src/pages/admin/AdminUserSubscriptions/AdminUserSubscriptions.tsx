import React, { useState, useEffect } from 'react';
import type { AdminUserSubscription } from '../../../services/api';
import {
  SummaryCards,
  TableHeader,
  FilterSection,
  ErrorAlert,
  LoadingState,
  SubscriptionsTable,
  Pagination
} from './components';
import { INITIAL_FILTERS } from './types';
import { fetchUsersWithSubscriptions, exportUsersToCSV } from './api';
import type { SubscriptionFilters } from './types';

const AdminUserSubscriptions: React.FC = () => {
  const [users, setUsers] = useState<AdminUserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<SubscriptionFilters>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch users with subscriptions
  const fetchData = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchUsersWithSubscriptions(filters, pageNum, pageSize);

      if (response.success) {
        setUsers(response.data.results);
        setTotalUsers(response.data.count);
        setCurrentPage(pageNum);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Fetch users error:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
    }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchData(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    fetchData(1);
  };

  const handleExportCSV = () => {
    try {
      exportUsersToCSV(users);
    } catch (error: any) {
      console.error('Export error:', error);
      setError('Failed to export data');
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading && users.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <SummaryCards totalUsers={totalUsers} users={users} />

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow">
        <TableHeader
          searchValue={filters.search}
          onSearchChange={handleSearchChange}
          showFilters={showFilters}
          onFiltersToggle={() => setShowFilters(!showFilters)}
          onExport={handleExportCSV}
          canExport={users.length > 0}
        />

        {/* Filters */}
        {showFilters && (
          <FilterSection
            filters={filters}
            onFilterChange={handleFilterChange}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        )}

        {error && <ErrorAlert error={error} />}

        {/* Table */}
        <SubscriptionsTable users={users} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalUsers={totalUsers}
          pageSize={pageSize}
          onPreviousPage={() => fetchData(Math.max(currentPage - 1, 1))}
          onNextPage={() => fetchData(Math.min(currentPage + 1, totalPages))}
        />
      </div>
    </div>
  );
};

export default AdminUserSubscriptions;

