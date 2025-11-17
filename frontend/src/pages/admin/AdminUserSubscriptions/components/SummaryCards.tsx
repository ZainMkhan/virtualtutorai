import React from 'react';
import type { AdminUserSubscription } from '../../../services/api';

interface SummaryCardsProps {
  totalUsers: number;
  users: AdminUserSubscription[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalUsers, users }) => {
  const getUsagePercentage = (used: number, limit: number): number => {
    return limit > 0 ? Math.round((used / limit) * 100) : 0;
  };

  const highUsageCount = users.filter(
    u => u.usage && getUsagePercentage(u.usage.messages_sent, u.usage.messages_limit) >= 80
  ).length;

  const activeSubscriptions = users.filter(u => u.subscription?.status === 'active').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-xs font-medium text-gray-600">Total Users</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{totalUsers}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-xs font-medium text-gray-600">Active Subscriptions</p>
        <p className="text-2xl font-bold text-green-600 mt-1">{activeSubscriptions}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-xs font-medium text-gray-600">High Usage Alerts</p>
        <p className="text-2xl font-bold text-orange-600 mt-1">{highUsageCount}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
