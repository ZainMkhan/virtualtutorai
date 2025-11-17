import React from 'react';
import type { UserStatsResponse } from '../../../../services/api';
import { Users, TrendingUp, UserPlus } from 'lucide-react';

interface UserStatsCardProps {
  data: UserStatsResponse | null;
  loading: boolean;
  error: boolean;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <p className="text-red-600 font-medium">Failed to load user statistics</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Users className="h-5 w-5 text-blue-600" />
        <span>User Statistics</span>
      </h2>

      <div className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.total_users ?? 0}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Users</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{data?.active_users ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              {data?.total_users && data.total_users > 0 ? ((data.active_users / data.total_users) * 100).toFixed(1) : '0'}% active
            </p>
          </div>
        </div>

        {/* New Users */}
        <div>
          <p className="text-gray-700 font-medium mb-3 flex items-center space-x-2">
            <UserPlus className="h-4 w-4 text-emerald-600" />
            <span>New Users</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 p-3 rounded">
              <p className="text-xs text-gray-600">Today</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">{data?.new_users?.today ?? 0}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded">
              <p className="text-xs text-gray-600">This Week</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">{data?.new_users?.week ?? 0}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded">
              <p className="text-xs text-gray-600">This Month</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">{data?.new_users?.month ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div>
          <p className="text-gray-700 font-medium mb-3">Subscription Breakdown</p>
          <div className="space-y-2">
            {(data?.subscription_breakdown ?? []).map((tier) => (
              <div key={tier.tier__display_name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{tier.tier__display_name ?? 'Unknown'}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${data?.total_users && data.total_users > 0 ? (tier.count / data.total_users) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900 w-12 text-right">{tier.count ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Metrics */}
        <div className="border-t pt-4">
          <p className="text-gray-700 font-medium mb-3 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Usage Metrics</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">Avg Messages/User</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                {data?.avg_messages_per_user?.toFixed(1) ?? '0'}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">Total Messages</p>
              <p className="text-lg font-bold text-blue-600 mt-1">{data?.total_messages ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCard;
