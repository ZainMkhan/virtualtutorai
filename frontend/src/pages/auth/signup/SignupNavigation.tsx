import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import InlineLoading from '../../../components/loading/InlineLoading';

interface SignupNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: string | null;
}

const SignupNavigation: React.FC<SignupNavigationProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
  error,
}) => {
  return (
    <>
      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-8 border-t border-gray-200 items-center">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
        )}

        {/* Error Message Next to Button */}
        {error && (
          <div className="flex-1 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={onNext}
            className="ml-auto flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Next
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="ml-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? (
              <>
                <InlineLoading text="Creating account..." />
              </>
            ) : (
              <>
                Complete Signup
                <Check size={20} />
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
};

export default SignupNavigation;
