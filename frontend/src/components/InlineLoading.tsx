import React from 'react';

interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const InlineLoading: React.FC<InlineLoadingProps> = ({ 
  size = 'md', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`loading-logo ${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center shadow-sm`}>
        <span className="text-white text-xs font-bold">VT</span>
      </div>
      
      {text && (
        <span className={`text-gray-600 ${textSizes[size]} animate-pulse`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default InlineLoading;