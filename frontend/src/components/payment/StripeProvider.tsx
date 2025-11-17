import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';

interface StripeProviderProps {
  children: ReactNode;
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
    document.head.appendChild(script);
  });
};

let stripePromiseInstance: Promise<any> | null = null;

const getStripePromise = (publishableKey: string) => {
  if (!stripePromiseInstance) {
    stripePromiseInstance = loadStripe(publishableKey);
  }
  return stripePromiseInstance;
};

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                                import.meta.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY ||
                                (window as any).__STRIPE_PUBLISHABLE_KEY;

  const stripePromise = useMemo(() => {
    if (!stripePublishableKey) {
      console.error('Stripe publishable key is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to .env');
      return null;
    }
    return getStripePromise(stripePublishableKey);
  }, [stripePublishableKey]);

  if (!stripePromise) {
    console.warn('Stripe not initialized - check your environment configuration');
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
