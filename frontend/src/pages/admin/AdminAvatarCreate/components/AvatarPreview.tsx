import React from 'react';
import { Eye } from 'lucide-react';

interface AvatarPreviewProps {
  previewImage: string;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ previewImage }) => {
  if (!previewImage) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
        <Eye className="h-4 w-4" />
        <span>Avatar Preview</span>
      </h3>
      <img 
        src={previewImage} 
        alt="Avatar Preview" 
        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
      />
    </div>
  );
};
