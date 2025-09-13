import React from 'react';
import { Bot, MessageSquare } from 'lucide-react';

interface ModeToggleProps {
  currentMode: 'avatar' | 'chat';
  onModeChange: (mode: 'avatar' | 'chat') => void;
  disabled?: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ currentMode, onModeChange, disabled = false }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
      <button
        onClick={() => onModeChange('avatar')}
        disabled={disabled}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentMode === 'avatar'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Bot className="h-4 w-4 mr-2" />
        Avatar Mode
      </button>
      
      <button
        onClick={() => onModeChange('chat')}
        disabled={disabled}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentMode === 'chat'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Chat Mode
      </button>
    </div>
  );
};

export default ModeToggle;