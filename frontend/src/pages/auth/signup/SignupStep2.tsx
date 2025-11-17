import React, { useMemo, useState } from 'react';
import type { SignupFormData } from './signupConstants';
import { Switch } from '../../../components/ui/switch';

interface Step2Props {
  formData: SignupFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const SignupStep2: React.FC<Step2Props> = ({ formData, onInputChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  // Generate username suggestions based on first and last name
  const usernameSuggestions = useMemo(() => {
    const suggestions = [];
    const firstName = formData.first_name.toLowerCase().replace(/\s+/g, '');
    const lastName = formData.last_name.toLowerCase().replace(/\s+/g, '');

    if (firstName && lastName) {
      suggestions.push(`${firstName}${lastName}`);
      suggestions.push(`${firstName}.${lastName}`);
      suggestions.push(`${firstName}_${lastName}`);
    }

    return suggestions;
  }, [formData.first_name, formData.last_name]);

  const applySuggestion = (suggestion: string) => {
    onInputChange({
      target: { name: 'username', value: suggestion },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-6">
      {/* Username */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="username" className="block text-sm font-semibold text-gray-900">
            Username
          </label>
          {/* Suggestions next to label */}
          {usernameSuggestions.length > 0 && (
            <div className="flex gap-2">
              {usernameSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          id="username"
          type="text"
          name="username"
          required
          placeholder="johndoe"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          value={formData.username}
          onChange={onInputChange}
        />
        <p className="text-xs text-gray-500 mt-1">3-20 characters, letters/numbers/underscore</p>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          value={formData.email}
          onChange={onInputChange}
        />
      </div>

      {/* Password and Confirm Password - Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={formData.password}
            onChange={onInputChange}
          />
          <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password_confirm" className="block text-sm font-semibold text-gray-900">
              Confirm Password
            </label>
            <div className="flex items-center gap-2">
              <Switch checked={showPassword} onCheckedChange={setShowPassword} />
              <span className="text-xs text-gray-600">{showPassword ? 'Hide' : 'Show'}</span>
            </div>
          </div>
          <input
            id="password_confirm"
            type={showPassword ? 'text' : 'password'}
            name="password_confirm"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={formData.password_confirm}
            onChange={onInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SignupStep2;
