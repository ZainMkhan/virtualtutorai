import React from 'react';

interface AvatarFormFieldsProps {
  formData: {
    name: string;
    avatar_id: string;
    embed_url: string;
    preview_image: string;
    quality: 'low' | 'medium' | 'high';
    transparent_background: boolean;
    is_active: boolean;
    category: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  categories: string[];
}

export const AvatarFormFields: React.FC<AvatarFormFieldsProps> = ({ 
  formData, 
  onInputChange, 
  categories 
}) => {
  return (
    <>
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
            onChange={onInputChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
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
          onChange={onInputChange}
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
            onChange={onInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Transparent Background</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={onInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>
      </div>
    </>
  );
};
