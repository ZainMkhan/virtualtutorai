import React from 'react';
import type { EditFormData } from '../types';

interface BioSectionProps {
  formData: EditFormData;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const BioSection: React.FC<BioSectionProps> = ({ formData, onInputChange }) => {
  return (
    <div>
      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
        Bio
      </label>
      <textarea
        id="bio"
        name="bio"
        rows={4}
        value={formData.bio}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Tell us about this user..."
      />
    </div>
  );
};

export default BioSection;
