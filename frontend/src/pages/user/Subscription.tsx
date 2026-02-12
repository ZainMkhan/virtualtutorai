import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { subscriptionAPI, paymentAPI, type SubscriptionTier, type PaymentIntent } from '../../services/api';
import UserMenu from '../../components/user/UserMenu';
import DashboardSidebar from '../../components/user/DashboardSidebar';
import PaymentModal from '../../components/payment/PaymentModal';
import { Check, X, Crown, Zap, Sparkles, ArrowLeft, MessageSquare, Clock, Users, Headphones } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';

interface ExtendedSubscriptionTier extends SubscriptionTier {
  conversations_per_month?: number;
  video_minutes_per_month?: number;
  messages_per_month?: number;
  interactive_minutes_per_month?: number;
  max_concurrent_sessions?: number;
  tier?: string;
  is_featured?: boolean;
}

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
  const { t } = useTranslation();
  
  const [tiers, setTiers] = useState<ExtendedSubscriptionTier[]>([]);
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
          const sortedTiers = [...tiersResponse.data].sort((a: any, b: any) => {
            const orderA = a.display_order ?? 0;
            const orderB = b.display_order ?? 0;
            return orderA - orderB;
          });
          setTiers(sortedTiers);
        } else {
          setError(tiersResponse.message || t('errors.failed_to_load_avatars'));
        }
      } catch (error: any) {
        console.error('Subscription data fetch error:', error);
        setError(t('errors.something_went_wrong'));
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
          error: paymentResponse.message || t('errors.something_went_wrong'),
        }));
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        error: error.message || t('errors.something_went_wrong'),
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
    if (name.includes('enterprise')) {
      return <Sparkles className="h-8 w-8 text-purple-500" />;
    } else if (name.includes('pro')) {
      return <Crown className="h-8 w-8 text-yellow-500" />;
    } else if (name.includes('basic')) {
      return <Zap className="h-8 w-8 text-blue-500" />;
    }
    return <MessageSquare className="h-8 w-8 text-gray-500" />;
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? t('common.free') : `$${numPrice.toFixed(2)}`;
  };

  const formatNumber = (num: number | undefined, isUnlimited: boolean = false) => {
    if (isUnlimited) return t('common.unlimited');
    if (num === undefined || num === 0) return 'N/A';
    return num.toLocaleString();
  };

  const isUnlimited = (num: number | undefined) => {
    return num === 0 || num === undefined;
  };

  const FeatureRow: React.FC<{
    label: string;
    icon: React.ReactNode;
    values: (string | number)[];
  }> = ({ label, icon, values }) => (
    <div className="py-4 px-6 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {values.map((value, idx) => (
          <div key={idx} className="text-sm text-gray-600 font-medium">
            {value}
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
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
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  {t('common.back')}
                </button>

                {/* Page Header */}
                <div className="mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {t('subscription.title')}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {t('subscription.choose_plan')}
                  </p>
                </div>

                {/* Current Subscription Card */}
                {currentSubscription && (
                  <div className="mb-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">{t('subscription.current_plan')}</p>
                        <h2 className="text-3xl font-bold mb-2 capitalize">
                          {currentSubscription?.tierName || t('common.free')}
                        </h2>
                        <div className="flex items-center space-x-2">
                          <span className="inline-block h-2 w-2 bg-green-300 rounded-full"></span>
                          <span className="text-blue-100 font-medium text-sm">{t('avatars.active')}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getTierIcon(currentSubscription?.tierName === 'free' ? t('common.free') : currentSubscription?.tierName || t('common.free'))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
                    <p className="font-medium">{t('common.error')}</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Subscription Tiers - Pricing Cards */}
                {tiers.length > 0 ? (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Available Plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                            tier.is_featured
                              ? 'ring-2 ring-blue-500 shadow-2xl transform scale-105'
                              : 'shadow-lg'
                          } ${
                            currentSubscription?.tierId === tier.id
                              ? 'ring-2 ring-green-500'
                              : ''
                          } hover:shadow-xl`}
                        >
                          {/* Background */}
                          <div className={`absolute inset-0 ${
                            tier.is_featured
                              ? 'bg-gradient-to-br from-blue-50 to-white'
                              : 'bg-white'
                          }`}></div>

                          {/* Featured Badge */}
                          {tier.is_featured && (
                            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                              {t('subscription.popular')}
                            </div>
                          )}

                          {/* Content */}
                          <div className="relative p-6 flex flex-col h-full">
                            {/* Tier Info */}
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {tier.display_name}
                                </h3>
                                {getTierIcon(tier.display_name)}
                              </div>
                              <p className="text-sm text-gray-600 mb-4 h-10">
                                {tier.description}
                              </p>

                              {/* Price */}
                              <div className="mb-6">
                                <div className="text-3xl font-bold text-gray-900">
                                  {formatPrice(tier.price)}
                                </div>
                                {tier.price !== '0.00' && (
                                  <div className="text-sm text-gray-600">
                                    {t('subscription.per_month')}
                                  </div>
                                )}
                              </div>

                              {/* CTA Button */}
                              <button
                                onClick={() => handleSubscribe(tier.id, tier.display_name)}
                                disabled={paymentState.loading}
                                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                                  currentSubscription?.tierId === tier.id
                                    ? 'bg-gray-200 text-gray-700 cursor-default'
                                    : tier.is_featured
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                              >
                                {currentSubscription?.tierId === tier.id ? t('subscription.current_plan') : t('subscription.title')}
                              </button>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 mb-4"></div>

                            {/* Key Features */}
                            <div className="space-y-3 flex-grow">
                              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                {t('subscription.features')}
                              </p>

                              {tier.conversations_per_month !== undefined && (
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-700">
                                    <span className="font-semibold">{formatNumber(tier.conversations_per_month, isUnlimited(tier.conversations_per_month))}</span> {t('subscription.conversations_per_month')}
                                  </span>
                                </div>
                              )}

                              {tier.messages_per_month !== undefined && (
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-700">
                                    <span className="font-semibold">{formatNumber(tier.messages_per_month, isUnlimited(tier.messages_per_month))}</span> {t('subscription.messages_per_month')}
                                  </span>
                                </div>
                              )}

                              {tier.interactive_minutes_per_month !== undefined && (
                                <div className="flex items-start gap-2">
                                  <Clock className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-700">
                                    <span className="font-semibold">{formatNumber(tier.interactive_minutes_per_month, isUnlimited(tier.interactive_minutes_per_month))}</span> {t('subscription.interactive_minutes')}
                                  </span>
                                </div>
                              )}

                              {tier.max_concurrent_sessions !== undefined && (
                                <div className="flex items-start gap-2">
                                  <Users className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-700">
                                    <span className="font-semibold">{tier.max_concurrent_sessions}</span> {t('subscription.concurrent_sessions')}
                                  </span>
                                </div>
                              )}

                              {/* Support Feature */}
                              {tier.features?.priority_support !== undefined && (
                                <div className="pt-2 border-t border-gray-200">
                                  <div className="flex items-start gap-2">
                                    <Headphones className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                                      tier.features.priority_support ? 'text-green-600' : 'text-gray-400'
                                    }`} />
                                    <span className={`text-sm ${
                                      tier.features.priority_support ? 'text-gray-700 font-medium' : 'text-gray-500'
                                    }`}>
                                      {tier.features.priority_support ? t('subscription.support') : t('common.cancel')}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg">
                    <Crown className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('subscription.no_plans')}
                    </h3>
                    <p className="text-gray-600">
                      {t('subscription.check_back_later')}
                    </p>
                  </div>
                )}

                {/* Detailed Comparison Table */}
                {tiers.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('subscription.detailed_comparison')}</h2>
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 min-w-max">Feature</th>
                            {tiers.map((tier) => (
                              <th key={tier.id} className="px-6 py-4 text-center text-sm font-bold text-gray-900 min-w-max">
                                {tier.display_name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {/* Conversations per Month */}
                          {tiers.some(t => t.conversations_per_month !== undefined) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-blue-600" />
                                  Conversations/Month
                                </div>
                              </td>
                              {tiers.map((tier) => (
                                <td key={tier.id} className="px-6 py-4 text-sm text-center text-gray-700 font-medium">
                                  {formatNumber(tier.conversations_per_month, isUnlimited(tier.conversations_per_month))}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Messages per Month */}
                          {tiers.some(t => t.messages_per_month !== undefined) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-green-600" />
                                  Messages/Month
                                </div>
                              </td>
                              {tiers.map((tier) => (
                                <td key={tier.id} className="px-6 py-4 text-sm text-center text-gray-700 font-medium">
                                  {formatNumber(tier.messages_per_month, isUnlimited(tier.messages_per_month))}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Interactive Minutes per Month */}
                          {tiers.some(t => t.interactive_minutes_per_month !== undefined) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-orange-600" />
                                  Interactive Minutes/Month
                                </div>
                              </td>
                              {tiers.map((tier) => (
                                <td key={tier.id} className="px-6 py-4 text-sm text-center text-gray-700 font-medium">
                                  {formatNumber(tier.interactive_minutes_per_month, isUnlimited(tier.interactive_minutes_per_month))}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Concurrent Sessions */}
                          {tiers.some(t => t.max_concurrent_sessions !== undefined) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-purple-600" />
                                  Concurrent Sessions
                                </div>
                              </td>
                              {tiers.map((tier) => (
                                <td key={tier.id} className="px-6 py-4 text-sm text-center text-gray-700 font-medium">
                                  {tier.max_concurrent_sessions || 0}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Basic Support */}
                          {tiers.some(t => t.features?.basic_support !== undefined) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Headphones className="h-4 w-4 text-blue-600" />
                                  Basic Support
                                </div>
                              </td>
                              {tiers.map((tier) => (
                                <td key={tier.id} className="px-6 py-4 text-sm text-center">
                                  {tier.features?.basic_support ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Priority Support */}
                          {tiers.some(t => t.features?.priority_support !== undefined) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Headphones className="h-4 w-4 text-yellow-600" />
                                  Priority Support
                                </div>
                              </td>
                              {tiers.map((tier) => (
                                <td key={tier.id} className="px-6 py-4 text-sm text-center">
                                  {tier.features?.priority_support ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* API Access */}
                          {tiers.some(t => t.features?.api_access !== undefined) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-green-600" />
                                  API Access
                                </div>
                              </td>
                              {tiers.map((tier) => (
                                <td key={tier.id} className="px-6 py-4 text-sm text-center">
                                  {tier.features?.api_access ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Custom Avatars */}
                          {tiers.some(t => t.features?.custom_avatars !== undefined) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-purple-600" />
                                  Custom Avatars
                                </div>
                              </td>
                              {tiers.map((tier) => (
                                <td key={tier.id} className="px-6 py-4 text-sm text-center">
                                  {tier.features?.custom_avatars ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    {t('faq.frequently_asked_questions')}
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('faq.can_change_plan')}
                      </h3>
                      <p className="text-gray-600">
                        {t('faq.can_change_plan_answer')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('faq.payment_methods')}
                      </h3>
                      <p className="text-gray-600">
                        {t('faq.payment_methods_answer')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('faq.free_trial')}
                      </h3>
                      <p className="text-gray-600">
                        {t('faq.free_trial_answer')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('faq.cancel_subscription')}
                      </h3>
                      <p className="text-gray-600">
                        {t('faq.cancel_subscription_answer')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('faq.usage_limits')}
                      </h3>
                      <p className="text-gray-600">
                        {t('faq.usage_limits_answer')}
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
