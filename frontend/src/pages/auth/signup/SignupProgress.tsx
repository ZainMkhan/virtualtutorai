import React from 'react';
import { Check } from 'lucide-react';
import { SIGNUP_STEPS } from './signupConstants';

interface SignupProgressProps {
  currentStep: number;
}

const SignupProgress: React.FC<SignupProgressProps> = ({ currentStep }) => {
  return (
    <div className="mb-6">
      {/* Progress Steps - Minimal */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {SIGNUP_STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                currentStep >= step.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > step.number ? <Check size={18} /> : step.number}
            </div>
            {index < SIGNUP_STEPS.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignupProgress;
