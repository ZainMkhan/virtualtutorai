import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { avatarAPI, type Avatar } from '../../services/api';
import UserMenu from '../../components/user/UserMenu';
import DashboardSidebar from '../../components/user/DashboardSidebar';
import LanguageSwitcher from '../../components/shared/LanguageSwitcher';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Bot, 
  Tag, 
  Grid3x3, 
  List,
  X,
  Loader2,
  Heart,
  ArrowLeft,
} from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface AvatarWithStats extends Avatar {
  isFavorite?: boolean;
  lastInteractedAt?: string;
  interactionCount?: number;
}

type SortOption = 'name' | 'category' | 'recent' | 'popular';
type ViewMode = 'grid' | 'list';

const AvatarsBrowse: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [avatars, setAvatars] = useState<AvatarWithStats[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<AvatarWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(avatars.map(a => a.category).filter(Boolean)));
  }, [avatars]);

  // Fetch avatars
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await avatarAPI.getAllAvatars(1, 100);

        if (response.success && response.data) {
          // Add stats (in real app, these would come from API)
          const enrichedAvatars: AvatarWithStats[] = response.data.results.map(avatar => ({
            ...avatar,
            isFavorite: favorites.includes(avatar.id),
          }));
          setAvatars(enrichedAvatars);
        } else {
          setError(response.message || 'Failed to load avatars');
        }
      } catch (error: any) {
        setError('Failed to load avatars');
        console.error('Avatars fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('avatarFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
  }, []);

  // Filter and sort avatars
  useEffect(() => {
    let result = [...avatars];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        avatar =>
          avatar.name.toLowerCase().includes(query) ||
          avatar.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(avatar => selectedCategories.includes(avatar.category));
    }

    // Status filter
    if (selectedStatus === 'active') {
      result = result.filter(avatar => avatar.is_active);
    } else if (selectedStatus === 'inactive') {
      result = result.filter(avatar => !avatar.is_active);
    }

    // Sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'recent':
        result.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at).getTime();
          const dateB = new Date(b.updated_at || b.created_at).getTime();
          return dateB - dateA;
        });
        break;
      case 'popular':
        result.sort((a, b) => (b.name.length || 0) - (a.name.length || 0));
        break;
    }

    setFilteredAvatars(result);
  }, [avatars, searchQuery, selectedCategories, selectedStatus, sortBy]);

  const toggleFavorite = (avatarId: string) => {
    const newFavorites = favorites.includes(avatarId)
      ? favorites.filter(id => id !== avatarId)
      : [...favorites, avatarId];
    setFavorites(newFavorites);
    localStorage.setItem('avatarFavorites', JSON.stringify(newFavorites));

    setAvatars(avatars.map(a => ({
      ...a,
      isFavorite: newFavorites.includes(a.id),
    })));
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleAvatarClick = (avatarId: string) => {
    navigate(`/avatar/${avatarId}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedStatus('all');
    setSortBy('name');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    selectedStatus !== 'all' ||
    sortBy !== 'name';

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar */}
        <DashboardSidebar onNavigate={() => {}} />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Navigation Bar */}
          <nav className="bg-white shadow-sm w-full h-16 flex-shrink-0 border-b border-gray-200">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
              <div className="flex justify-between items-center h-full">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="lg:hidden" />
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-900">{t('avatars.title')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 gap-4">
                  <span className="text-gray-600 text-sm hidden md:inline">
                    {user?.email}
                  </span>
                  <LanguageSwitcher />
                  <UserMenu userProfile={null} />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto custom-scrollbar w-full">
            <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    {t('common.back')}
                  </button>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {t('avatars.title')}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {t('avatars.description')}
                  </p>
                </div>

                {/* Search and Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('avatars.search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Control Row */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="flex gap-2">
                        {/* Toggle Filters Button */}
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          <Filter className="h-4 w-4" />
                          {t('avatars.filters')}
                          {hasActiveFilters && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {selectedCategories.length +
                                (selectedStatus !== 'all' ? 1 : 0) +
                                (sortBy !== 'name' ? 1 : 0)}
                            </span>
                          )}
                        </button>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                          >
                            <X className="h-4 w-4" />
                            {t('common.clear')}
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {/* Sort Dropdown */}
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
                        >
                          <option value="name">{t('avatars.sort_name')}</option>
                          <option value="category">{t('avatars.sort_category')}</option>
                          <option value="recent">{t('avatars.sort_recent')}</option>
                          <option value="popular">{t('avatars.sort_popular')}</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex border border-gray-300 rounded-lg">
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 transition-colors ${
                              viewMode === 'grid'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                            title={t('avatars.grid_view')}
                          >
                            <Grid3x3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 transition-colors border-l border-gray-300 ${
                              viewMode === 'list'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                            title={t('avatars.list_view')}
                          >
                            <List className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                      <div className="pt-4 border-t border-gray-200 space-y-4">
                        {/* Category Filter */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            {t('avatars.categories')}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {categories.length > 0 ? (
                              categories.map(category => (
                                <button
                                  key={category}
                                  onClick={() => toggleCategory(category)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategories.includes(category)
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {category}
                                </button>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">{t('common.loading')}</p>
                            )}
                          </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            {t('avatars.status')}
                          </h4>
                          <div className="flex gap-2">
                            {(['all', 'active', 'inactive'] as const).map(status => (
                              <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  selectedStatus === status
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {t(`avatars.${status}`)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Info */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {t('avatars.showing', { count: filteredAvatars.length, total: avatars.length })}
                  </p>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                    <p className="text-gray-600">{t('avatars.loading_avatars')}</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                    <p className="font-medium">{t('avatars.failed_to_load')}</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                )}

                {/* No Results */}
                {!loading && filteredAvatars.length === 0 && !error && (
                  <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <Bot className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('avatars.no_results')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('avatars.try_adjusting')}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('avatars.clear_filters')}
                      </button>
                    )}
                  </div>
                )}

                {/* Grid View */}
                {!loading && viewMode === 'grid' && filteredAvatars.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAvatars.map(avatar => (
                      <AvatarCard
                        key={avatar.id}
                        avatar={avatar}
                        isFavorite={favorites.includes(avatar.id)}
                        onFavorite={toggleFavorite}
                        onClick={() => handleAvatarClick(avatar.id)}
                      />
                    ))}
                  </div>
                )}

                {/* List View */}
                {!loading && viewMode === 'list' && filteredAvatars.length > 0 && (
                  <div className="space-y-3">
                    {filteredAvatars.map(avatar => (
                      <AvatarListItem
                        key={avatar.id}
                        avatar={avatar}
                        isFavorite={favorites.includes(avatar.id)}
                        onFavorite={toggleFavorite}
                        onClick={() => handleAvatarClick(avatar.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Avatar Card Component
const AvatarCard: React.FC<{
  avatar: AvatarWithStats;
  isFavorite: boolean;
  onFavorite: (id: string) => void;
  onClick: () => void;
}> = ({ avatar, isFavorite, onFavorite, onClick }) => {
  const { t } = useTranslation();
  return (
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300">
      {/* Image Container */}
      <div className="aspect-square relative bg-gray-200 overflow-hidden">
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

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowRight className="h-5 w-5 text-blue-600" />
          </button>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(avatar.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
          title={isFavorite ? t('avatars.remove_favorite') : t('avatars.favorite')}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              avatar.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {avatar.is_active ? `● ${t('avatars.active')}` : `○ ${t('avatars.inactive')}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {avatar.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Tag className="h-4 w-4" />
          <span>{avatar.category}</span>
        </div>
        <button
          onClick={onClick}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {t('avatars.start_interaction')}
        </button>
      </div>
    </div>
  );
};

// Avatar List Item Component
const AvatarListItem: React.FC<{
  avatar: AvatarWithStats;
  isFavorite: boolean;
  onFavorite: (id: string) => void;
  onClick: () => void;
}> = ({ avatar, isFavorite, onFavorite, onClick }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300 hover:border-blue-300 group cursor-pointer">
      <div className="flex items-center gap-4">
        {/* Avatar Image */}
        <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-200 overflow-hidden">
          {avatar.preview_image ? (
            <img
              src={avatar.preview_image}
              alt={avatar.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
              <Bot className="h-8 w-8 text-blue-400" />
            </div>
          )}
        </div>

        {/* Avatar Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{avatar.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{avatar.category}</span>
            <span
              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                avatar.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {avatar.is_active ? t('avatars.active') : t('avatars.inactive')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(avatar.id);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFavorite ? t('avatars.remove_favorite') : t('avatars.favorite')}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
          <button
            onClick={onClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>{t('avatars.interact')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarsBrowse;
