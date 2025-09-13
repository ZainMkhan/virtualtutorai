import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textColor?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = false,
  textColor = 'text-gray-900'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/logo-text.svg" 
        alt="Virtual Tutor AI Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-semibold ${textSizes[size]} ${textColor}`}>
          Virtual Tutor AI
        </span>
      )}
    </div>
  );
};

export default Logo;