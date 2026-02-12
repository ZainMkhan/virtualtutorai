import React from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  canSendMessage,
  canCreateConversation,
  canUseInteractiveAvatar,
} from '@/utils/limitChecker';

interface LimitWarningBannerProps {
  messagesSent: number;
  messagesLimit: number;
  conversationsUsed: number;
  conversationsLimit: number;
  interactiveMinutesUsed: number;
  interactiveMinutesLimit: number;
  onDismiss?: () => void;
}

const LimitWarningBanner: React.FC<LimitWarningBannerProps> = ({
  messagesSent,
  messagesLimit,
  conversationsUsed,
  conversationsLimit,
  interactiveMinutesUsed,
  interactiveMinutesLimit,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const messageCheck = canSendMessage(messagesSent, messagesLimit);
  const conversationCheck = canCreateConversation(conversationsUsed, conversationsLimit);
  const interactiveCheck = canUseInteractiveAvatar(interactiveMinutesUsed, interactiveMinutesLimit);

  // Find the most critical warning
  let criticalLimit = null;
  if (!messageCheck.canProceed) {
    criticalLimit = { type: 'messages', check: messageCheck };
  } else if (!conversationCheck.canProceed) {
    criticalLimit = { type: 'conversations', check: conversationCheck };
  } else if (!interactiveCheck.canProceed) {
    criticalLimit = { type: 'interactive', check: interactiveCheck };
  }

  if (!criticalLimit) {
    return null;
  }

  const typeLabel = criticalLimit.type === 'messages' ? t('dashboard.messages') : criticalLimit.type === 'conversations' ? t('dashboard.conversations') : t('dashboard.interactive_minutes');

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            {t('dashboard.limit_reached')}: {typeLabel}
          </h3>
          <p className="text-sm text-red-700 mb-2">
            {criticalLimit.check.message}
          </p>
          <p className="text-xs text-red-600">
            {t('dashboard.upgrade_subscription')}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-500 flex-shrink-0"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

interface UsageProgressProps {
  label: string;
  used: number;
  limit: number;
  icon: React.ReactNode;
  compact?: boolean;
}

const UsageProgress: React.FC<UsageProgressProps> = ({
  label,
  used,
  limit,
  icon,
  compact = false,
}) => {
  const { t } = useTranslation();
  // Handle unlimited
  if (limit === 0) {
    return (
      <div className={`${compact ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
              {label}
            </span>
          </div>
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-green-600`}>
            {t('dashboard.unlimited')}
          </span>
        </div>
      </div>
    );
  }

  const percentage = (used / limit) * 100;
  const warningLevel = percentage >= 90 ? 'critical' : percentage >= 70 ? 'warning' : 'none';
  const barColor =
    warningLevel === 'critical'
      ? 'bg-red-500'
      : warningLevel === 'warning'
      ? 'bg-yellow-500'
      : 'bg-green-500';

  return (
    <div className={`${compact ? 'mb-2' : 'mb-4'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
            {label}
          </span>
        </div>
        <span
          className={`${compact ? 'text-xs' : 'text-sm'} font-semibold ${
            warningLevel === 'critical'
              ? 'text-red-600'
              : warningLevel === 'warning'
              ? 'text-yellow-600'
              : 'text-gray-600'
          }`}
        >
          {used} / {limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {compact && warningLevel !== 'none' && (
        <p className={`text-xs mt-1 ${warningLevel === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
          {warningLevel === 'critical' ? '⚠️ Limit reached!' : `⚠️ ${t('dashboard.percent_used', { percent: percentage.toFixed(0) })}`}
        </p>
      )}
    </div>
  );
};

interface UsageDashboardProps {
  messagesSent: number;
  messagesLimit: number;
  conversationsUsed: number;
  conversationsLimit: number;
  interactiveMinutesUsed: number;
  interactiveMinutesLimit: number;
  compact?: boolean;
}

const UsageDashboard: React.FC<UsageDashboardProps> = ({
  messagesSent,
  messagesLimit,
  conversationsUsed,
  conversationsLimit,
  interactiveMinutesUsed,
  interactiveMinutesLimit,
  compact = false,
}) => {
  const { t } = useTranslation();
  return (
    <div className={`bg-white rounded-lg ${compact ? 'p-3' : 'p-4'} ${compact ? '' : 'border border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>
          {t('dashboard.this_months_usage')}
        </h3>
      </div>

      <UsageProgress
        label={t('dashboard.messages')}
        used={messagesSent}
        limit={messagesLimit}
        icon={<div className="h-3 w-3 bg-blue-500 rounded-full" />}
        compact={compact}
      />

      <UsageProgress
        label={t('dashboard.conversations')}
        used={conversationsUsed}
        limit={conversationsLimit}
        icon={<div className="h-3 w-3 bg-purple-500 rounded-full" />}
        compact={compact}
      />

      <UsageProgress
        label={t('dashboard.interactive_minutes')}
        used={interactiveMinutesUsed}
        limit={interactiveMinutesLimit}
        icon={<div className="h-3 w-3 bg-orange-500 rounded-full" />}
        compact={compact}
      />
    </div>
  );
};

export { LimitWarningBanner, UsageDashboard, UsageProgress };
