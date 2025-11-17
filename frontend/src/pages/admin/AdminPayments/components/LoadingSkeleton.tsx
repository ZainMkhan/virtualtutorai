import React from 'react';

interface LoadingSkeletonProps {
  title?: string;
  message?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  title = 'Payments & Transactions',
  message = 'Loading transactions...',
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};
