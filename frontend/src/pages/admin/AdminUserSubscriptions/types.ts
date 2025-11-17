export interface SubscriptionFilters {
  page: number;
  page_size: number;
  status: string;
  tier_id: string;
  search: string;
}

export const INITIAL_FILTERS: SubscriptionFilters = {
  page: 1,
  page_size: 20,
  status: '',
  tier_id: '',
  search: '',
};

export const getStatusBadgeColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    'past_due': 'bg-orange-100 text-orange-800',
    canceled: 'bg-red-100 text-red-800',
    incomplete: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getUsagePercentage = (used: number, limit: number): number => {
  return limit > 0 ? Math.round((used / limit) * 100) : 0;
};

export const getUsageColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-red-100 text-red-800';
  if (percentage >= 70) return 'bg-orange-100 text-orange-800';
  if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};
