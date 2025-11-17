import React from 'react';
import { getTotalAmount, getSucceededAmount, getPendingCount } from '../utils';
import type { Transaction } from '../../../../services/api';

interface SummaryCardsProps {
  transactions: Transaction[];
  totalTransactions: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  transactions,
  totalTransactions,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-xs font-medium text-gray-600">Total Transactions</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{totalTransactions}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-xs font-medium text-gray-600">Total Amount</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          ${getTotalAmount(transactions).toFixed(2)}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-xs font-medium text-gray-600">Succeeded</p>
        <p className="text-2xl font-bold text-green-600 mt-1">
          ${getSucceededAmount(transactions).toFixed(2)}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-xs font-medium text-gray-600">Pending Transactions</p>
        <p className="text-2xl font-bold text-yellow-600 mt-1">
          {getPendingCount(transactions)}
        </p>
      </div>
    </div>
  );
};
