import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import InlineLoading from '../../components/loading/InlineLoading';
import { Particles } from '../../components/shared/Particles';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col lg:flex-row">
      <div className="flex-1 m-5 rounded-lg bg-blue-600 flex flex-col items-center justify-center text-white relative px-4 py-8 lg:py-0 overflow-hidden">
        {/* Particles Background */}
        <div className="absolute inset-0 z-0">
          <Particles
            quantity={200}
            staticity={80}
            ease={50}
            size={0.8}
            color="#ffffff"
          />
        </div>

        {/* Logo and Content */}
        <div className="mb-8 text-center max-w-sm relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-3xl sm:text-4xl font-bold text-blue-600">VT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 px-2">Virtual Tutor AI</h1>
          <p className="text-blue-100 text-center text-base sm:text-lg px-2">Leading virtual tutoring platform</p>
        </div>
        
        <div className="hidden lg:block absolute top-10 left-10 w-32 h-32 border border-blue-400 rounded-full opacity-20 z-0"></div>
        <div className="hidden lg:block absolute bottom-10 right-10 w-24 h-24 border border-blue-400 rounded-full opacity-20 z-0"></div>
        <div className="hidden lg:block absolute top-1/3 right-20 w-16 h-16 border border-blue-400 rounded-full opacity-20 z-0"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 m-5 rounded-lg bg-gray-50 flex items-center justify-center px-4 py-8 lg:px-8">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Hello Again!</h2>
              <p className="text-gray-600 text-base sm:text-lg">Welcome Back</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12 text-base"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12 pr-12 text-base"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 1.657-.672 3.157-1.757 4.243A6 6 0 0121 12a6 6 0 00-6-6" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot Password?
                  </a>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isSubmitting ? (
                  <InlineLoading text="Signing in..." />
                ) : (
                  'Sign in'
                )}
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <a
                href="/signup"
                className="w-full flex justify-center items-center py-3 sm:py-4 px-4 border border-blue-600 rounded-md shadow-sm text-base font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              >
                Sign Up
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;