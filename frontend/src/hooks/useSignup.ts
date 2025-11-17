import { useState } from 'react';
import { userAPI, type CreateUserRequest } from '../services/api';

interface SignupError {
  [key: string]: string[] | string;
}

interface UseSignupReturn {
  isLoading: boolean;
  error: string | null;
  signup: (userData: CreateUserRequest) => Promise<any>;
  clearError: () => void;
}

export function useSignup(): UseSignupReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (userData: CreateUserRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.createUser(userData);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Signup failed');
        throw new Error(response.message);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errors: SignupError = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        const errorText = Array.isArray(firstError) ? firstError[0] : String(firstError);
        setError(errorText);
      } else {
        setError(errorMessage);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    signup,
    clearError,
  };
}
