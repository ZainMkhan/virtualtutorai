import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ActiveStatusProps {
  isActive: boolean;
  onToggle: () => void;
}

const ActiveStatus: React.FC<ActiveStatusProps> = ({ isActive, onToggle }) => {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium ${
          isActive
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}
      >
        {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        <span>{isActive ? 'Active' : 'Inactive'}</span>
      </button>
    </div>
  );
};

export default ActiveStatus;
