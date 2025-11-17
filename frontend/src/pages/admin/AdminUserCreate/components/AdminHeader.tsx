import React from 'react';
import Logo from '../../../../components/shared/Logo';
import UserMenu from '../../../../components/user/UserMenu';

interface AdminHeaderProps {
  onBackClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onBackClick }) => {
  return (
    <nav className="bg-white shadow w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo size="md" showText={true} textColor="text-gray-900" />
            <span className="ml-2 text-xl font-semibold text-red-600">Admin Panel</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackClick}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </button>
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;
