import React from 'react';
import type { AvatarFormData } from '../types';

interface BasicInfoSectionProps {
  formData: AvatarFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Avatar Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avatar Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Avatar ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avatar ID *
        </label>
        <input
          type="text"
          name="avatar_id"
          value={formData.avatar_id}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
