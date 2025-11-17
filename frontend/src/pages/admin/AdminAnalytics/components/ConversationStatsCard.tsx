import React from 'react';
import type { ConversationStatsResponse } from '../../../../services/api';
import { MessageSquare, MessageCircle } from 'lucide-react';

interface ConversationStatsCardProps {
  data: ConversationStatsResponse | null;
  loading: boolean;
  error: boolean;
}

const ConversationStatsCard: React.FC<ConversationStatsCardProps> = ({ data, loading, error }) => {
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
        <p className="text-red-600 font-medium">Failed to load conversation statistics</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <MessageSquare className="h-5 w-5 text-emerald-600" />
        <span>Conversation Statistics</span>
      </h2>

      <div className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 p-4 rounded">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{data?.total_conversations ?? 0}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{data?.active_conversations ?? 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-600 text-sm">Archived</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{data?.archived_conversations ?? 0}</p>
          </div>
        </div>

        {/* Message Breakdown */}
        <div>
          <p className="text-gray-700 font-medium mb-3 flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-blue-600" />
            <span>Message Breakdown</span>
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
              <span className="text-sm text-gray-700">Gemini AI</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${data?.total_messages && data.total_messages > 0 ? (((data.message_breakdown?.gemini ?? 0) / data.total_messages) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900 w-12 text-right">
                  {data?.total_messages && data.total_messages > 0 ? (((data.message_breakdown?.gemini ?? 0) / data.total_messages) * 100).toFixed(0) : '0'}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
              <span className="text-sm text-gray-700">HeyGen Avatar</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{
                      width: `${data?.total_messages && data.total_messages > 0 ? (((data.message_breakdown?.heygen ?? 0) / data.total_messages) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900 w-12 text-right">
                  {data?.total_messages && data.total_messages > 0 ? (((data.message_breakdown?.heygen ?? 0) / data.total_messages) * 100).toFixed(0) : '0'}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded">
              <span className="text-sm text-gray-700">User Input</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-cyan-600 h-2 rounded-full"
                    style={{
                      width: `${data?.total_messages && data.total_messages > 0 ? (((data.message_breakdown?.user_input ?? 0) / data.total_messages) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900 w-12 text-right">
                  {data?.total_messages && data.total_messages > 0 ? (((data.message_breakdown?.user_input ?? 0) / data.total_messages) * 100).toFixed(0) : '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Metrics */}
        <div className="border-t pt-4">
          <p className="text-gray-700 font-medium mb-3">Time Metrics</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 p-3 rounded">
              <p className="text-xs text-gray-600">Today</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{data?.time_metrics?.conversations_today ?? 0}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded">
              <p className="text-xs text-gray-600">This Week</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{data?.time_metrics?.conversations_week ?? 0}</p>
            </div>
          </div>
        </div>

        {/* User Metrics */}
        <div>
          <p className="text-gray-700 font-medium mb-3">User Metrics</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-3 rounded">
              <p className="text-xs text-gray-600">Avg per User</p>
              <p className="text-lg font-bold text-indigo-600 mt-1">
                {data?.user_metrics?.avg_conversations?.toFixed(1) ?? '0'}
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded">
              <p className="text-xs text-gray-600">Max per User</p>
              <p className="text-lg font-bold text-indigo-600 mt-1">
                {data?.user_metrics?.max_conversations ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationStatsCard;
