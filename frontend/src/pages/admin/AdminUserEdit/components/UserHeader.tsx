import React from 'react';
import type { UserProfile } from '../../../../services/api';

interface UserHeaderProps {
  user: UserProfile;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => {
  const getInitials = (fullName: string | undefined, email: string) => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center space-x-6">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium">
          {getInitials(user.full_name, user.email)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit User: {user.full_name || user.email}
          </h1>
          <p className="text-gray-600">{user.email}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {user.role}
            </span>
            <span className="text-sm text-gray-500">
              Joined {new Date(user.date_joined).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;
