/**
 * Utility for checking and enforcing user subscription limits
 * Prevents users from exceeding their plan's usage limits
 */

export interface SubscriptionLimits {
  conversations_per_month: number;
  messages_per_month: number;
  interactive_minutes_per_month: number;
  max_concurrent_sessions: number;
}

export interface UsageStats {
  conversations_used: number;
  messages_sent: number;
  interactive_minutes_used: number;
  messages_remaining: number;
  interactive_minutes_remaining: number;
}

export interface LimitCheckResult {
  canProceed: boolean;
  limitType?: 'messages' | 'conversations' | 'interactive_minutes';
  currentUsage: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
  message: string;
}

/**
 * Check if user can send a message
 */
export const canSendMessage = (
  messagesSent: number,
  messagesLimit: number
): LimitCheckResult => {
  const remaining = Math.max(0, messagesLimit - messagesSent);
  const percentageUsed = messagesLimit > 0 ? (messagesSent / messagesLimit) * 100 : 0;

  // Allow unlimited if limit is 0
  if (messagesLimit === 0) {
    return {
      canProceed: true,
      currentUsage: messagesSent,
      limit: messagesLimit,
      remaining: Infinity,
      percentageUsed: 0,
      message: 'Unlimited messages available',
    };
  }

  const canProceed = messagesSent < messagesLimit;

  return {
    canProceed,
    limitType: 'messages',
    currentUsage: messagesSent,
    limit: messagesLimit,
    remaining,
    percentageUsed,
    message: canProceed
      ? `You have ${remaining} message${remaining !== 1 ? 's' : ''} remaining this month`
      : `You've reached your message limit of ${messagesLimit} for this month. Upgrade your plan for more.`,
  };
};

/**
 * Check if user can create a new conversation
 */
export const canCreateConversation = (
  conversationsCount: number,
  conversationsLimit: number
): LimitCheckResult => {
  const remaining = Math.max(0, conversationsLimit - conversationsCount);
  const percentageUsed = conversationsLimit > 0 ? (conversationsCount / conversationsLimit) * 100 : 0;

  // Allow unlimited if limit is 0
  if (conversationsLimit === 0) {
    return {
      canProceed: true,
      currentUsage: conversationsCount,
      limit: conversationsLimit,
      remaining: Infinity,
      percentageUsed: 0,
      message: 'Unlimited conversations available',
    };
  }

  const canProceed = conversationsCount < conversationsLimit;

  return {
    canProceed,
    limitType: 'conversations',
    currentUsage: conversationsCount,
    limit: conversationsLimit,
    remaining,
    percentageUsed,
    message: canProceed
      ? `You have ${remaining} conversation${remaining !== 1 ? 's' : ''} remaining this month`
      : `You've reached your conversation limit of ${conversationsLimit} for this month. Upgrade your plan for more.`,
  };
};

/**
 * Check if user can use interactive avatar (use interactive minutes)
 */
export const canUseInteractiveAvatar = (
  minutesUsed: number,
  minutesLimit: number
): LimitCheckResult => {
  const remaining = Math.max(0, minutesLimit - minutesUsed);
  const percentageUsed = minutesLimit > 0 ? (minutesUsed / minutesLimit) * 100 : 0;

  // Allow unlimited if limit is 0
  if (minutesLimit === 0) {
    return {
      canProceed: true,
      currentUsage: minutesUsed,
      limit: minutesLimit,
      remaining: Infinity,
      percentageUsed: 0,
      message: 'Unlimited interactive minutes available',
    };
  }

  const canProceed = minutesUsed < minutesLimit;

  return {
    canProceed,
    limitType: 'interactive_minutes',
    currentUsage: minutesUsed,
    limit: minutesLimit,
    remaining,
    percentageUsed,
    message: canProceed
      ? `You have ${remaining} minute${remaining !== 1 ? 's' : ''} of interactive time remaining this month`
      : `You've reached your interactive minutes limit of ${minutesLimit} for this month. Upgrade your plan for more.`,
  };
};

/**
 * Get warning level based on usage percentage
 */
export const getUsageWarningLevel = (
  percentageUsed: number
): 'none' | 'warning' | 'critical' => {
  if (percentageUsed >= 90) return 'critical';
  if (percentageUsed >= 70) return 'warning';
  return 'none';
};

/**
 * Get color class for usage indicator
 */
export const getUsageColorClass = (
  warningLevel: 'none' | 'warning' | 'critical'
): string => {
  switch (warningLevel) {
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-green-600 bg-green-50';
  }
};

/**
 * Format limit warning message
 */
export const formatLimitWarning = (result: LimitCheckResult): string => {
  const { percentageUsed, message, canProceed } = result;

  if (!canProceed) {
    return `⛔ ${message}`;
  }

  if (percentageUsed >= 90) {
    return `⚠️ CRITICAL: ${message} (${percentageUsed.toFixed(0)}% used)`;
  }

  if (percentageUsed >= 70) {
    return `⚠️ WARNING: ${message} (${percentageUsed.toFixed(0)}% used)`;
  }

  return message;
};

/**
 * Check all limits at once
 */
export const checkAllLimits = (
  messagesSent: number,
  messagesLimit: number,
  conversationsCount: number,
  conversationsLimit: number,
  minutesUsed: number,
  minutesLimit: number
) => {
  return {
    messages: canSendMessage(messagesSent, messagesLimit),
    conversations: canCreateConversation(conversationsCount, conversationsLimit),
    interactiveMinutes: canUseInteractiveAvatar(minutesUsed, minutesLimit),
  };
};

/**
 * Check if any limit is critically close
 */
export const hasAnyLimitWarning = (
  messagesSent: number,
  messagesLimit: number,
  conversationsCount: number,
  conversationsLimit: number,
  minutesUsed: number,
  minutesLimit: number
): boolean => {
  const limits = checkAllLimits(
    messagesSent,
    messagesLimit,
    conversationsCount,
    conversationsLimit,
    minutesUsed,
    minutesLimit
  );

  return (
    getUsageWarningLevel(limits.messages.percentageUsed) !== 'none' ||
    getUsageWarningLevel(limits.conversations.percentageUsed) !== 'none' ||
    getUsageWarningLevel(limits.interactiveMinutes.percentageUsed) !== 'none'
  );
};
