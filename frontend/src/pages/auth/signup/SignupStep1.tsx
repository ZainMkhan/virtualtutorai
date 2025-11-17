import React from 'react';
import type { SignupFormData } from './signupConstants';
import { LANGUAGE_OPTIONS } from './signupConstants';

interface Step1Props {
  formData: SignupFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const SignupStep1: React.FC<Step1Props> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* First Name and Last Name - Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-semibold text-gray-900 mb-2">
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            name="first_name"
            required
            placeholder="John"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={formData.first_name}
            onChange={onInputChange}
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-semibold text-gray-900 mb-2">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            name="last_name"
            required
            placeholder="Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={formData.last_name}
            onChange={onInputChange}
          />
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dob" className="block text-sm font-semibold text-gray-900 mb-2">
          Date of Birth
        </label>
        <input
          id="dob"
          type="date"
          name="dob"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          value={formData.dob}
          onChange={onInputChange}
        />
      </div>

      {/* Preferred Language */}
      <div>
        <label htmlFor="preferred_language" className="block text-sm font-semibold text-gray-900 mb-2">
          Preferred Language
        </label>
        <select
          id="preferred_language"
          name="preferred_language"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          value={formData.preferred_language}
          onChange={onInputChange}
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SignupStep1;
