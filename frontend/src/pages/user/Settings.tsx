import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';
import UserMenu from '../../components/user/UserMenu';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="md" showText={true} textColor="text-gray-900" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Content */}
      <main className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your application preferences and settings</p>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Account Section */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="space-y-2">
                      <p><span className="font-medium">Email:</span> {user?.email}</p>
                      <p><span className="font-medium">Role:</span> <span className="capitalize">{user?.role}</span></p>
                      <p><span className="font-medium">User ID:</span> {user?.user_id}</p>
                    </div>
                  </div>
                </div>

                {/* Preferences Section */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive email updates about your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Dashboard Notifications</h3>
                        <p className="text-sm text-gray-500">Show notifications in the dashboard</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
                  <div className="space-y-4">
                    <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Change Password
                    </button>
                    <div className="text-sm text-gray-500">
                      <p>Last password change: Never</p>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h2>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;