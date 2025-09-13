import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { avatarAPI, type CreateAvatarRequest } from '../../services/api';
import { parseHeyGenEmbed, generateAvatarId, suggestCategory, formatAvatarName, isValidEmbedSource } from '../../utils/embedParser';
import Logo from '../../components/Logo';
import UserMenu from '../../components/user/UserMenu';
import { Bot, Eye, AlertCircle } from 'lucide-react';

const AdminAvatarCreate: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Form state
  const [embedScript, setEmbedScript] = useState('');
  const [formData, setFormData] = useState({
    category: 'General',
    name: '',
    avatar_id: '',
    embed_url: '',
    preview_image: '',
    quality: 'medium' as 'low' | 'medium' | 'high',
    transparent_background: false,
    metadata: {},
    is_active: true
  });

  const categories = [
    'General',
    'Education',
    'Business',
    'Healthcare',
    'Fitness',
    'Customer Service',
    'Entertainment',
    'Technology',
    'Sales'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleParseEmbed = async () => {
    if (!embedScript.trim()) {
      setParseError('Please paste an embed script first');
      return;
    }

    // Validate embed source
    if (!isValidEmbedSource(embedScript)) {
      setParseError('Embed script must be from a trusted source (HeyGen)');
      return;
    }

    setParsing(true);
    setParseError(null);

    try {
      const parseResult = parseHeyGenEmbed(embedScript);
      
      if (!parseResult.success) {
        setParseError(parseResult.error || 'Failed to parse embed script');
        return;
      }

      const parsedData = parseResult.data!;
      
      // Auto-populate form fields
      setFormData(prev => ({
        ...prev,
        name: formatAvatarName(parsedData.avatarName),
        avatar_id: generateAvatarId(parsedData),
        embed_url: embedScript.trim(),
        preview_image: parsedData.previewImg || '',
        quality: (parsedData.quality as 'low' | 'medium' | 'high') || 'medium',
        transparent_background: !parsedData.needRemoveBackground,
        category: suggestCategory(parsedData.avatarName),
        metadata: parsedData.originalData || {}
      }));

      setSuccessMessage('Embed script parsed successfully! Review the details below and save.');
    } catch (error) {
      setParseError('Unexpected error while parsing embed script');
    } finally {
      setParsing(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Avatar name is required';
    if (!formData.avatar_id.trim()) return 'Avatar ID is required';
    if (!formData.embed_url.trim()) return 'Embed URL is required';
    if (!formData.category) return 'Category is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const createData: CreateAvatarRequest = {
        category: formData.category,
        name: formData.name,
        avatar_id: formData.avatar_id,
        embed_url: formData.embed_url,
        preview_image: formData.preview_image,
        quality: formData.quality,
        transparent_background: formData.transparent_background,
        metadata: formData.metadata,
        is_active: formData.is_active
      };

      const response = await avatarAPI.createAvatar(createData);
      
      if (response.success) {
        setSuccessMessage(`Avatar "${formData.name}" created successfully! Redirecting to dashboard...`);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="md" showText={true} textColor="text-gray-900" />
              <span className="ml-2 text-xl font-semibold text-red-600">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Create Avatar Content */}
      <main className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center space-x-4">
              <Bot className="h-12 w-12 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Avatar</h1>
                <p className="text-gray-600 mt-2">Add a new AI avatar by pasting an embed script</p>
              </div>
            </div>
          </div>

          {/* Embed Parser Section */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Step 1: Parse Embed Script</h2>
              <p className="text-sm text-gray-600 mt-1">Paste your HeyGen embed script below to automatically extract avatar information</p>
            </div>

            <div className="p-6 space-y-4">
              {parseError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{parseError}</span>
                </div>
              )}

              <div>
                <label htmlFor="embedScript" className="block text-sm font-medium text-gray-700 mb-2">
                  Embed Script
                </label>
                <textarea
                  id="embedScript"
                  value={embedScript}
                  onChange={(e) => setEmbedScript(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your HeyGen embed script here..."
                />
              </div>

              <button
                type="button"
                onClick={handleParseEmbed}
                disabled={parsing || !embedScript.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {parsing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    <span>Parse Embed Script</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Avatar Configuration Form */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Step 2: Configure Avatar Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                  {successMessage}
                </div>
              )}

              {/* Preview */}
              {formData.preview_image && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Avatar Preview</span>
                  </h3>
                  <img 
                    src={formData.preview_image} 
                    alt="Avatar Preview" 
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="avatar_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar ID *
                  </label>
                  <input
                    type="text"
                    id="avatar_id"
                    name="avatar_id"
                    value={formData.avatar_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for this avatar</p>
                </div>

                <div>
                  <label htmlFor="embed_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Embed Script/URL *
                  </label>
                  <textarea
                    id="embed_url"
                    name="embed_url"
                    value={formData.embed_url}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter embed script or URL..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">The embed script or URL for the avatar</p>
                </div>

                <div>
                  <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    id="quality"
                    name="quality"
                    value={formData.quality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Preview Image URL */}
              <div>
                <label htmlFor="preview_image" className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Image URL
                </label>
                <input
                  type="url"
                  id="preview_image"
                  name="preview_image"
                  value={formData.preview_image}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              {/* Settings */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="transparent_background"
                    checked={formData.transparent_background}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Transparent Background</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Avatar...' : 'Create Avatar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAvatarCreate;