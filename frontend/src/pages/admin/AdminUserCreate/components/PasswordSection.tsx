import React from 'react';
import type { FormData } from '../types';

interface PasswordSectionProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({ formData, onInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          minLength={6}
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
      </div>

      <div>
        <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password *
        </label>
        <input
          type="password"
          id="password_confirm"
          name="password_confirm"
          value={formData.password_confirm}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
    </div>
  );
};

export default PasswordSection;
