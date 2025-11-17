import type { Transaction, TransactionsFilterParams, RefundRequest } from '../../../services/api';
import { adminAPI } from '../../../services/api';

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
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
    throw new Error('Failed to export transactions');
  }
};

export const buildTransactionFilters = (
  filters: {
    status: string;
    user_id: string;
    start_date: string;
    end_date: string;
  },
  pageNum: number,
  pageSize: number
): TransactionsFilterParams => {
  const queryFilters: TransactionsFilterParams = {
    page: pageNum,
    page_size: pageSize,
  };

  if (filters.status) queryFilters.status = filters.status as any;
  if (filters.user_id) queryFilters.user_id = filters.user_id;
  if (filters.start_date) queryFilters.start_date = filters.start_date;
  if (filters.end_date) queryFilters.end_date = filters.end_date;

  return queryFilters;
};

export const fetchTransactionsData = async (
  filters: any,
  pageNum: number,
  pageSize: number
): Promise<{ results: Transaction[]; count: number }> => {
  const queryFilters = buildTransactionFilters(filters, pageNum, pageSize);
  const response = await adminAPI.getAllTransactions(queryFilters);

  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch transactions');
  }

  return response.data;
};

export const submitRefund = async (refundData: RefundRequest): Promise<void> => {
  const response = await adminAPI.issueRefund(refundData);

  if (!response.success) {
    throw new Error(response.message || 'Failed to issue refund');
  }
};
