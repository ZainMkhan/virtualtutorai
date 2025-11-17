import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../components/shared/Logo';
import UserMenu from '../../../components/user/UserMenu';
import { PageHeader } from './components/PageHeader';
import { EmbedParserSection } from './components/EmbedParserSection';
import { AvatarPreview } from './components/AvatarPreview';
import { AvatarFormFields } from './components/AvatarFormFields';
import { useAvatarForm } from './hook/useAvatarForm';

const AdminAvatarCreate: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    loading,
    error,
    successMessage,
    handleInputChange,
    updateFormData,
    handleSubmit
  } = useAvatarForm();

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

  const handleParseSuccess = (parsedData: {
    name: string;
    avatar_id: string;
    embed_url: string;
    preview_image: string;
    quality: 'low' | 'medium' | 'high';
    transparent_background: boolean;
    category: string;
    metadata: Record<string, any>;
  }) => {
    updateFormData(parsedData);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navigation and Header */}
      <nav className="bg-white shadow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="md" showText={true} textColor="text-gray-900" />
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
          <PageHeader onBackClick={() => navigate('/dashboard')} />

          {/* Embed Parser Section */}
          <EmbedParserSection onParseSuccess={handleParseSuccess} />

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
              <AvatarPreview previewImage={formData.preview_image} />

              {/* Form Fields */}
              <AvatarFormFields 
                formData={formData}
                onInputChange={handleInputChange}
                categories={categories}
              />

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