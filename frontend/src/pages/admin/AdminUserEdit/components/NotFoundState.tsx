import React from 'react';

interface NotFoundStateProps {
  onBackClick: () => void;
}

const NotFoundState: React.FC<NotFoundStateProps> = ({ onBackClick }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">User not found</p>
        <button
          onClick={onBackClick}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundState;
