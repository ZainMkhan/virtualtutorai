import React from 'react';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Video, RefreshCw } from 'lucide-react';

interface UsageData {
  messages_sent: number;
  messages_limit: number;
  interactive_minutes_used: number;
  interactive_minutes_limit: number;
}

interface UsageIndicatorProps {
  usage?: UsageData;
  tierName?: string;
  isCollapsed?: boolean;
  onRefresh?: () => Promise<void>;
}

const UsageIndicator: React.FC<UsageIndicatorProps> = ({ 
  usage, 
  tierName = 'Free',
  isCollapsed = false,
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Log for debugging
  console.log('UsageIndicator received:', { usage, tierName, isCollapsed });

  // Always show something, even if usage data is loading
  const displayUsage = usage || {
    messages_sent: 0,
    messages_limit: tierName === 'Free' ? 50 : 500,
    interactive_minutes_used: 0,
    interactive_minutes_limit: tierName === 'Free' ? 1 : 60,
  };

  console.log('DisplayUsage:', displayUsage);

  const conversationPercentage = displayUsage.messages_limit > 0 
    ? Math.round((displayUsage.messages_sent / displayUsage.messages_limit) * 100)
    : 0;
  
  const videoPercentage = displayUsage.interactive_minutes_limit > 0
    ? Math.round((displayUsage.interactive_minutes_used / displayUsage.interactive_minutes_limit) * 100)
    : 0;

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="border-t border-gray-200 p-4 space-y-3">
      {/* Header */}
      {!isCollapsed && (
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-700">
            Usage • {tierName}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Refresh usage data"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Messages Usage */}
      {!isCollapsed && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-xs text-gray-700">Messages</span>
            </div>
            <span className={`text-xs font-semibold ${getPercentageColor(conversationPercentage)}`}>
              {conversationPercentage}%
            </span>
          </div>
          <Progress 
            value={conversationPercentage} 
            className="h-1.5"
          />
          <p className="text-xs text-gray-500">
            {displayUsage.messages_sent} of {displayUsage.messages_limit}
          </p>
        </div>
      )}

      {/* Interactive Minutes Usage */}
      {!isCollapsed && displayUsage.interactive_minutes_limit > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-xs text-gray-700">Interactive Minutes</span>
            </div>
            <span className={`text-xs font-semibold ${getPercentageColor(videoPercentage)}`}>
              {videoPercentage}%
            </span>
          </div>
          <Progress 
            value={videoPercentage}
            className="h-1.5"
          />
          <p className="text-xs text-gray-500">
            {displayUsage.interactive_minutes_used} of {displayUsage.interactive_minutes_limit} mins
          </p>
        </div>
      )}

      {/* Upgrade CTA - Only if not Free and approaching limit */}
      {!isCollapsed && conversationPercentage >= 80 && tierName !== 'Free' && (
        <div className="pt-2 mt-2 border-t border-gray-100">
          <button className="w-full text-xs py-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ⬆️ Upgrade Plan
          </button>
        </div>
      )}

      {/* Collapsed View - Show mini indicators */}
      {isCollapsed && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${conversationPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 font-semibold">{conversationPercentage}%</span>
        </div>
      )}
    </div>
  );
};

export default UsageIndicator;
