import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionAPI, paymentAPI, type SubscriptionTier, type PaymentIntent } from '../../services/api';
import UserMenu from '../../components/user/UserMenu';
import DashboardSidebar from '../../components/user/DashboardSidebar';
import PaymentModal from '../../components/payment/PaymentModal';
import { Check, Crown, Zap, Sparkles, ArrowLeft } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';

interface PaymentState {
  isOpen: boolean;
  tierId: string | null;
  tierName: string | null;
  paymentIntent: PaymentIntent | null;
  loading: boolean;
  error: string | null;
}

const Subscription: React.FC = () => {
  const { user, currentSubscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isOpen: false,
    tierId: null,
    tierName: null,
    paymentIntent: null,
    loading: false,
    error: null,
  });

  // Fetch subscription tiers on component mount
  useEffect(() => {
    const fetchSubscriptionTiers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch subscription tiers
        const tiersResponse = await subscriptionAPI.getSubscriptionTiers();
        
        if (tiersResponse.success && tiersResponse.data) {
          // Sort by display_order
          const sortedTiers = [...tiersResponse.data].sort((a, b) => a.display_order - b.display_order);
          setTiers(sortedTiers);
        } else {
          setError(tiersResponse.message || 'Failed to load subscription tiers');
        }
      } catch (error: any) {
        console.error('Subscription data fetch error:', error);
        setError('Failed to load subscription information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionTiers();
  }, []);

  const handleSubscribe = async (tierId: string, tierName: string) => {
    try {
      setPaymentState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // Create payment intent
      const paymentResponse = await paymentAPI.createPaymentIntent(tierId);

      if (paymentResponse.success && paymentResponse.data) {
        setPaymentState(prev => ({
          ...prev,
          isOpen: true,
          tierId,
          tierName,
          paymentIntent: paymentResponse.data,
          loading: false,
          error: null,
        }));
      } else {
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          error: paymentResponse.message || 'Failed to initialize payment',
        }));
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to initialize payment',
      }));
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentState(prev => ({
      ...prev,
      isOpen: false,
    }));
    
    // Refresh subscription state
    setTimeout(() => {
      refreshSubscription();
    }, 1000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setPaymentState((prev: PaymentState) => ({
      ...prev,
      error: errorMessage,
    }));
  };

  const closePaymentModal = () => {
    setPaymentState((prev: PaymentState) => ({
      ...prev,
      isOpen: false,
      tierId: null,
      tierName: null,
      paymentIntent: null,
      error: null,
    }));
  };

  const getTierIcon = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('pro') || name.includes('premium')) {
      return <Crown className="h-8 w-8 text-yellow-500" />;
    } else if (name.includes('starter') || name.includes('basic')) {
      return <Zap className="h-8 w-8 text-blue-500" />;
    } else if (name.includes('enterprise') || name.includes('business')) {
      return <Sparkles className="h-8 w-8 text-purple-500" />;
    }
    return <Crown className="h-8 w-8 text-gray-500" />;
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? 'Free' : `$${numPrice.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar */}
        <DashboardSidebar onNavigate={() => {}} />

        {/* Main Content Column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Navigation Bar */}
          <nav className="bg-white shadow-sm w-full h-16 flex-shrink-0 border-b border-gray-200">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
              <div className="flex justify-between items-center h-full">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="lg:hidden" />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 text-sm hidden md:inline">
                    Welcome, <span className="font-medium">{user?.email}</span>
                  </span>
                  <UserMenu userProfile={null} />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto custom-scrollbar w-full">
            <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Dashboard
                </button>

                {/* Page Header with Current Subscription */}
                <div className="mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      Subscription Plans
                    </h1>
                    <p className="text-lg text-gray-600">
                      Choose the perfect plan for your learning journey
                    </p>
                  </div>
                  
                  {/* Current Subscription Card - Inline */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 flex-shrink-0 w-full lg:w-auto lg:min-w-max">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Current Subscription</p>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                          {currentSubscription?.tierName || 'Free'}
                        </h2>
                        <div className="flex items-center space-x-2">
                          <span className="inline-block h-2 w-2 bg-green-500 rounded-full"></span>
                          <span className="text-green-700 font-medium text-sm">Active</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getTierIcon(currentSubscription?.tierName === 'free' ? 'Free' : currentSubscription?.tierName || 'Free')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Subscription Tiers */}
                {tiers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tiers.map((tier) => (
                      <div
                        key={tier.id}
                        className={`relative rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                          currentSubscription?.tierId === tier.id
                            ? 'ring-2 ring-blue-500 bg-white'
                            : 'bg-white'
                        } ${
                          tier.display_order === 2 ? 'md:scale-105' : ''
                        }`}
                      >
                        {/* Featured Badge */}
                        {tier.display_order === 2 && (
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                            Most Popular
                          </div>
                        )}

                        <div className="p-8">
                          {/* Tier Icon and Name */}
                          <div className="flex items-center justify-center mb-6">
                            {getTierIcon(tier.display_name)}
                          </div>
                          <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                            {tier.display_name}
                          </h3>
                          <p className="text-gray-600 text-center text-sm mb-6 h-12 flex items-center justify-center">
                            {tier.description}
                          </p>

                          {/* Price */}
                          <div className="text-center mb-8">
                            <span className="text-5xl font-bold text-gray-900">
                              {formatPrice(tier.price)}
                            </span>
                            {tier.price !== '0.00' && (
                              <span className="text-gray-600 ml-2">
                                / {tier.billing_interval}
                              </span>
                            )}
                          </div>

                          {/* Subscribe Button */}
                          <button
                            onClick={() => handleSubscribe(tier.id, tier.display_name)}
                            disabled={paymentState.loading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 mb-8 disabled:opacity-50 disabled:cursor-not-allowed ${
                              currentSubscription?.tierId === tier.id
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : tier.display_order === 2
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                          >
                            {currentSubscription?.tierId === tier.id ? 'Current Plan' : 'Subscribe'}
                          </button>

                          {/* Divider */}
                          <div className="border-t border-gray-200 mb-6"></div>

                          {/* Features List */}
                          <div className="space-y-4">
                            <p className="text-sm font-semibold text-gray-900 mb-4">
                              Included Features:
                            </p>
                            {Object.entries(tier.features).map(([key, value]) => {
                              // Format feature names
                              const featureName = key
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');

                              const isEnabled = 
                                typeof value === 'boolean' 
                                  ? value 
                                  : value !== null && value !== undefined;
                              const displayValue = 
                                typeof value === 'number' 
                                  ? ` - ${value.toLocaleString()}`
                                  : '';

                              return (
                                <div
                                  key={key}
                                  className="flex items-start space-x-3"
                                >
                                  {isEnabled ? (
                                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <div className="h-5 w-5 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5"></div>
                                  )}
                                  <span className={`text-sm ${isEnabled ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {featureName}
                                    {displayValue && <span className="font-semibold">{displayValue}</span>}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg">
                    <Crown className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No subscription plans available
                    </h3>
                    <p className="text-gray-600">
                      Please check back later for available plans.
                    </p>
                  </div>
                )}

                {/* Payment Modal */}
                {paymentState.isOpen && paymentState.paymentIntent && (
                  <PaymentModal
                    amount={paymentState.paymentIntent.amount}
                    tierName={paymentState.tierName || ''}
                    clientSecret={paymentState.paymentIntent.client_secret}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    isLoading={paymentState.loading}
                    onClose={closePaymentModal}
                  />
                )}

                {/* FAQ Section */}
                <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Can I change my subscription plan?
                      </h3>
                      <p className="text-gray-600">
                        Yes, you can upgrade or downgrade your subscription plan at any time. Changes will be reflected in your next billing cycle.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        What payment methods do you accept?
                      </h3>
                      <p className="text-gray-600">
                        We accept all major credit cards and digital payment methods for your convenience.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Is there a free trial?
                      </h3>
                      <p className="text-gray-600">
                        Yes, start with our Free plan to explore the platform. You can upgrade to a paid plan anytime.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Can I cancel my subscription?
                      </h3>
                      <p className="text-gray-600">
                        You can cancel your subscription anytime. Your access will continue until the end of your current billing period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Subscription;
