export type ActivityLog = {
  id: string;
  created_at: string;
  user_email: string;
  action: string;
  action_display?: string;
  resource_type: string;
  resource_id?: string;
  status: string;
  description: string;
};

export type ActivityLogsFilterParams = {
  page: number;
  page_size: number;
  action?: string;
  resource_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
};

export const ACTION_TYPES = [
  'login',
  'message_sent',
  'conversation_created',
  'payment_initiated',
  'subscription_upgrade',
  'limit_override',
  'usage_reset',
  'tier_created',
  'tier_updated',
  'tier_deleted',
] as const;

export const RESOURCE_TYPES = [
  'subscription',
  'message',
  'conversation',
  'payment',
  'user',
  'tier',
] as const;

export const INITIAL_FILTERS: ActivityLogsFilterParams = {
  page: 1,
  page_size: 20,
  action: '',
  resource_type: '',
  user_id: '',
  start_date: '',
  end_date: '',
};
