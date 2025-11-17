import type { Transaction, RefundRequest } from '../../../services/api';

export interface PaymentFilters {
  page: number;
  page_size: number;
  status: string;
  user_id: string;
  start_date: string;
  end_date: string;
}

export interface AdminPaymentsState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalTransactions: number;
  pageSize: number;
  filters: PaymentFilters;
  showFilters: boolean;
  showRefundModal: boolean;
  selectedTransaction: Transaction | null;
  refundData: RefundRequest;
}

export interface SummaryCard {
  label: string;
  value: string | number;
  color?: string;
}
