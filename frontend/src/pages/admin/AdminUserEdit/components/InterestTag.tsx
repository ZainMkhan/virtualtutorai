import React from 'react';

interface InterestTagProps {
  interest: string;
  onRemove: () => void;
}

const InterestTag: React.FC<InterestTagProps> = ({ interest, onRemove }) => {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
      {interest}
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 text-blue-600 hover:text-blue-800"
      >
        ×
      </button>
    </span>
  );
};

export default InterestTag;
