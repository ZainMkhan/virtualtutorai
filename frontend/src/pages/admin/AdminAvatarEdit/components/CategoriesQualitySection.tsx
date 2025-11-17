import React from 'react';
import type { AvatarFormData } from '../types';

interface CategoriesQualitySectionProps {
  formData: AvatarFormData;
  onCategoryChange: (value: 'professional' | 'casual' | 'formal' | 'educational') => void;
  onQualityChange: (value: 'high' | 'medium' | 'low') => void;
}

const CategoriesQualitySection: React.FC<CategoriesQualitySectionProps> = ({
  formData,
  onCategoryChange,
  onQualityChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => onCategoryChange(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="formal">Formal</option>
          <option value="educational">Educational</option>
        </select>
      </div>

      {/* Quality */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quality
        </label>
        <select
          value={formData.quality}
          onChange={(e) => onQualityChange(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
};

export default CategoriesQualitySection;
