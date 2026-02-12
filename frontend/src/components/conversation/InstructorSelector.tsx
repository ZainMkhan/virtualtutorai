import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { avatarAPI, type Avatar } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface InstructorSelectorProps {
  onSelect: (avatarId: string | null) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const InstructorSelector: React.FC<InstructorSelectorProps> = ({
  onSelect,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatars = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await avatarAPI.getAllAvatars(1, 20);

        if (response.success && response.data) {
          setAvatars(response.data.results);
          setFilteredAvatars(response.data.results);
        } else {
          setError(response.message || t('conversation.failed_to_load_instructors'));
        }
      } catch (err: any) {
        console.error('Failed to load avatars:', err);
        setError(t('conversation.failed_to_load_instructors'));
      } finally {
        setLoading(false);
      }
    };

    loadAvatars();
  }, []);

  // Filter avatars based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAvatars(avatars);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredAvatars(
        avatars.filter(
          (avatar) =>
            avatar.name.toLowerCase().includes(term) ||
            avatar.category.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, avatars]);

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
  };

  const handleContinue = () => {
    onSelect(selectedAvatarId);
  };

  const handleNoInstructor = () => {
    onSelect(null); // No instructor selected
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">{t('conversation.select_instructor')}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('conversation.choose_instructor')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('conversation.search_instructors')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-gray-600" />
            </div>
          ) : filteredAvatars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('conversation.no_instructors_found')}</p>
            </div>
          ) : (
            /* Avatars Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {filteredAvatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleSelectAvatar(avatar.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAvatarId === avatar.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {/* Avatar Preview Image */}
                  <div className="mb-3 aspect-square overflow-hidden rounded">
                    <img
                      src={avatar.preview_image}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/150?text=' +
                          encodeURIComponent(avatar.name);
                      }}
                    />
                  </div>

                  {/* Avatar Name */}
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {avatar.name}
                  </h3>

                  {/* Avatar Category */}
                  <p className="text-xs text-gray-500 mt-1 capitalize truncate">
                    {avatar.category}
                  </p>

                  {/* Selection Indicator */}
                  {selectedAvatarId === avatar.id && (
                    <div className="mt-2 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('conversation.cancel')}
          </Button>
          <Button
            variant="outline"
            onClick={handleNoInstructor}
            disabled={isLoading || loading}
          >
            {t('conversation.continue_without_instructor')}
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading || loading || !selectedAvatarId}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t('conversation.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstructorSelector;
