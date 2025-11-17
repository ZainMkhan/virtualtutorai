import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionAPI } from '../../services/api';
import Logo from '../../components/shared/Logo';
import UserMenu from '../../components/user/UserMenu';
import { AlertCircle, Check, ArrowLeft } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, currentSubscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      setCancelError(null);
      
      const response = await subscriptionAPI.cancelSubscription();
      
      if (response.success) {
        setCancelSuccess(true);
        setShowCancelConfirm(false);
        await refreshSubscription();
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setCancelSuccess(false);
        }, 5000);
      } else {
        setCancelError(response.message || 'Failed to cancel subscription');
      }
    } catch (error: any) {
      setCancelError(error.response?.data?.message || 'Failed to cancel subscription. Please try again.');
      console.error('Cancel subscription error:', error);
    } finally {
      setCancelLoading(false);
    }
  };

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
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>

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

                {/* Subscription Management Section */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Management</h2>
                  <div className="space-y-4">
                    {/* Current Plan */}
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-blue-900">Current Plan</h3>
                          <p className="text-sm text-blue-700 mt-1 capitalize font-semibold">
                            {currentSubscription?.tierName || 'Free'}
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            {currentSubscription?.tierName && currentSubscription?.tierName !== 'Free'
                              ? 'Your subscription is active and renews automatically'
                              : 'You are on the free plan'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Success Message */}
                    {cancelSuccess && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-md flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-green-900">Cancellation Scheduled</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Your subscription will be canceled at the end of your current billing period. You'll retain access until then.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {cancelError && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-red-900">Error</h3>
                          <p className="text-sm text-red-700 mt-1">{cancelError}</p>
                        </div>
                      </div>
                    )}

                    {/* Cancel Button */}
                    {currentSubscription?.tierName && currentSubscription?.tierName !== 'Free' && !showCancelConfirm && !cancelSuccess && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-red-900 mb-1">Cancel Your Subscription</h3>
                            <p className="text-xs text-red-700">
                              You can cancel anytime. Your access will continue until the end of your billing period.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0 ml-4"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Confirmation Dialog */}
                    {showCancelConfirm && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-red-900 mb-2">
                              Are you sure you want to cancel?
                            </h3>
                            <p className="text-sm text-red-700 mb-3">
                              Your subscription will be canceled at the end of your current billing period. You'll keep full access until then and can always resubscribe.
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleCancelSubscription}
                              disabled={cancelLoading}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              {cancelLoading ? 'Canceling...' : 'Yes, Cancel Subscription'}
                            </button>
                            <button
                              onClick={() => setShowCancelConfirm(false)}
                              disabled={cancelLoading}
                              className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Keep Subscription
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Plan Message */}
                    {(!currentSubscription?.tierName || currentSubscription?.tierName === 'Free') && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          You don't have an active subscription. <button onClick={() => navigate('/subscription')} className="text-blue-600 hover:text-blue-700 font-medium">Browse plans</button>
                        </p>
                      </div>
                    )}
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