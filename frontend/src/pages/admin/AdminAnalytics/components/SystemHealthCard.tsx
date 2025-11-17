import React from 'react';
import type { SystemHealthResponse } from '../../../../services/api';
import { Activity, AlertTriangle, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface SystemHealthCardProps {
  data: SystemHealthResponse | null;
  loading: boolean;
  error: boolean;
}

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ data, loading, error }) => {
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

  if (error || !data || !data.metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <p className="text-red-600 font-medium">Failed to load system health</p>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (!data) return <Activity className="h-12 w-12 text-gray-500" />;
    switch (data.status) {
      case 'healthy':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Activity className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (!data) return 'bg-gray-50 border-gray-200';
    switch (data.status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = () => {
    if (!data) return 'text-gray-600';
    if (data.health_score >= 90) return 'text-green-600';
    if (data.health_score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border ${getStatusColor()}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Activity className="h-5 w-5 text-purple-600" />
        <span>System Health</span>
      </h2>

      <div className="space-y-6">
        {/* Health Score */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Overall Health Score</p>
            <p className={`text-4xl font-bold mt-2 ${getScoreColor()}`}>{data?.health_score ?? 'N/A'}%</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">Status: {data?.status ?? 'unknown'}</p>
          </div>
          {getStatusIcon()}
        </div>

        {/* Key Metrics */}
        <div className="border-t pt-4">
          <p className="text-gray-700 font-medium mb-3">Performance Metrics</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border">
              <p className="text-xs text-gray-600">Error Rate</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {data?.metrics?.error_rate_percent?.toFixed(2) ?? 'N/A'}%
              </p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-xs text-gray-600">Avg Response Time</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {data?.metrics?.avg_response_time_ms ?? 'N/A'}ms
              </p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-xs text-gray-600">Active Users</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {data?.metrics?.active_users ?? 'N/A'}
              </p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-xs text-gray-600">DB Connections</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {data?.metrics?.database_connections ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="border-t pt-4">
          <p className="text-gray-700 font-medium mb-3 flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Alert Summary</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            {(data?.metrics?.critical_errors ?? 0) > 0 && (
              <div className="bg-red-100 p-3 rounded">
                <p className="text-xs text-red-700 font-medium">Critical Errors</p>
                <p className="text-lg font-bold text-red-700 mt-1">
                  {data?.metrics?.critical_errors ?? 'N/A'}
                </p>
              </div>
            )}
            {(data?.metrics?.warnings ?? 0) > 0 && (
              <div className="bg-yellow-100 p-3 rounded">
                <p className="text-xs text-yellow-700 font-medium">Warnings</p>
                <p className="text-lg font-bold text-yellow-700 mt-1">
                  {data?.metrics?.warnings ?? 'N/A'}
                </p>
              </div>
            )}
            {(data?.metrics?.critical_errors ?? 0) === 0 && (data?.metrics?.warnings ?? 0) === 0 && (
              <div className="bg-green-100 p-3 rounded col-span-2">
                <p className="text-xs text-green-700 font-medium">✓ All Systems Normal</p>
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-500 text-center pt-4 border-t">
          Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown'}
        </p>
      </div>
    </div>
  );
};

export default SystemHealthCard;
