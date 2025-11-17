import React from 'react';
import { Bot } from 'lucide-react';

interface PageHeaderProps {
  onBackClick: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onBackClick }) => {
  return (
    <>
      {/* Navigation */}
      <nav className="bg-white shadow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-red-600">Admin Panel</span>
            </div>
            <button
              onClick={onBackClick}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-4">
          <Bot className="h-12 w-12 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Avatar</h1>
            <p className="text-gray-600 mt-2">Add a new AI avatar by pasting an embed script</p>
          </div>
        </div>
      </div>
    </>
  );
};
