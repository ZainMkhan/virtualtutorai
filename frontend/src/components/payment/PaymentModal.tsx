import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import { Tag, AlertCircle, Check } from 'lucide-react';

interface PaymentModalProps {
  amount: number;
  tierName: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  clientSecret: string;
  isLoading?: boolean;
  onClose: () => void;
}

// Load Stripe.js dynamically
const loadStripe = async (publishableKey: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      if ((window as any).Stripe) {
        resolve((window as any).Stripe(publishableKey));
      }
    };
    if (!document.querySelector('script[src="https://js.stripe.com/v3/"]')) {
      document.head.appendChild(script);
    } else {
      resolve((window as any).Stripe(publishableKey));
    }
  });
};

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                              import.meta.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY ||
                              (window as any).__STRIPE_PUBLISHABLE_KEY;

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const PaymentModal: React.FC<PaymentModalProps> = ({
  amount,
  tierName,
  onSuccess,
  onError,
  clientSecret,
  isLoading,
  onClose,
}) => {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState('');

  const monthlyPrice = amount / 100;
  const yearlyPrice = monthlyPrice * 10;
  const basePrice = billingCycle === 'month' ? monthlyPrice : yearlyPrice;
  const finalPrice = basePrice - discountAmount;

  const handleApplyVoucher = () => {
    setVoucherError('');
    
    if (!voucherCode.trim()) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    const sampleVouchers: { [key: string]: number } = {
      'WELCOME10': basePrice * 0.10,
      'SAVE20': basePrice * 0.20,
      'SUMMER2025': 5.00,
      'STUDENT15': basePrice * 0.15,
    };

    const discount = sampleVouchers[voucherCode.toUpperCase()];
    if (discount) {
      setDiscountAmount(discount);
      setVoucherApplied(true);
      setVoucherError('');
    } else {
      setVoucherError('Invalid voucher code');
      setVoucherApplied(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setDiscountAmount(0);
    setVoucherApplied(false);
    setVoucherError('');
  };

  if (!stripePromise) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg">Payment system is not configured</p>
          <p className="text-gray-600 text-sm mt-2">Please check your Stripe configuration</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise as any}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-auto max-h-[90vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 md:p-8">
            {/* Left Column - Order Summary (40%) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plan Header */}
              <div className="pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {tierName} Plan
                </h2>
                <p className="text-sm text-gray-600 mt-1">Annual savings included</p>
              </div>

              {/* Order Summary Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-4">
                  {/* Plan Price */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">{tierName} Plan</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {billingCycle === 'month' ? 'Monthly billing' : 'Annual billing'}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      ${basePrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Annual Savings Badge */}
                  {billingCycle === 'year' && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800">
                        Annual savings included
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Save ${(monthlyPrice * 2).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-slate-300" />

                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">${basePrice.toFixed(2)}</span>
                  </div>

                  {/* Discount */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Discount ({voucherCode})</span>
                      <span className="font-medium text-green-700">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="bg-blue-600 rounded-lg p-4 text-center border-2 border-blue-700">
                    <p className="text-sm text-blue-100 mb-1">Total Amount</p>
                    <div className="text-4xl font-bold text-white">
                      ${Math.max(0, finalPrice).toFixed(2)}
                    </div>
                    <p className="text-xs text-blue-100 mt-2">
                      {billingCycle === 'month' ? 'charged monthly' : 'charged annually'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.72a1.066 1.066 0 01-1.275 1.056A10.02 10.02 0 0012 15.23a10.02 10.02 0 01-8.97 2.584 1.066 1.066 0 01-1.275-1.056v-6.72a3.066 3.066 0 012.812-3.062zM9 12a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
                <span>Secure Stripe Payment</span>
              </div>
            </div>

            {/* Right Column - Payment Form (60%) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Billing Cycle Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Billing Cycle
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setBillingCycle('month')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      billingCycle === 'month'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    Monthly
                    <div className="text-xs mt-1">
                      ${monthlyPrice.toFixed(2)}/month
                    </div>
                  </button>
                  <button
                    onClick={() => setBillingCycle('year')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all relative ${
                      billingCycle === 'year'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    Annual
                    <div className="text-xs mt-1">
                      ${yearlyPrice.toFixed(2)}/year
                    </div>
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>

              {/* Voucher Code Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <span>Promo Code (Optional)</span>
                  </div>
                </label>
                
                {!voucherApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value.toUpperCase());
                        setVoucherError('');
                      }}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={voucherApplied}
                    />
                    <button
                      onClick={handleApplyVoucher}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-700">{voucherCode} Applied</span>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                {voucherError && (
                  <div className="flex items-start space-x-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{voucherError}</p>
                  </div>
                )}

                <p className="text-xs text-gray-600">
                  Try: WELCOME10, SAVE20, STUDENT15, SUMMER2025
                </p>
              </div>

              {/* Payment Form */}
              <div className="border-t border-gray-200 pt-6">
                <PaymentForm
                  amount={Math.max(0, finalPrice * 100)}
                  tierName={tierName}
                  clientSecret={clientSecret}
                  onSuccess={onSuccess}
                  onError={onError}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default PaymentModal;
