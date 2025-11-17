import React, { useState, useEffect } from 'react';
import { adminAPI, type AdminUserSubscription, type AdminUsersSubscriptionsFilterParams } from '../../services/api';
import { Search, Filter, Download, AlertCircle } from 'lucide-react';

const AdminUserSubscriptions: React.FC = () => {
  const [users, setUsers] = useState<AdminUserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(20);

  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    status: '' as any,
    tier_id: '',
    search: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Fetch users with subscriptions
  const fetchUsersSubscriptions = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryFilters: AdminUsersSubscriptionsFilterParams = {
        page: pageNum,
        page_size: pageSize,
      };

      if (filters.status) queryFilters.status = filters.status as any;
      if (filters.tier_id) queryFilters.tier_id = filters.tier_id;
      if (filters.search) queryFilters.search = filters.search;

      const response = await adminAPI.getAllUsersSubscriptions(queryFilters);

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
    fetchUsersSubscriptions(1);
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
    fetchUsersSubscriptions(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      status: '' as any,
      tier_id: '',
      search: '',
    });
    setCurrentPage(1);
    fetchUsersSubscriptions(1);
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        'Username',
        'Email',
        'Full Name',
        'Status',
        'Tier Name',
        'Tier Status',
        'Days Until Renewal',
        'Messages Used/Limit',
        'Conversations Used/Limit',
        'Interactive Minutes Used/Limit',
        'Video Minutes Used/Limit',
        'Joined Date',
      ];

      const rows = users.map(user => [
        user.username,
        user.email,
        `${user.first_name} ${user.last_name}`,
        user.status,
        user.subscription?.tier_name || 'N/A',
        user.subscription?.status || 'N/A',
        user.subscription?.days_until_renewal?.toString() || 'N/A',
        user.usage ? `${user.usage.messages_sent}/${user.usage.messages_limit}` : 'N/A',
        user.usage ? `${user.usage.conversations_used}/${user.usage.conversations_limit}` : 'N/A',
        user.usage ? `${user.usage.interactive_minutes_used}/${user.usage.interactive_minutes_limit}` : 'N/A',
        user.usage ? `${user.usage.video_minutes_used}/${user.usage.video_minutes_limit}` : 'N/A',
        user.date_joined,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export error:', error);
      setError('Failed to export data');
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  const getStatusBadgeColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      'past_due': 'bg-orange-100 text-orange-800',
      canceled: 'bg-red-100 text-red-800',
      incomplete: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    return limit > 0 ? Math.round((used / limit) * 100) : 0;
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-100 text-red-800';
    if (percentage >= 70) return 'bg-orange-100 text-orange-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User Subscriptions & Usage</h2>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs font-medium text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs font-medium text-gray-600">Active Subscriptions</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {users.filter(u => u.subscription?.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs font-medium text-gray-600">High Usage Alerts</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {users.filter(u => u.usage && getUsagePercentage(u.usage.messages_sent, u.usage.messages_limit) >= 80).length}
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Users & Subscriptions</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              <button
                onClick={handleExportCSV}
                disabled={users.length === 0}
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
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by email or username..."
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Tier Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Status
                </label>
                <select
                  name="tier_id"
                  value={filters.tier_id}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Tiers</option>
                  <option value="active">Active</option>
                  <option value="canceled">Canceled</option>
                  <option value="past_due">Past Due</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Renewal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interactive Min
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video Min
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const messagesPercentage = user.usage ? getUsagePercentage(user.usage.messages_sent, user.usage.messages_limit) : 0;
                const conversationsPercentage = user.usage ? getUsagePercentage(user.usage.conversations_used, user.usage.conversations_limit) : 0;
                const interactivePercentage = user.usage ? getUsagePercentage(user.usage.interactive_minutes_used, user.usage.interactive_minutes_limit) : 0;
                const videoPercentage = user.usage ? getUsagePercentage(user.usage.video_minutes_used, user.usage.video_minutes_limit) : 0;

                return (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.subscription?.tier_name || 'N/A'}</div>
                      <div className="text-xs">
                        <span className={`inline-flex px-2 py-0.5 rounded-full ${getStatusBadgeColor(user.subscription?.status || 'inactive')}`}>
                          {user.subscription?.status || 'inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.subscription?.days_until_renewal || 'N/A'} days</div>
                      <div className="text-xs text-gray-500">
                        {user.subscription?.current_period_end ? new Date(user.subscription.current_period_end).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.usage ? `${user.usage.messages_sent}/${user.usage.messages_limit}` : 'N/A'}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full bg-blue-600`}
                          style={{ width: `${messagesPercentage}%` }}
                        ></div>
                      </div>
                      <span className={`inline-flex text-xs font-semibold rounded px-1 mt-1 ${getUsageColor(messagesPercentage)}`}>
                        {messagesPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.usage ? `${user.usage.conversations_used}/${user.usage.conversations_limit}` : 'N/A'}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full bg-blue-600`}
                          style={{ width: `${conversationsPercentage}%` }}
                        ></div>
                      </div>
                      <span className={`inline-flex text-xs font-semibold rounded px-1 mt-1 ${getUsageColor(conversationsPercentage)}`}>
                        {conversationsPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.usage ? `${user.usage.interactive_minutes_used}/${user.usage.interactive_minutes_limit}` : 'N/A'}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full bg-blue-600`}
                          style={{ width: `${interactivePercentage}%` }}
                        ></div>
                      </div>
                      <span className={`inline-flex text-xs font-semibold rounded px-1 mt-1 ${getUsageColor(interactivePercentage)}`}>
                        {interactivePercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.usage ? `${user.usage.video_minutes_used}/${user.usage.video_minutes_limit}` : 'N/A'}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full bg-blue-600`}
                          style={{ width: `${videoPercentage}%` }}
                        ></div>
                      </div>
                      <span className={`inline-flex text-xs font-semibold rounded px-1 mt-1 ${getUsageColor(videoPercentage)}`}>
                        {videoPercentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchUsersSubscriptions(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => fetchUsersSubscriptions(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserSubscriptions;

