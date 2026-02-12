import React from 'react';
import type { AvatarFormData } from '../types';

interface EmbedUrlSectionProps {
  formData: AvatarFormData;
  onChange: (value: string) => void;
  isRequired: boolean;
}

const EmbedUrlSection: React.FC<EmbedUrlSectionProps> = ({ formData, onChange, isRequired }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Embed URL {isRequired && '*'}
      </label>
      <textarea
        value={formData.embed_url}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical text-sm"
        placeholder="Paste your embed code or URL here..."
        required={isRequired}
      />
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs space-y-2">
        <p className="font-medium text-blue-900">Supported Formats:</p>
        <div className="space-y-1 text-blue-800">
          <p><strong>HeyGen:</strong> Paste the entire script tag or the direct URL from HeyGen</p>
          <p><strong>LiveAvatar:</strong> Paste the iframe tag or direct URL from LiveAvatar</p>
          <p className="text-blue-700">Example: {`<iframe src="https://embed.liveavatar.com/v1/..." allow="microphone"></iframe>`}</p>
        </div>
      </div>
      {isRequired && (
        <p className="text-xs text-gray-600">Required for new avatars</p>
      )}
      {!isRequired && (
        <p className="text-xs text-gray-600">Optional - Leave blank to keep existing embed URL</p>
      )}
    </div>
  );
};

export default EmbedUrlSection;
