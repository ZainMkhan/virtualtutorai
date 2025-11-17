import React, { useState, useEffect } from 'react';
import type { Transaction, RefundRequest } from '../../../services/api';
import { SummaryCards } from './components/SummaryCards';
import { TableHeader } from './components/TableHeader';
import { Filters } from './components/Filters';
import { TransactionTable } from './components/TransactionTable';
import { Pagination } from './components/Pagination';
import { RefundModal } from './components/RefundModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { fetchTransactionsData, exportTransactionsToCSV, submitRefund } from './api';
import type { PaymentFilters } from './types';

const DEFAULT_FILTERS: PaymentFilters = {
  page: 1,
  page_size: 20,
  status: '',
  user_id: '',
  start_date: '',
  end_date: '',
};

const AdminPayments: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<PaymentFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundData, setRefundData] = useState<RefundRequest>({
    transaction_id: '',
    reason: '',
    amount: undefined,
  });
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchTransactions = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchTransactionsData(filters, pageNum, pageSize);
      setTransactions(data.results);
      setTotalTransactions(data.count);
      setCurrentPage(pageNum);
    } catch (error: any) {
      console.error('Fetch transactions error:', error);
      setError(error.message || 'Failed to fetch transactions');
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
    setFilters(DEFAULT_FILTERS);
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

      setRefundLoading(true);
      await submitRefund(refundData);
      await fetchTransactions(currentPage);
      handleCloseRefundModal();
    } catch (error: any) {
      console.error('Refund error:', error);
      setError(error.message || 'Failed to issue refund');
    } finally {
      setRefundLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      exportTransactionsToCSV(transactions);
    } catch (error: any) {
      console.error('Export error:', error);
      setError(error.message || 'Failed to export transactions');
    }
  };

  const totalPages = Math.ceil(totalTransactions / pageSize);

  if (loading && transactions.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <SummaryCards transactions={transactions} totalTransactions={totalTransactions} />

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow">
        <TableHeader
          showFilters={showFilters}
          onFiltersToggle={() => setShowFilters(!showFilters)}
          onExport={handleExportCSV}
          canExport={transactions.length > 0}
        />

        {/* Filters */}
        {showFilters && (
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        )}

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Table */}
        <TransactionTable
          transactions={transactions}
          onRefundClick={handleOpenRefundModal}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalTransactions={totalTransactions}
          pageSize={pageSize}
          onPreviousPage={() => fetchTransactions(Math.max(currentPage - 1, 1))}
          onNextPage={() => fetchTransactions(Math.min(currentPage + 1, totalPages))}
        />
      </div>

      {/* Refund Modal */}
      <RefundModal
        isOpen={showRefundModal}
        selectedTransaction={selectedTransaction}
        refundData={refundData}
        error={error}
        isSubmitting={refundLoading}
        onClose={handleCloseRefundModal}
        onInputChange={handleRefundInputChange}
        onSubmit={handleSubmitRefund}
      />
    </div>
  );
};

export default AdminPayments;
