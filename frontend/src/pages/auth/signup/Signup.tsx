import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../../../hooks';
import SignupSideHeader from './SignupSideHeader';
import SignupProgress from './SignupProgress';
import SignupStep1 from './SignupStep1';
import SignupStep2 from './SignupStep2';
import SignupStep3 from './SignupStep3';
import SignupNavigation from './SignupNavigation';
import type { SignupFormData } from './signupConstants';
import { validateStep, SIGNUP_STEPS } from './signupConstants';

const TOTAL_STEPS = 3;

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    dob: '',
    preferred_language: 'en',
    bio: '',
    interests: [],
  });

  const { login, error: authError, isAuthenticated } = useAuth();
  const { signup, error: signupError } = useSignup();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLocalError('');
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = () => {
    const validation = validateStep(step, formData);
    if (!validation.isValid) {
      setLocalError(validation.error);
      return;
    }
    setLocalError('');
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setLocalError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateStep(step, formData);
    if (!validation.isValid) {
      setLocalError(validation.error);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user via API
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        dob: formData.dob,
        preferred_language: formData.preferred_language,
        additional_information: {
          bio: formData.bio,
          interests: formData.interests,
        },
      });

      // User created successfully, now log them in
      await login({ email: formData.email, password: formData.password });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Signup failed:', error);
      // Error is already set in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || signupError || authError;

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{
      background: `
        linear-gradient(135deg, 
          transparent 0%, 
          transparent 48%, 
          rgba(6, 182, 212, 0.25) 48%, 
          rgba(6, 182, 212, 0.25) 52%, 
          transparent 52%, 
          transparent 100%),
        radial-gradient(circle at 20% 80%, rgba(34, 197, 233, 0.2) 0%, transparent 40%),
        radial-gradient(circle at 80% 20%, rgba(3, 102, 214, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.1) 0%, transparent 60%),
        white
      `
    }}>
      {/* Side Elements */}
      <SignupSideHeader />

      {/* Main Content */}
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <SignupProgress currentStep={step} />

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {SIGNUP_STEPS[step - 1]?.title}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step Content */}
              {step === 1 && <SignupStep1 formData={formData} onInputChange={handleInputChange} />}
              {step === 2 && <SignupStep2 formData={formData} onInputChange={handleInputChange} />}
              {step === 3 && (
                <SignupStep3
                  formData={formData}
                  onInputChange={handleInputChange}
                  onInterestToggle={handleInterestToggle}
                />
              )}

              {/* Navigation */}
              <SignupNavigation
                currentStep={step}
                totalSteps={TOTAL_STEPS}
                isSubmitting={isSubmitting}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit}
                error={displayError}
              />
            </form>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-gray-500 text-xs">
            <p>We take your privacy seriously. Your information is encrypted and secure.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
