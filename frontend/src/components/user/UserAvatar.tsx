import React from 'react';

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName = '',
  lastName = '',
  fullName = '',
  size = 'md',
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  };

  //   initials from first/last name or full name
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    if (fullName) {
      const names = fullName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return names[0].charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-r from-blue-600 to-blue-800 
        rounded-full 
        flex items-center justify-center 
        text-white font-semibold 
        cursor-pointer 
        hover:from-blue-700 hover:to-blue-900 
        transition-all duration-200 
        shadow-md hover:shadow-lg
        ${className}
      `}
      onClick={onClick}
      title={fullName || `${firstName} ${lastName}`.trim() || 'User Profile'}
    >
      {getInitials()}
    </div>
  );
};

export default UserAvatar;