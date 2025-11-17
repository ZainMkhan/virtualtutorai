import React from 'react';
import { getStatusBadgeColor, getUsagePercentage, getUsageColor } from '../types';
import type { AdminUserSubscription } from '../../../../services/api';

interface UsageBarProps {
  used: number;
  limit: number;
}

const UsageBar: React.FC<UsageBarProps> = ({ used, limit }) => {
  const percentage = getUsagePercentage(used, limit);

  return (
    <div>
      <div className="text-sm text-gray-900">
        {used}/{limit}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className={`inline-flex text-xs font-semibold rounded px-1 mt-1 ${getUsageColor(percentage)}`}>
        {percentage}%
      </span>
    </div>
  );
};

interface UserSubscriptionRowProps {
  user: AdminUserSubscription;
}

const UserSubscriptionRow: React.FC<UserSubscriptionRowProps> = ({ user }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{user.username}</div>
        <div className="text-xs text-gray-500">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{user.subscription?.tier_name || 'N/A'}</div>
        <div className="text-xs">
          <span className={`inline-flex px-2 py-0.5 rounded-full ${getStatusBadgeColor(user.subscription?.status || 'inactive')}`}>
            {user.subscription?.status || 'inactive'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.subscription?.days_until_renewal || 'N/A'} days</div>
        <div className="text-xs text-gray-500">
          {user.subscription?.current_period_end ? new Date(user.subscription.current_period_end).toLocaleDateString() : 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {user.usage ? <UsageBar used={user.usage.messages_sent} limit={user.usage.messages_limit} /> : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {user.usage ? <UsageBar used={user.usage.conversations_used} limit={user.usage.conversations_limit} /> : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {user.usage ? <UsageBar used={user.usage.interactive_minutes_used} limit={user.usage.interactive_minutes_limit} /> : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {user.usage ? <UsageBar used={user.usage.video_minutes_used} limit={user.usage.video_minutes_limit} /> : 'N/A'}
      </td>
    </tr>
  );
};

export default UserSubscriptionRow;
