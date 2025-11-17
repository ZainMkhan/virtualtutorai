import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, Loader2 } from 'lucide-react';
import { avatarAPI, type Avatar } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/shared/Logo';
import UserMenu from '../../components/user/UserMenu';
import ModeToggle from './components/ModeToggle';
import AvatarMode from './components/AvatarMode';
import ChatMode from './components/ChatMode';

const AvatarInteraction: React.FC = () => {
  const { avatarId } = useParams<{ avatarId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'avatar' | 'chat'>('avatar');

  useEffect(() => {
    if (avatarId) {
      fetchAvatar(avatarId);
    }
  }, [avatarId]);

  const fetchAvatar = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await avatarAPI.getAvatar(id);
      
      if (response.success) {
        setAvatar(response.data);
      } else {
        setError(response.message || 'Failed to load avatar');
      }
    } catch (error: any) {
      setError('Failed to load avatar');
      console.error('Avatar fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: 'avatar' | 'chat') => {
    setCurrentMode(mode);
    if (mode === 'chat') {
      const existingEmbed = document.getElementById('heygen-streaming-embed');
      if (existingEmbed) {
        existingEmbed.remove();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading avatar...</p>
        </div>
      </div>
    );
  }

  if (error || !avatar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Avatar Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested avatar could not be found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <Logo size="sm" showText={true} textColor="text-gray-900" />
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{avatar.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ModeToggle 
                currentMode={currentMode} 
                onModeChange={handleModeChange}
                disabled={loading}
              />
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">
                  Welcome, {user?.email}
                </span>
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full h-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="bg-white rounded-lg shadow min-h-[calc(100vh-8rem)]">
            {currentMode === 'avatar' ? (
              <AvatarMode avatar={avatar} isActive={true} />
            ) : (
              <ChatMode avatar={avatar} isActive={true} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AvatarInteraction;