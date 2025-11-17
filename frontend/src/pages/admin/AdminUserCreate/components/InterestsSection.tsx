import React from 'react';
import InterestTag from './InterestTag';

interface InterestsSectionProps {
  interests: string[];
  newInterest: string;
  onNewInterestChange: (value: string) => void;
  onAddInterest: () => void;
  onRemoveInterest: (interest: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const InterestsSection: React.FC<InterestsSectionProps> = ({
  interests,
  newInterest,
  onNewInterestChange,
  onAddInterest,
  onRemoveInterest,
  onKeyPress
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Interests
      </label>
      
      {/* Current Interests */}
      <div className="flex flex-wrap gap-2 mb-3">
        {interests.map((interest, index) => (
          <InterestTag
            key={index}
            interest={interest}
            onRemove={() => onRemoveInterest(interest)}
          />
        ))}
      </div>

      {/* Add New Interest */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newInterest}
          onChange={(e) => onNewInterestChange(e.target.value)}
          onKeyPress={onKeyPress}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add an interest..."
        />
        <button
          type="button"
          onClick={onAddInterest}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default InterestsSection;
