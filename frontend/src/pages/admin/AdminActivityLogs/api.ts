import { adminAPI } from '../../../services/api';
import type { ActivityLog, ActivityLogsFilterParams } from './types';

export const fetchActivityLogs = async (filters: ActivityLogsFilterParams) => {
  const response = await adminAPI.getActivityLogs(filters);
  return response;
};

export const getActionBadgeColor = (action: string): string => {
  const colors: { [key: string]: string } = {
    login: 'bg-blue-100 text-blue-800',
    message_sent: 'bg-green-100 text-green-800',
    conversation_created: 'bg-purple-100 text-purple-800',
    payment_initiated: 'bg-yellow-100 text-yellow-800',
    subscription_upgrade: 'bg-indigo-100 text-indigo-800',
    limit_override: 'bg-orange-100 text-orange-800',
    usage_reset: 'bg-red-100 text-red-800',
    tier_created: 'bg-green-100 text-green-800',
    tier_updated: 'bg-blue-100 text-blue-800',
    tier_deleted: 'bg-red-100 text-red-800',
  };
  return colors[action] || 'bg-gray-100 text-gray-800';
};

export const getStatusBadgeColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const exportLogsToCSV = (logs: ActivityLog[]) => {
  try {
    const headers = ['Timestamp', 'User Email', 'Action', 'Resource Type', 'Resource ID', 'Status', 'Description'];
    const rows = logs.map(log => [
      log.timestamp,
      log.user_email,
      log.action,
      log.resource_type,
      log.resource_id || '-',
      log.status,
      log.description,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error('Failed to export logs');
  }
};
