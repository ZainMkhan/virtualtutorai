import React, { useState, useEffect } from 'react';
import { adminAPI, type Transaction, type TransactionsFilterParams, type RefundRequest } from '../../services/api';
import { Filter, Download, RotateCcw, AlertCircle, X } from 'lucide-react';

const AdminPayments: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [pageSize] = useState(20);

  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    status: '' as any,
    user_id: '',
    start_date: '',
    end_date: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundData, setRefundData] = useState<RefundRequest>({
    transaction_id: '',
    reason: '',
    amount: undefined,
  });

  // Fetch transactions
  const fetchTransactions = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryFilters: TransactionsFilterParams = {
        page: pageNum,
        page_size: pageSize,
      };

      if (filters.status) queryFilters.status = filters.status as any;
      if (filters.user_id) queryFilters.user_id = filters.user_id;
      if (filters.start_date) queryFilters.start_date = filters.start_date;
      if (filters.end_date) queryFilters.end_date = filters.end_date;

      const response = await adminAPI.getAllTransactions(queryFilters);

      if (response.success) {
        setTransactions(response.data.results);
        setTotalTransactions(response.data.count);
        setCurrentPage(pageNum);
      } else {
        setError(response.message || 'Failed to fetch transactions');
      }
    } catch (error: any) {
      console.error('Fetch transactions error:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
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
    fetchTransactions(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      status: '' as any,
      user_id: '',
      start_date: '',
      end_date: '',
    });
    setCurrentPage(1);
    fetchTransactions(1);
  };

  const handleOpenRefundModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRefundData({
      transaction_id: transaction.payment_id,
      reason: '',
      amount: parseFloat(transaction.final_amount),
    });
    setShowRefundModal(true);
  };

  const handleCloseRefundModal = () => {
    setShowRefundModal(false);
    setSelectedTransaction(null);
    setRefundData({
      transaction_id: '',
      reason: '',
      amount: undefined,
    });
  };

  const handleRefundInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRefundData(prev => ({
      ...prev,
      [name]: name === 'amount' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (!refundData.reason?.trim()) {
        setError('Please provide a reason for the refund');
        return;
      }

      const response = await adminAPI.issueRefund(refundData);
      if (response.success) {
        // Refresh transactions
        await fetchTransactions(currentPage);
        handleCloseRefundModal();
      } else {
        setError(response.message || 'Failed to issue refund');
      }
    } catch (error: any) {
      console.error('Refund error:', error);
      setError('Failed to issue refund');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Date', 'Payment ID', 'User Email', 'Original Amount', 'Discount', 'Final Amount', 'Currency', 'Status', 'Stripe Payment Intent ID'];
      const rows = transactions.map(tx => [
        tx.created_at,
        tx.payment_id,
        tx.user_email,
        tx.original_amount,
        tx.discount_amount,
        tx.final_amount,
        tx.currency,
        tx.status,
        tx.stripe_payment_intent_id,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export error:', error);
      setError('Failed to export transactions');
    }
  };

  const totalPages = Math.ceil(totalTransactions / pageSize);

  const getStatusBadgeColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      succeeded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTotalAmount = (): number => {
    return transactions.reduce((sum, tx) => sum + parseFloat(tx.final_amount), 0);
  };

  const getSucceededAmount = (): number => {
    return transactions
      .filter(tx => tx.status === 'succeeded')
      .reduce((sum, tx) => sum + parseFloat(tx.final_amount), 0);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Payments & Transactions</h2>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs font-medium text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalTransactions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs font-medium text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${getTotalAmount().toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs font-medium text-gray-600">Succeeded</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${getSucceededAmount().toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs font-medium text-gray-600">Pending Transactions</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {transactions.filter(tx => tx.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">All Transactions</h2>
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
                disabled={transactions.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* User ID Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  name="user_id"
                  value={filters.user_id}
                  onChange={handleFilterChange}
                  placeholder="Enter user ID"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.payment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {tx.payment_id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tx.user_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${parseFloat(tx.original_amount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${parseFloat(tx.discount_amount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${parseFloat(tx.final_amount).toFixed(2)} {tx.currency.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {tx.status === 'succeeded' && (
                      <button
                        onClick={() => handleOpenRefundModal(tx)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Refund</span>
                      </button>
                    )}
                    {tx.status === 'failed' && (
                      <span className="text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>Failed</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No transactions found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTransactions)} of {totalTransactions} transactions
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchTransactions(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => fetchTransactions(Math.min(currentPage + 1, totalPages))}
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

      {/* Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Issue Refund
              </h3>
              <button
                onClick={handleCloseRefundModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRefund} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTransaction.payment_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTransaction.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Final Amount</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${parseFloat(selectedTransaction.final_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount (USD)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={refundData.amount || ''}
                  onChange={handleRefundInputChange}
                  step="0.01"
                  min="0"
                  max={parseFloat(selectedTransaction.final_amount)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for full refund"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to refund the full amount of ${parseFloat(selectedTransaction.final_amount).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Refund *
                </label>
                <textarea
                  name="reason"
                  value={refundData.reason}
                  onChange={handleRefundInputChange}
                  placeholder="e.g., Customer request, duplicate charge, service issue..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseRefundModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Issue Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
