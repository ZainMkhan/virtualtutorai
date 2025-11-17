import React from 'react';

interface SignupHeaderProps {
  currentStep: number;
  totalSteps: number;
}

const SignupHeader: React.FC<SignupHeaderProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="fixed top-0 w-full bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">VT</span>
          </div>
          <span className="hidden sm:inline font-bold text-lg text-gray-900">Virtual Tutor AI</span>
        </div>
        <div className="text-sm text-gray-600">
          Step <span className="font-bold text-blue-600">{currentStep}</span> of{' '}
          <span className="font-bold">{totalSteps}</span>
        </div>
      </div>
    </div>
  );
};

export default SignupHeader;
