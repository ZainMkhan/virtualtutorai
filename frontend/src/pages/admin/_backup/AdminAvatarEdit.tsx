import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { avatarAPI } from '../../services/api';
import Logo from '../../components/shared/Logo';
import UserMenu from '../../components/user/UserMenu';
import { ArrowLeft, Bot, Eye, EyeOff } from 'lucide-react';

const AdminAvatarEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'professional' as 'professional' | 'casual' | 'formal' | 'educational',
    quality: 'high' as 'high' | 'medium' | 'low',
    is_active: true,
    avatar_id: '',
    embed_url: '',
    preview_image: '',
    transparent_background: false,
    metadata: {}
  });

  useEffect(() => {
    if (id) {
      fetchAvatar();
    }
  }, [id]);

  const fetchAvatar = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await avatarAPI.getAvatar(id);
      
      if (response.success) {
        const avatar = response.data;
        setFormData({
          name: avatar.name,
          category: avatar.category as any,
          quality: avatar.quality,
          is_active: avatar.is_active,
          avatar_id: avatar.avatar_id,
          embed_url: '', 
          preview_image: avatar.preview_image || '',
          transparent_background: false, 
          metadata: {} 
        });
      } else {
        setError(response.message || 'Failed to fetch avatar');
      }
    } catch (error: any) {
      setError('Failed to fetch avatar');
      console.error('Fetch avatar error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Avatar name is required');
      return;
    }
    
    if (!formData.avatar_id.trim()) {
      setError('Avatar ID is required');
      return;
    }

    if (!formData.embed_url.trim()) {
      setError('Embed URL is required');
      return;
    }

    if (!id) {
      setError('Avatar ID is missing');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await avatarAPI.updateAvatar(id, formData);
      
      if (response.success) {
        setSuccess('Avatar updated successfully!');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        setError(response.message || 'Failed to update avatar');
      }
    } catch (error: any) {
      setError('Failed to update avatar');
      console.error('Update avatar error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading avatar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <Logo size="md" showText={true} textColor="text-gray-900" />
              <span className="ml-2 text-xl font-semibold text-red-600">Edit Avatar</span>
            </div>
            <div className="flex items-center">
              <UserMenu userProfile={null} />
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md mb-6">
              {success}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Edit Avatar</h1>
              <p className="text-gray-600 mt-1">Update avatar information and settings</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* avatar Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* avatar ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar ID *
                  </label>
                  <input
                    type="text"
                    value={formData.avatar_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* embed url */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Embed URL *
                  </label>
                  <textarea
                    value={formData.embed_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, embed_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical"
                    placeholder="Enter embed script or URL..."
                    required
                  />
                </div>

                {/* category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>

                {/* quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    value={formData.quality}
                    onChange={(e) => setFormData(prev => ({ ...prev, quality: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Preview Image url */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Image URL
                </label>
                <input
                  type="url"
                  value={formData.preview_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, preview_image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/preview.jpg"
                />
                {formData.preview_image && (
                  <div className="mt-3">
                    <img
                      src={formData.preview_image}
                      alt="Avatar preview"
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Setting */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.transparent_background}
                    onChange={(e) => setFormData(prev => ({ ...prev, transparent_background: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Transparent Background</span>
                </label>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium ${
                    formData.is_active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {formData.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>{formData.is_active ? 'Active' : 'Inactive'}</span>
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      <span>Update Avatar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAvatarEdit;