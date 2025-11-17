import { adminAPI, type AdminUserSubscription, type AdminUsersSubscriptionsFilterParams } from '../../../services/api';
import type { SubscriptionFilters } from './types';

export const fetchUsersWithSubscriptions = async (
  filters: SubscriptionFilters,
  pageNum: number,
  pageSize: number
) => {
  const queryFilters: AdminUsersSubscriptionsFilterParams = {
    page: pageNum,
    page_size: pageSize,
  };

  if (filters.status) queryFilters.status = filters.status as any;
  if (filters.tier_id) queryFilters.tier_id = filters.tier_id;
  if (filters.search) queryFilters.search = filters.search;

  const response = await adminAPI.getAllUsersSubscriptions(queryFilters);
  return response;
};

export const exportUsersToCSV = (users: AdminUserSubscription[]): void => {
  const headers = [
    'Username',
    'Email',
    'Full Name',
    'Status',
    'Tier Name',
    'Tier Status',
    'Days Until Renewal',
    'Messages Used/Limit',
    'Conversations Used/Limit',
    'Interactive Minutes Used/Limit',
    'Video Minutes Used/Limit',
    'Joined Date',
  ];

  const rows = users.map(user => [
    user.username,
    user.email,
    `${user.first_name} ${user.last_name}`,
    user.status,
    user.subscription?.tier_name || 'N/A',
    user.subscription?.status || 'N/A',
    user.subscription?.days_until_renewal?.toString() || 'N/A',
    user.usage ? `${user.usage.messages_sent}/${user.usage.messages_limit}` : 'N/A',
    user.usage ? `${user.usage.conversations_used}/${user.usage.conversations_limit}` : 'N/A',
    user.usage ? `${user.usage.interactive_minutes_used}/${user.usage.interactive_minutes_limit}` : 'N/A',
    user.usage ? `${user.usage.video_minutes_used}/${user.usage.video_minutes_limit}` : 'N/A',
    user.date_joined,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `users-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
