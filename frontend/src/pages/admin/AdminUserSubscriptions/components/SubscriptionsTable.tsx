import React from 'react';
import UserSubscriptionRow from './UserSubscriptionRow';
import type { AdminUserSubscription } from '../../../../services/api';

interface SubscriptionsTableProps {
  users: AdminUserSubscription[];
}

const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ users }) => {
  return (
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
          {users.map((user) => (
            <UserSubscriptionRow key={user.user_id} user={user} />
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No users found</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsTable;
