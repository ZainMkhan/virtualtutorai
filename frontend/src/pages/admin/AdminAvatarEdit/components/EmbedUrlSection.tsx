import React from 'react';
import type { AvatarFormData } from '../types';

interface EmbedUrlSectionProps {
  formData: AvatarFormData;
  onChange: (value: string) => void;
  isRequired: boolean;
}

const EmbedUrlSection: React.FC<EmbedUrlSectionProps> = ({ formData, onChange, isRequired }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Embed URL {isRequired && '*'}
      </label>
      <textarea
        value={formData.embed_url}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical"
        placeholder="Enter embed script or URL..."
        required={isRequired}
      />
      <p className="text-xs text-gray-500 mt-1">
        {isRequired ? 'Required for new avatars' : 'Optional - Leave blank to keep existing embed URL'}
      </p>
    </div>
  );
};

export default EmbedUrlSection;
