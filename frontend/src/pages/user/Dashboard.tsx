import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { userAPI, avatarAPI, type UserProfile, type Avatar } from '../../services/api';
import UserMenu from '../../components/user/UserMenu';
import LanguageSwitcher from '../../components/shared/LanguageSwitcher';
import DashboardSidebar from '../../components/user/DashboardSidebar';
import { UsageDashboard } from '../../components/shared/LimitWarnings';
import { Bot, Tag, ArrowRight, Sparkles, Crown } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const Dashboard: React.FC = () => {
  const { user, currentSubscription, usageData } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Avatar-related state
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [avatarsLoading, setAvatarsLoading] = useState(true);
  const [avatarsError, setAvatarsError] = useState<string | null>(null);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.user_id) return;
      
      try {
        setLoading(true);
        const response = await userAPI.getUserProfile(user.user_id);
        
        if (response.success) {
          setUserProfile(response.data);
        }
      } catch (error: any) {
        setError(t('errors.something_went_wrong'));
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.user_id]);

  // Fetch avatars
  const fetchAvatars = async () => {
    try {
      setAvatarsLoading(true);
      setAvatarsError(null);
      const response = await avatarAPI.getAllAvatars(1, 50); // Get all avatars
      
      if (response.success) {
        setAvatars(response.data.results);
      } else {
        setAvatarsError(response.message || t('errors.failed_to_load_avatars'));
      }
    } catch (error: any) {
      setAvatarsError(t('errors.failed_to_load_avatars'));
      console.error('Avatars fetch error:', error);
    } finally {
      setAvatarsLoading(false);
    }
  };

  // Fetch avatars on component mount
  useEffect(() => {
    fetchAvatars();
  }, []);

  // Handle avatar click to navigate to interaction page
  const handleAvatarClick = (avatarId: string) => {
    navigate(`/avatar/${avatarId}`);
  };



  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar */}
        <DashboardSidebar onNavigate={() => {}} />

        {/* Main Content Column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Navigation Bar */}
          <nav className="bg-white shadow-sm w-full h-16 flex-shrink-0 border-b border-gray-200">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
              <div className="flex justify-between items-center h-full">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="lg:hidden" />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 text-sm hidden md:inline">
                    Welcome, <span className="font-medium">{userProfile?.full_name || user?.email}</span>
                  </span>
                  <LanguageSwitcher />
                  <UserMenu userProfile={userProfile} />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto custom-scrollbar w-full">
          <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
                  <p className="font-medium">{t('common.error')}</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Avatars Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{t('dashboard.available_avatars')}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{avatars.length}</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Bot className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Active Tutors Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{t('dashboard.active_tutors')}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {avatars.filter(a => a.is_active).length}
                      </p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3">
                      <Sparkles className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/subscription')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{t('navigation.subscription')}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2 capitalize">
                        {currentSubscription?.tierName || t('common.free')}
                      </p>
                      <p className="text-xs text-green-600 mt-1 font-medium">{t('avatars.active')}</p>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Crown className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Dashboard */}
              {usageData && (
                <div className="mt-8">
                  <UsageDashboard
                    messagesSent={usageData.messages_sent}
                    messagesLimit={usageData.messages_limit}
                    conversationsUsed={usageData.conversations_used || 0}
                    conversationsLimit={usageData.conversations_limit || 0}
                    interactiveMinutesUsed={usageData.interactive_minutes_used}
                    interactiveMinutesLimit={usageData.interactive_minutes_limit}
                  />
                </div>
              )}

              {/* Avatars Section */}
              <div id="avatars" className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
            {/* Section Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Bot className="h-6 w-6 mr-3 text-blue-600" />
                    {t('avatars.title')}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {t('dashboard.click_to_interact')}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Content */}
            <div className="p-6">
              {avatarsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  <p className="font-medium">{t('avatars.failed_to_load')}</p>
                  <p className="text-sm">{avatarsError}</p>
                </div>
              )}

              {avatarsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 font-medium">{t('avatars.loading_avatars')}</span>
                </div>
              ) : avatars.length === 0 ? (
                <div className="text-center py-16">
                  <Bot className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('dashboard.no_avatars')}
                  </h3>
                  <p className="text-gray-600">
                    {t('dashboard.avatars_setup')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                      onClick={() => handleAvatarClick(avatar.id)}
                      title={`Click to interact with ${avatar.name}`}
                    >
                      {/* Image Container */}
                      <div className="aspect-square mb-0 bg-gray-200 overflow-hidden relative">
                        {avatar.preview_image ? (
                          <img
                            src={avatar.preview_image}
                            alt={avatar.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                            <Bot className="h-12 w-12 text-blue-400" />
                          </div>
                        )}
                        
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white rounded-full p-3 shadow-lg">
                            <ArrowRight className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <div className="space-y-3">
                          {/* Avatar Name */}
                          <div>
                            <h4 className="font-semibold text-gray-900 truncate text-base" title={avatar.name}>
                              {avatar.name}
                            </h4>
                          </div>

                          {/* Category */}
                          <div className="flex items-center text-sm text-gray-500 space-x-1">
                            <Tag className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{avatar.category}</span>
                          </div>

                          {/* Status Badge and Action */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              avatar.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {avatar.is_active ? `● ${t('avatars.active')}` : `○ ${t('avatars.inactive')}`}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAvatarClick(avatar.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                              aria-label={`Open ${avatar.name}`}
                            >
                              <ArrowRight className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
            </div>
          </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;