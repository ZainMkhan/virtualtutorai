import React from 'react';
import type { RevenueStatsResponse } from '../../../../services/api';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';

interface RevenueStatsCardProps {
  data: RevenueStatsResponse | null;
  loading: boolean;
  error: boolean;
}

const RevenueStatsCard: React.FC<RevenueStatsCardProps> = ({ data, loading, error }) => {
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
        <p className="text-red-600 font-medium">Failed to load revenue statistics</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <DollarSign className="h-5 w-5 text-amber-600" />
        <span>Revenue Statistics</span>
      </h2>

      <div className="space-y-6">
        {/* Key Revenue Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-amber-50 p-4 rounded">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              ${data?.total_revenue?.toFixed(2) ?? '0.00'}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded">
            <p className="text-gray-600 text-sm">MRR</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ${data?.mrr?.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>

        {/* Recent Revenue */}
        <div>
          <p className="text-gray-700 font-medium mb-3">Recent Revenue</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">Today</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                ${data?.revenue_today?.toFixed(2) ?? '0.00'}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">This Month</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                ${data?.revenue_month?.toFixed(2) ?? '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Metrics */}
        <div className="border-t pt-4">
          <p className="text-gray-700 font-medium mb-3 flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-purple-600" />
            <span>Subscriptions</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-xs text-gray-600">Active Subscriptions</p>
              <p className="text-lg font-bold text-purple-600 mt-1">{data?.active_subscriptions ?? 0}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-xs text-gray-600">Avg Transaction</p>
              <p className="text-lg font-bold text-purple-600 mt-1">
                ${data?.average_transaction?.toFixed(2) ?? '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Revenue by Tier */}
        <div>
          <p className="text-gray-700 font-medium mb-3 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <span>Revenue by Tier</span>
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(data?.revenue_by_tier ?? []).map((tier) => {
              const maxRevenue = Math.max(...(data?.revenue_by_tier?.map(t => t.monthly_revenue) ?? [1]));
              return (
                <div key={tier.tier__display_name} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{tier.tier__display_name ?? 'Unknown'}</span>
                    <span className="text-sm text-gray-600">{tier.count ?? 0} subs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${maxRevenue > 0 ? (tier.monthly_revenue / maxRevenue) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-900 w-24 text-right">
                      ${tier.monthly_revenue?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discounts */}
        {(data?.total_discounts ?? 0) > 0 && (
          <div className="bg-red-50 p-4 rounded border border-red-200">
            <p className="text-sm text-red-800">
              <strong>Total Discounts:</strong> ${data?.total_discounts?.toFixed(2) ?? '0.00'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueStatsCard;
