import React from 'react';
import type { SignupFormData } from './signupConstants';
import { INTEREST_OPTIONS } from './signupConstants';

interface Step3Props {
  formData: SignupFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onInterestToggle: (interest: string) => void;
}

const SignupStep3: React.FC<Step3Props> = ({ formData, onInputChange, onInterestToggle }) => {
  return (
    <div className="space-y-6">
      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-2">
          About You
        </label>
        <textarea
          id="bio"
          name="bio"
          required
          placeholder="Tell us a bit about yourself (e.g., Software Developer, Student)"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          value={formData.bio}
          onChange={onInputChange}
        />
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-4">
          Learning Interests (Select at least one)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => onInterestToggle(interest)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                formData.interests.includes(interest)
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="bg-gray-50 rounded-lg p-4 mt-8">
        <div className="flex items-start gap-3">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="w-4 h-4 text-blue-600 rounded mt-1 focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SignupStep3;
