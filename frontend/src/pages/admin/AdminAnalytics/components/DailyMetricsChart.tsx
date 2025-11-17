import React from 'react';
import type { DailyMetricsResponse } from '../../../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface DailyMetricsChartProps {
  data: DailyMetricsResponse | null;
  loading: boolean;
  error: boolean;
}

const DailyMetricsChart: React.FC<DailyMetricsChartProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !data || !data.results || data.results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <p className="text-red-600 font-medium">Failed to load daily metrics</p>
      </div>
    );
  }

  // Sort by date
  const sortedData = [...(data.results ?? [])].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Format data for charts
  const chartData = sortedData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: item.new_users ?? 0,
    active: item.active_users ?? 0,
    conversations: item.new_conversations ?? 0,
    messages: item.total_messages ?? 0,
    revenue: parseFloat(((item.revenue as any)?.toFixed?.(2)) ?? '0'),
    errors: item.errors ?? 0,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <span>Daily Metrics (Last 30 Days)</span>
      </h2>

      <div className="space-y-8">
        {/* User Metrics */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">User Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3b82f6" 
                name="New Users"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="active" 
                stroke="#10b981" 
                name="Active Users"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversation Metrics */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Conversation Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="conversations" fill="#8b5cf6" name="New Conversations" />
              <Bar dataKey="messages" fill="#06b6d4" name="Total Messages" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Metrics */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : value}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f59e0b" 
                name="Daily Revenue"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Error Metrics */}
        {chartData.some(d => d.errors > 0) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">System Errors</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="errors" fill="#ef4444" name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary Stats */}
        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-4">Summary Stats</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-xs text-gray-600">Total New Users</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {chartData.reduce((sum, d) => sum + d.users, 0)}
              </p>
            </div>
            <div className="bg-emerald-50 p-4 rounded">
              <p className="text-xs text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {chartData.reduce((sum, d) => sum + d.conversations, 0)}
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded">
              <p className="text-xs text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                ${chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-xs text-gray-600">Total Errors</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {chartData.reduce((sum, d) => sum + d.errors, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyMetricsChart;
