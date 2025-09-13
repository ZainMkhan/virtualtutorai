import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, avatarAPI, type UserProfile, type Avatar } from '../../services/api';
import Logo from '../../components/Logo';
import UserMenu from '../../components/user/UserMenu';
import { Bot, Tag, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
        setError('Failed to load profile data');
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
        setAvatarsError(response.message || 'Failed to load avatars');
      }
    } catch (error: any) {
      setAvatarsError('Failed to load avatars');
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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <nav className="bg-white shadow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="md" showText={true} textColor="text-gray-900" />
              <span className="ml-2 text-xl font-semibold">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {userProfile?.full_name || user?.email} ({user?.role})
              </span>
              <UserMenu userProfile={userProfile} />
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="w-full py-6">
          {/* Avatars Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Bot className="h-6 w-6 mr-2 text-blue-600" />
                  Interactive AI Avatars
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Click on any avatar to start an interactive conversation
                </p>
              </div>
            </div>

            {avatarsError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                {avatarsError}
              </div>
            )}

            {avatarsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading avatars...</span>
              </div>
            ) : avatars.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interactive avatars available</h3>
                <p className="text-gray-500">No AI avatars have been created yet. Contact your administrator to set up interactive avatars.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-105"
                    onClick={() => handleAvatarClick(avatar.id)}
                    title={`Click to start interacting with ${avatar.name}`}
                  >
                    <div className="aspect-square mb-4 bg-gray-200 rounded-lg overflow-hidden">
                      {avatar.preview_image ? (
                        <img
                          src={avatar.preview_image}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bot className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 truncate" title={avatar.name}>
                        {avatar.name}
                      </h4>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Tag className="h-4 w-4 mr-1" />
                        <span className="truncate">{avatar.category}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          avatar.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {avatar.is_active ? 'Active' : 'Inactive'}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAvatarClick(avatar.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Open avatar interaction"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>


    </div>
  );
};

export default Dashboard;