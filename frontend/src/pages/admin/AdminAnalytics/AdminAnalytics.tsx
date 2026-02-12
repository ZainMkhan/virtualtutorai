import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsAPI, type UserStatsResponse, type ConversationStatsResponse, type RevenueStatsResponse } from '../../../services/api';
import { BarChart3, TrendingUp, Users, MessageSquare } from 'lucide-react';
import UserStatsCard from './components/UserStatsCard.tsx';
import ConversationStatsCard from './components/ConversationStatsCard.tsx';
import RevenueStatsCard from './components/RevenueStatsCard.tsx';

interface AnalyticsData {
  userStats: UserStatsResponse | null;
  conversationStats: ConversationStatsResponse | null;
  revenueStats: RevenueStatsResponse | null;
}

interface LoadingState {
  userStats: boolean;
  conversationStats: boolean;
  revenueStats: boolean;
}

const AdminAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<LoadingState>({
    userStats: true,
    conversationStats: true,
    revenueStats: true,
  });

  const [errors, setErrors] = useState<LoadingState>({
    userStats: false,
    conversationStats: false,
    revenueStats: false,
  });

  const [data, setData] = useState<AnalyticsData>({
    userStats: null,
    conversationStats: null,
    revenueStats: null,
  });

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch User Stats
        try {
          const userStats = await analyticsAPI.getUserStats();
          setData(prev => ({ ...prev, userStats }));
        } catch (error) {
          console.error('Failed to fetch user stats:', error);
          setErrors(prev => ({ ...prev, userStats: true }));
        } finally {
          setLoading(prev => ({ ...prev, userStats: false }));
        }

        // Fetch Conversation Stats
        try {
          const conversationStats = await analyticsAPI.getConversationStats();
          setData(prev => ({ ...prev, conversationStats }));
        } catch (error) {
          console.error('Failed to fetch conversation stats:', error);
          setErrors(prev => ({ ...prev, conversationStats: true }));
        } finally {
          setLoading(prev => ({ ...prev, conversationStats: false }));
        }

        // Fetch Revenue Stats
        try {
          const revenueStats = await analyticsAPI.getRevenueStats();
          setData(prev => ({ ...prev, revenueStats }));
        } catch (error) {
          console.error('Failed to fetch revenue stats:', error);
          setErrors(prev => ({ ...prev, revenueStats: true }));
        } finally {
          setLoading(prev => ({ ...prev, revenueStats: false }));
        }
      } catch (error) {
        console.error('Unexpected error in analytics fetch:', error);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading.userStats ? '...' : data.userStats?.total_users || 0}
              </p>
            </div>
            <Users className="h-12 w-12 text-blue-100" />
          </div>
          {!loading.userStats && data.userStats && (
            <p className="text-xs text-gray-500 mt-4">
              {data.userStats.active_users} active users
            </p>
          )}
        </div>

        {/* Total Conversations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Conversations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading.conversationStats ? '...' : data.conversationStats?.total_conversations || 0}
              </p>
            </div>
            <MessageSquare className="h-12 w-12 text-emerald-100" />
          </div>
          {!loading.conversationStats && data.conversationStats && (
            <p className="text-xs text-gray-500 mt-4">
              {data.conversationStats.active_conversations} active
            </p>
          )}
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${loading.revenueStats ? '...' : (data.revenueStats?.total_revenue || 0).toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-amber-100" />
          </div>
          {!loading.revenueStats && data.revenueStats && (
            <p className="text-xs text-gray-500 mt-4">
              MRR: ${data.revenueStats.mrr.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserStatsCard
          data={data.userStats}
          loading={loading.userStats}
          error={errors.userStats}
        />

        <ConversationStatsCard
          data={data.conversationStats}
          loading={loading.conversationStats}
          error={errors.conversationStats}
        />

        <RevenueStatsCard
          data={data.revenueStats}
          loading={loading.revenueStats}
          error={errors.revenueStats}
        />
      </div>
    </div>
  );
};

export default AdminAnalytics;
