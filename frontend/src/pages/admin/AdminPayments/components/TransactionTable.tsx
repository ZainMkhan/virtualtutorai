import React from 'react';
import type { Transaction } from '../../../../services/api';
import { formatCurrency, formatDateTime, getStatusBadgeColor, truncateId } from '../utils';
import { RotateCcw, AlertCircle } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onRefundClick: (transaction: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onRefundClick }) => {
  return (
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
          {transactions.map((tx) => {
            const { date, time } = formatDateTime(tx.created_at);
            return (
              <tr key={tx.payment_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{date}</div>
                  <div className="text-xs text-gray-500">{time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">
                    {truncateId(tx.payment_id)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{tx.user_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(tx.original_amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(tx.discount_amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(tx.final_amount)} {tx.currency.toUpperCase()}
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
                      onClick={() => onRefundClick(tx)}
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
            );
          })}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No transactions found</p>
        </div>
      )}
    </div>
  );
};
