import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Logo from '../../../../components/shared/Logo';
import UserMenu from '../../../../components/user/UserMenu';

interface AdminHeaderProps {
  onBack: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onBack }) => {
  return (
    <nav className="bg-white shadow w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <Logo size="md" showText={true} textColor="text-gray-900" />
            <span className="ml-2 text-xl font-semibold text-red-600">Edit Avatar</span>
          </div>
          <div className="flex items-center">
            <UserMenu userProfile={null} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;
