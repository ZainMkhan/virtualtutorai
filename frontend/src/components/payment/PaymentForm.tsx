import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { Loader2, AlertCircle, Check } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  tierName: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  clientSecret: string;
  isLoading?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  tierName,
  onSuccess,
  onError,
  clientSecret,
  isLoading = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system not loaded');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);

      if (!cardNumberElement) {
        setError('Card element not found');
        setProcessing(false);
        return;
      }

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: 'Customer',
          },
        },
      });

      if (result.error) {
        // Show error to customer
        setError(result.error.message || 'Payment failed');
        onError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Payment succeeded
        setSucceeded(true);
        setError(null);
        onSuccess();
      } else {
        setError('Payment was not completed');
        onError('Payment was not completed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during payment';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <div className="flex justify-center mb-4">
          <Check className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-green-700">
          Your subscription to {tierName} has been activated.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Upgrading to {tierName}</span>
          <span className="text-2xl font-bold text-gray-900">
            ${(amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Card Fields */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardNumberElement
            options={cardElementOptions}
            onChange={(e: any) => {
              setCardComplete(e.complete);
              if (e.error) {
                setError(e.error.message);
              } else {
                setError(null);
              }
            }}
          />
        </div>
      </div>

      {/* Expiry and CVC in a row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            <CardExpiryElement
              options={cardElementOptions}
              onChange={(e: any) => {
                setExpiryComplete(e.complete);
                if (e.error) {
                  setError(e.error.message);
                } else {
                  setError(null);
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            CVC
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            <CardCvcElement
              options={cardElementOptions}
              onChange={(e: any) => {
                setCvcComplete(e.complete);
                if (e.error) {
                  setError(e.error.message);
                } else {
                  setError(null);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={processing || isLoading || !stripe}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
          processing || isLoading || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {processing || isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <span>Complete Payment</span>
        )}
      </button>

      {/* Test Card Info */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800 font-medium mb-2">Testing Mode</p>
        <p className="text-xs text-amber-700">
          Use card number <code className="font-mono font-semibold">4242 4242 4242 4242</code>,
          any future expiry date, and any 3-digit CVC.
        </p>
      </div>
    </form>
  );
};

export default PaymentForm;
