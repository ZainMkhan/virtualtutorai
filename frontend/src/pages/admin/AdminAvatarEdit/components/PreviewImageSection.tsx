import React from 'react';
import type { AvatarFormData } from '../types';

interface PreviewImageSectionProps {
  formData: AvatarFormData;
  onImageChange: (value: string) => void;
}

const PreviewImageSection: React.FC<PreviewImageSectionProps> = ({ formData, onImageChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Preview Image URL
      </label>
      <input
        type="url"
        value={formData.preview_image}
        onChange={(e) => onImageChange(e.target.value)}
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
  );
};

export default PreviewImageSection;
