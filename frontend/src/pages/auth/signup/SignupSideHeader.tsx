import React from 'react';

const SignupSideHeader: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-24 pointer-events-none">
      {/* Logo - Left Side */}
      <div className="absolute left-4 sm:left-8 top-6 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VT</span>
          </div>
          <span className="hidden sm:inline font-bold text-lg text-gray-900">Virtual Tutor AI</span>
        </div>
      </div>

      {/* Login Link - Right Side */}
      <div className="absolute right-4 sm:right-8 top-6 pointer-events-auto">
        <a
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base transition"
        >
          Already have an account? <span className="underline">Login</span>
        </a>
      </div>
    </div>
  );
};

export default SignupSideHeader;

