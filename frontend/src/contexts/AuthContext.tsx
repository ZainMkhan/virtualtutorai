import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, subscriptionAPI, userAPI, type LoginRequest } from '../services/api';

interface User {
  user_id: number;
  email: string;
  role: string;
  name?: string;
}

interface CurrentSubscription {
  tierName: string;
  tierId: string;
  status: string;
}

interface UsageData {
  messages_sent: number;
  messages_limit: number;
  interactive_minutes_used: number;
  interactive_minutes_limit: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  currentSubscription: CurrentSubscription | null;
  usageData: UsageData | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  refreshUsageData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current subscription
  const fetchCurrentSubscription = async () => {
    try {
      const response = await subscriptionAPI.getCurrentSubscription();
      if (response.success && response.data) {
        const tier = response.data.tier;
        // Try display_name first (API standard), then name as fallback
        const tierName = tier.display_name || (tier as any).name || 'free';
        const status = response.data.status || 'active';
        
        console.log('Subscription fetched:', { tierName, status, tierId: tier.id });
        
        setCurrentSubscription({
          tierName: tierName.charAt(0).toUpperCase() + tierName.slice(1).toLowerCase(),
          tierId: tier.id,
          status: status,
        });
        
        // Cache subscription data to localStorage for consistency
        const subscriptionData = {
          tierName: tierName.charAt(0).toUpperCase() + tierName.slice(1).toLowerCase(),
          tierId: tier.id,
          status: status,
        };
        localStorage.setItem('userSubscription', JSON.stringify(subscriptionData));

        // Extract usage from subscription response
        if (response.data.usage) {
          console.log('✅ Usage data found in subscription:', response.data.usage);
          const usageData: UsageData = {
            messages_sent: Number(response.data.usage.messages_sent || 0),
            messages_limit: Number(response.data.usage.messages_limit || 0),
            interactive_minutes_used: Number(response.data.usage.interactive_minutes_used || 0),
            interactive_minutes_limit: Number(response.data.usage.interactive_minutes_limit || 0),
          };
          console.log('✅ Setting usage data from subscription:', usageData);
          setUsageData(usageData);
        }
      } else {
        // No active subscription, default to free
        console.warn('No subscription data returned');
        setCurrentSubscription({
          tierName: 'Free',
          tierId: 'free',
          status: 'free',
        });
        localStorage.setItem('userSubscription', JSON.stringify({
          tierName: 'Free',
          tierId: 'free',
          status: 'free',
        }));
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      // Try to use cached subscription data
      const cachedSubscription = localStorage.getItem('userSubscription');
      if (cachedSubscription) {
        try {
          setCurrentSubscription(JSON.parse(cachedSubscription));
        } catch (e) {
          // Default to free on error
          setCurrentSubscription({
            tierName: 'Free',
            tierId: 'free',
            status: 'free',
          });
        }
      } else {
        setCurrentSubscription({
          tierName: 'Free',
          tierId: 'free',
          status: 'free',
        });
      }
    }
  };

  const refreshSubscription = async () => {
    await fetchCurrentSubscription();
  };

  // Fetch usage data
  const fetchUsageData = async () => {
    try {
      const response = await subscriptionAPI.getUsageStatistics();
      console.log('✅ Usage API Response:', response);
      console.log('✅ Response data fields:', Object.keys(response?.data || {}));
      
      if (response.success && response.data) {
        console.log('✅ Usage data fetched successfully');
        
        // Map all possible field variations
        const usageData: UsageData = {
          messages_sent: Number(response.data.messages_sent ?? response.data.sent ?? response.data.used ?? 0) || 0,
          messages_limit: Number(response.data.messages_limit ?? response.data.limit ?? 500) || 0,
          interactive_minutes_used: Number(response.data.interactive_minutes_used ?? response.data.minutes_used ?? 0) || 0,
          interactive_minutes_limit: Number(response.data.interactive_minutes_limit ?? response.data.minutes_limit ?? 1) || 0,
        };
        console.log('✅ Mapped usage data:', usageData);
        setUsageData(usageData);
      } else {
        throw new Error('No usage data in response');
      }
    } catch (error) {
      console.error('❌ Failed to fetch usage data:', error);
      // Don't overwrite existing data on error - only update if we get a successful response
      // Keep the previous usage data intact
    }
  };

  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(parsedUser);
          
          // Try to restore cached subscription first
          const cachedSubscription = localStorage.getItem('userSubscription');
          if (cachedSubscription) {
            try {
              setCurrentSubscription(JSON.parse(cachedSubscription));
            } catch (e) {
              console.error('Failed to parse cached subscription:', e);
            }
          }
          
          // Then fetch fresh subscription data
          // Add a small delay to ensure backend is ready
          setTimeout(() => {
            fetchCurrentSubscription();
            fetchUsageData();
          }, 500);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('userSubscription');
        }
      } else {
        // Default to free if no auth
        setCurrentSubscription({
          tierName: 'Free',
          tierId: 'free',
          status: 'free',
        });
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const userData: User = {
          user_id: response.data.user_id,
          email: response.data.email,
          role: response.data.role,
          name: (response.data as any).name || response.data.email.split('@')[0], // Fallback to email username
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        
        // Store tokens and user 
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        localStorage.setItem('userData', JSON.stringify(userData));

        // Fetch full user profile to get full name
        try {
          const profileResponse = await userAPI.getUserProfile(response.data.user_id);
          if (profileResponse.success && profileResponse.data.full_name) {
            const updatedUser: User = {
              ...userData,
              name: profileResponse.data.full_name,
            };
            setUser(updatedUser);
            localStorage.setItem('userData', JSON.stringify(updatedUser));
          }
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError);
          // Continue with basic user data
        }

        // Fetch subscription after successful login
        await fetchCurrentSubscription();
        await fetchUsageData();
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setCurrentSubscription(null);
      setUsageData(null);
      setError(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userSubscription');
    }
  };

  const value = {
    isAuthenticated,
    user,
    currentSubscription,
    usageData,
    login,
    logout,
    loading,
    error,
    refreshSubscription,
    refreshUsageData: fetchUsageData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};