import React from 'react';
import { X } from 'lucide-react';
import type { UserProfile } from '../../../../services/api';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedUser: UserProfile | null;
  deleteAction: 'soft_delete' | 'change_status' | 'restore';
  deleteStatus: 'active' | 'inactive' | 'suspended';
  deleteReason: string;
  onActionChange: (action: 'soft_delete' | 'change_status' | 'restore') => void;
  onStatusChange: (status: 'active' | 'inactive' | 'suspended') => void;
  onReasonChange: (reason: string) => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedUser,
  deleteAction,
  deleteStatus,
  deleteReason,
  onActionChange,
  onStatusChange,
  onReasonChange,
}) => {
  if (!isOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur"
        onClick={onClose}
      />
      <div className="relative bg-white border border-slate-300 rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Delete User: {selectedUser.full_name}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Current Status:</span>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                selectedUser.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                  : 'bg-rose-100 text-rose-700 border border-rose-300'
              }`}>
                {selectedUser.status}
              </span>
            </div>
            <div>
              <span className="text-sm text-slate-600">Email: {selectedUser.email}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Action
            </label>
            <select
              value={deleteAction}
              onChange={(e) => onActionChange(e.target.value as 'soft_delete' | 'change_status' | 'restore')}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="soft_delete">Soft Delete</option>
              <option value="change_status">Change Status</option>
              <option value="restore">Restore</option>
            </select>
          </div>

          {deleteAction === 'change_status' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Status
              </label>
              <select
                value={deleteStatus}
                onChange={(e) => onStatusChange(e.target.value as 'active' | 'inactive' | 'suspended')}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter reason for this action..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 rounded-lg transition-all shadow-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
