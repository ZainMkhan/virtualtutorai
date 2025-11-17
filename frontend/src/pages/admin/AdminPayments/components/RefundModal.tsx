import React from 'react';
import { X } from 'lucide-react';
import type { Transaction, RefundRequest } from '../../../../services/api';
import { formatCurrency } from '../utils';

interface RefundModalProps {
  isOpen: boolean;
  selectedTransaction: Transaction | null;
  refundData: RefundRequest;
  error: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  selectedTransaction,
  refundData,
  error,
  isSubmitting = false,
  onClose,
  onInputChange,
  onSubmit,
}) => {
  if (!isOpen || !selectedTransaction) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Issue Refund
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
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
                {formatCurrency(selectedTransaction.final_amount)}
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
              onChange={onInputChange}
              step="0.01"
              min="0"
              max={parseFloat(selectedTransaction.final_amount)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty for full refund"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to refund the full amount of {formatCurrency(selectedTransaction.final_amount)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Refund *
            </label>
            <textarea
              name="reason"
              value={refundData.reason}
              onChange={onInputChange}
              placeholder="e.g., Customer request, duplicate charge, service issue..."
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Issue Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
