import type { Transaction } from '../../../services/api';

export const getStatusBadgeColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    succeeded: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getTotalAmount = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, tx) => sum + parseFloat(tx.final_amount), 0);
};

export const getSucceededAmount = (transactions: Transaction[]): number => {
  return transactions
    .filter(tx => tx.status === 'succeeded')
    .reduce((sum, tx) => sum + parseFloat(tx.final_amount), 0);
};

export const getPendingCount = (transactions: Transaction[]): number => {
  return transactions.filter(tx => tx.status === 'pending').length;
};

export const formatCurrency = (amount: string | number): string => {
  return `$${parseFloat(String(amount)).toFixed(2)}`;
};

export const formatDateTime = (dateString: string): { date: string; time: string } => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
  };
};

export const truncateId = (id: string, length: number = 8): string => {
  return `${id.substring(0, length)}...`;
};
