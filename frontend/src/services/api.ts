import axios from 'axios';

// API Base URL configuration from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and network errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      
      // If proxy fails, try direct API call as fallback
      if (import.meta.env.DEV && error.config && !error.config.__isRetryRequest) {
        try {
          const directClient = axios.create({
            baseURL: API_BASE_URL,
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json',
            },
            timeout: 10000,
          });
          
          error.config.__isRetryRequest = true;
          const response = await directClient.request(error.config);
          return response;
        } catch (retryError) {
          console.error('Direct API call also failed:', retryError);
        }
      }
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    access_token_expiry: string;
    refresh_token_expiry: string;
    user_id: number;
    email: string;
    role: string;
  };
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  dob: string | null;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  is_admin: boolean;
  date_joined: string;
  additional_information: {
    bio?: string;
    interests?: string[];
    [key: string]: any;
  };
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  dob?: string;
  additional_information?: {
    bio?: string;
    interests?: string[];
    [key: string]: any;
  };
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: UserProfile[];
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface DeleteUserRequest {
  action: 'soft_delete' | 'change_status' | 'restore';
  status?: 'active' | 'inactive' | 'suspended';
  reason?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  dob?: string;
  preferred_language?: string;
  additional_information?: {
    bio?: string;
    interests?: string[];
    [key: string]: any;
  };
}

export interface Avatar {
  id: string;
  user_id: string;
  user: UserProfile;
  category: string;
  name: string;
  avatar_id: string;
  embed_url: string;
  preview_image: string;
  quality: 'low' | 'medium' | 'high';
  transparent_background: boolean;
  metadata: {
    quality: string;
    username: string;
    avatarName: string;
    previewImg: string;
    knowledgeBaseId: string;
    needRemoveBackground: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAvatarRequest {
  category: string;
  name: string;
  avatar_id: string;
  embed_url: string;
  preview_image: string;
  quality: 'low' | 'medium' | 'high';
  transparent_background: boolean;
  metadata: Record<string, any>;
  is_active: boolean;
}

export interface AvatarResponse {
  success: boolean;
  message: string;
  data: Avatar;
}

export interface AvatarsListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Avatar[];
  };
}

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login/', credentials);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiClient.post('/logout/', {
          refresh_token: refreshToken,
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
  },
};

export const userAPI = {
  getUserProfile: async (userId: number): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>(`/users/${userId}/`);
    return response.data;
  },

  updateUserProfile: async (userId: number, userData: UpdateUserRequest): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>(`/users/${userId}/update/`, userData);
    return response.data;
  },

  getAllUsers: async (page: number = 1, pageSize: number = 10): Promise<UsersListResponse> => {
    const response = await apiClient.get<UsersListResponse>(`/users/?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  deleteUser: async (userId: number, deleteData: DeleteUserRequest): Promise<ApiResponse<void>> => {
    const config: any = {
      method: 'DELETE',
      url: `/users/${userId}/delete/`,
      data: deleteData
    };
    const response = await apiClient.request<ApiResponse<void>>(config);
    return response.data;
  },

  createUser: async (userData: CreateUserRequest): Promise<UserProfileResponse> => {
    const response = await apiClient.post<UserProfileResponse>('/users/create/', userData);
    return response.data;
  },
};

export const avatarAPI = {
  getAllAvatars: async (page: number = 1, pageSize: number = 10): Promise<AvatarsListResponse> => {
    const response = await apiClient.get<AvatarsListResponse>(`/avatars/list/?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  getAvatar: async (avatarId: string): Promise<AvatarResponse> => {
    const response = await apiClient.get<AvatarResponse>(`/avatars/${avatarId}/`);
    return response.data;
  },

  createAvatar: async (avatarData: CreateAvatarRequest): Promise<AvatarResponse> => {
    const response = await apiClient.post<AvatarResponse>('/avatars/create/', avatarData);
    return response.data;
  },

  updateAvatar: async (avatarId: string, avatarData: Partial<CreateAvatarRequest>): Promise<AvatarResponse> => {
    const response = await apiClient.put<AvatarResponse>(`/avatars/${avatarId}/update/`, avatarData);
    return response.data;
  },

  deleteAvatar: async (avatarId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/avatars/${avatarId}/delete/`);
    return response.data;
  },
};

export interface SubscriptionTier {
  id: string;
  display_name: string;
  description: string;
  price: string;
  billing_interval: string;
  features: {
    conversations_per_month?: number;
    messages_per_conversation?: number;
    avatar_access?: boolean;
    priority_support?: boolean;
    [key: string]: any;
  };
  is_active: boolean;
  display_order: number;
}

export interface SubscriptionTiersResponse {
  success: boolean;
  message: string;
  data: SubscriptionTier[];
}

export interface Subscription {
  id: string;
  user: number;
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'canceled' | 'pending';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  usage?: {
    conversations_used: number;
    conversations_limit: number;
    conversations_remaining: number;
    conversations_percentage: number;
    video_minutes_used: number;
    video_minutes_limit: number;
    video_minutes_remaining: number;
    video_minutes_percentage: number;
    messages_sent: number;
    messages_limit: number;
    messages_remaining: number;
    messages_percentage: number;
    interactive_minutes_used: number;
    interactive_minutes_limit: number;
    interactive_minutes_remaining: number;
    interactive_minutes_percentage: number;
    period_start: string;
    period_end: string;
  };
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  data: Subscription;
}

export interface UsageData {
  messages_sent: number;
  messages_limit: number;
  messages_remaining: number;
  interactive_minutes_used: number;
  interactive_minutes_limit: number;
  period_start?: string;
  period_end?: string;
}

export interface UsageResponse {
  success: boolean;
  message: string;
  tier: string;
  data: UsageData;
}

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  tier: {
    id: string;
    name: string;
    price: string;
  };
  discount?: {
    code: string;
    amount: string;
  };
}

export interface PaymentIntentResponse {
  success: boolean;
  message: string;
  data: PaymentIntent;
}

export interface Payment {
  id: string;
  user: number;
  stripe_payment_intent_id: string;
  original_amount: string;
  discount_amount: string;
  final_amount: string;
  status: 'succeeded' | 'pending' | 'failed';
  created_at: string;
}

export interface PaymentsListResponse {
  success: boolean;
  message: string;
  data: Payment[];
}

export interface Invoice {
  id: string;
  invoice_number: string;
  subscription: string;
  original_amount: string;
  discount_amount: string;
  total_amount: string;
  issue_date: string;
  due_date: string;
  paid_at: string;
  status: 'paid' | 'unpaid' | 'overdue';
}

export interface InvoicesListResponse {
  success: boolean;
  message: string;
  data: Invoice[];
}

export interface UpgradeSubscriptionRequest {
  tier_id: string;
  discount_code?: string;
}

export interface UpgradeSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    tier: {
      id: string;
      name: string;
      price: string;
      billing_interval: string;
    };
    requires_payment: boolean;
    discount_code?: string;
  };
}

export const subscriptionAPI = {
  getSubscriptionTiers: async (): Promise<SubscriptionTiersResponse> => {
    const response = await apiClient.get<SubscriptionTiersResponse>('/subscriptions/tiers/');
    return response.data;
  },

  getCurrentSubscription: async (): Promise<SubscriptionResponse> => {
    const response = await apiClient.get<SubscriptionResponse>('/subscriptions/current/');
    return response.data;
  },

  getUsageStatistics: async (): Promise<UsageResponse> => {
    const response = await apiClient.get<UsageResponse>('/subscriptions/usage/');
    return response.data;
  },

  upgradeSubscription: async (upgradData: UpgradeSubscriptionRequest): Promise<UpgradeSubscriptionResponse> => {
    const response = await apiClient.post<UpgradeSubscriptionResponse>('/subscriptions/upgrade/', upgradData);
    return response.data;
  },

  cancelSubscription: async (): Promise<SubscriptionResponse> => {
    const response = await apiClient.post<SubscriptionResponse>('/subscriptions/cancel/', {});
    return response.data;
  },
};

export const paymentAPI = {
  createPaymentIntent: async (tierId: string, discountCode?: string): Promise<PaymentIntentResponse> => {
    const response = await apiClient.post<PaymentIntentResponse>('/payments/create-intent/', {
      tier_id: tierId,
      ...(discountCode && { discount_code: discountCode }),
    });
    return response.data;
  },

  getPaymentsList: async (): Promise<PaymentsListResponse> => {
    const response = await apiClient.get<PaymentsListResponse>('/payments/list/');
    return response.data;
  },

  getInvoicesList: async (): Promise<InvoicesListResponse> => {
    const response = await apiClient.get<InvoicesListResponse>('/invoices/');
    return response.data;
  },
};

// Conversation API Types
export interface Message {
  id: string;
  conversation: string;
  role: 'user' | 'assistant';
  sender_type: 'user_input' | 'gemini' | 'heygen' | 'system';
  content: string;
  metadata?: {
    tokens?: number;
    video_url?: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface Conversation {
  id: string;
  user: number;
  avatar?: Avatar;
  avatar_id?: string;
  title?: string;
  is_active: boolean;
  message_count: number;
  last_message?: string;
  last_message_at?: string;
  messages?: Message[];
  created_at: string;
  updated_at: string;
}

export interface ConversationsListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Conversation[];
  };
}

export interface ConversationDetailResponse {
  success: boolean;
  message: string;
  data: Conversation;
}

export interface CreateConversationRequest {
  avatar_id?: string;
  title?: string;
}

export interface AddMessageRequest {
  role: 'user' | 'assistant';
  sender_type: 'user_input' | 'gemini' | 'heygen' | 'system';
  content: string;
  metadata?: Record<string, any>;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface ArchiveConversationResponse {
  success: boolean;
  message: string;
  data: Conversation;
}

export const conversationAPI = {
  // List all conversations for the logged-in user
  listConversations: async (page: number = 1, pageSize: number = 10): Promise<ConversationsListResponse> => {
    const response = await apiClient.get<ConversationsListResponse>(
      `/conversations/?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  },

  // Create a new conversation
  createConversation: async (data: CreateConversationRequest): Promise<ConversationDetailResponse> => {
    const response = await apiClient.post<ConversationDetailResponse>('/conversations/', data);
    return response.data;
  },

  // Get a specific conversation with all its messages
  getConversation: async (conversationId: string): Promise<ConversationDetailResponse> => {
    const response = await apiClient.get<ConversationDetailResponse>(`/conversations/${conversationId}/`);
    return response.data;
  },

  // Add a message to a conversation
  addMessage: async (conversationId: string, messageData: AddMessageRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      `/conversations/${conversationId}/messages/`,
      messageData
    );
    return response.data;
  },

  // Archive (soft delete) a conversation
  archiveConversation: async (conversationId: string): Promise<ArchiveConversationResponse> => {
    const response = await apiClient.delete<ArchiveConversationResponse>(`/conversations/${conversationId}/`);
    return response.data;
  },
};

// ============================================================================
// ADMIN API TYPES AND ENDPOINTS
// ============================================================================

// Subscription Tier Management
export interface SubscriptionTierDetail {
  id: string;
  name?: string;
  display_name: string;
  description: string;
  price: string | number;
  billing_interval: 'month' | 'year';
  conversations_per_month?: number;
  video_minutes_per_month?: number;
  messages_per_month?: number;
  interactive_minutes_per_month?: number;
  max_concurrent_sessions?: number;
  features: Record<string, any>;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  stripe_price_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionTiersListResponse {
  success: boolean;
  message: string;
  data: SubscriptionTierDetail[];
}

export interface SubscriptionTierResponse {
  success: boolean;
  message: string;
  data: SubscriptionTierDetail;
}

export interface CreateSubscriptionTierRequest {
  display_name: string;
  description: string;
  price: number;
  billing_interval: 'month' | 'year';
  conversations_per_month?: number;
  video_minutes_per_month?: number;
  messages_per_month?: number;
  interactive_minutes_per_month?: number;
  max_concurrent_sessions?: number;
  features?: Record<string, any>;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export interface UpdateSubscriptionTierRequest extends Partial<CreateSubscriptionTierRequest> {}

// User Subscription & Usage
export interface UserSubscriptionDetail {
  id: string;
  user_id: string;
  tier: SubscriptionTierDetail;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  usage: {
    messages: { used: number; limit: number; remaining: number; percentage: number };
    interactive_minutes: { used: number; limit: number; remaining: number; percentage: number };
    conversations: { used: number; limit: number; remaining: number; percentage: number };
    video_minutes: { used: number; limit: number; remaining: number; percentage: number };
    period_start: string;
    period_end: string;
  };
  days_until_renewal: number;
  created_date: string;
}

export interface UserSubscriptionResponse {
  success: boolean;
  message: string;
  data: UserSubscriptionDetail;
}

export interface UsageOverrideRequest {
  user_id: string;
  messages_limit?: number;
  interactive_minutes_limit?: number;
  conversations_limit?: number;
  video_minutes_limit?: number;
  max_concurrent_sessions?: number;
  reason?: string;
}

export interface UsageResetRequest {
  user_id: string;
  reason?: string;
}

export interface UsageSummary {
  success: boolean;
  message: string;
  data: {
    messages: { used: number; limit: number; remaining: number };
    interactive_minutes: { used: number; limit: number; remaining: number };
    conversations: { used: number; limit: number; remaining: number };
    video_minutes: { used: number; limit: number; remaining: number };
  };
}

// User Subscriptions List for Admin
export interface UserSubscriptionTier {
  tier_name: string;
  tier_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  price: string;
  billing_interval: string;
  current_period_start: string;
  current_period_end: string;
  days_until_renewal: number;
  cancel_at_period_end: boolean;
}

export interface UserUsageData {
  messages_sent: number;
  messages_limit: number;
  messages_remaining: number;
  conversations_used: number;
  conversations_limit: number;
  conversations_remaining: number;
  interactive_minutes_used: number;
  interactive_minutes_limit: number;
  interactive_minutes_remaining: number;
  video_minutes_used: number;
  video_minutes_limit: number;
  video_minutes_remaining: number;
}

export interface AdminUserSubscription {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
  status: 'active' | 'inactive' | 'suspended';
  subscription: UserSubscriptionTier;
  usage: UserUsageData;
}

export interface AdminUsersSubscriptionsResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: AdminUserSubscription[];
  };
}

export interface AdminUsersSubscriptionsFilterParams {
  page?: number;
  page_size?: number;
  status?: string;
  tier_id?: string;
  search?: string;
}

// Activity Logs
export interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  status: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ActivityLogsResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: ActivityLog[];
  };
}

export interface ActivityLogsFilterParams {
  page?: number;
  page_size?: number;
  action?: string;
  resource_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

// Billing & Payments
export interface Transaction {
  payment_id: string;
  user_email: string;
  user_id: string;
  original_amount: string;
  discount_amount: string;
  final_amount: string;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  stripe_payment_intent_id: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionsListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Transaction[];
  };
}

export interface TransactionsFilterParams {
  page?: number;
  page_size?: number;
  status?: 'completed' | 'pending' | 'failed';
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface RefundRequest {
  transaction_id: string;
  reason: string;
  amount?: number;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  data: {
    refund_id: string;
    transaction_id: string;
    amount: string;
    status: string;
    created_date: string;
  };
}

// Admin API
export const adminAPI = {
  // ========== SUBSCRIPTION TIERS ==========
  
  // GET /api/subscriptions/tiers/
  getAllSubscriptionTiers: async (): Promise<SubscriptionTiersListResponse> => {
    const response = await apiClient.get<SubscriptionTiersListResponse>('/subscriptions/tiers/');
    return response.data;
  },

  // GET /api/subscriptions/tiers/{tier_id}/
  getSubscriptionTierDetail: async (tierId: string): Promise<SubscriptionTierResponse> => {
    const response = await apiClient.get<SubscriptionTierResponse>(`/subscriptions/tiers/${tierId}/`);
    return response.data;
  },

  // POST /api/subscriptions/tiers/
  createSubscriptionTier: async (data: CreateSubscriptionTierRequest): Promise<SubscriptionTierResponse> => {
    const response = await apiClient.post<SubscriptionTierResponse>('/subscriptions/tiers/', data);
    return response.data;
  },

  // PUT /api/subscriptions/tiers/{tier_id}/
  updateSubscriptionTier: async (tierId: string, data: UpdateSubscriptionTierRequest): Promise<SubscriptionTierResponse> => {
    const response = await apiClient.put<SubscriptionTierResponse>(`/subscriptions/tiers/${tierId}/`, data);
    return response.data;
  },

  // DELETE /api/subscriptions/tiers/{tier_id}/
  deleteSubscriptionTier: async (tierId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/subscriptions/tiers/${tierId}/`);
    return response.data;
  },

  // ========== USER SUBSCRIPTIONS & USAGE ==========
  
  // GET /api/subscriptions/current/
  getCurrentUserSubscription: async (): Promise<UserSubscriptionResponse> => {
    const response = await apiClient.get<UserSubscriptionResponse>('/subscriptions/current/');
    return response.data;
  },

  // GET /api/users/{user_id}/subscription/
  getUserSubscriptionDetail: async (userId: string): Promise<UserSubscriptionResponse> => {
    const response = await apiClient.get<UserSubscriptionResponse>(`/users/${userId}/subscription/`);
    return response.data;
  },

  // GET /api/subscriptions/admin/users-subscriptions/
  getAllUsersSubscriptions: async (filters?: AdminUsersSubscriptionsFilterParams): Promise<AdminUsersSubscriptionsResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.page_size) params.append('page_size', filters.page_size.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.tier_id) params.append('tier_id', filters.tier_id);
      if (filters.search) params.append('search', filters.search);
    }
    const queryString = params.toString();
    const url = `/subscriptions/admin/users-subscriptions/${queryString ? '?' + queryString : ''}`;
    const response = await apiClient.get<AdminUsersSubscriptionsResponse>(url);
    return response.data;
  },

  // GET /api/subscriptions/usage/current/
  getCurrentUsageStatistics: async (): Promise<UsageSummary> => {
    const response = await apiClient.get<UsageSummary>('/subscriptions/usage/current/');
    return response.data;
  },

  // PUT /api/subscriptions/usage/override-limits/
  overrideUserLimits: async (data: UsageOverrideRequest): Promise<UsageSummary> => {
    const response = await apiClient.put<UsageSummary>('/subscriptions/usage/override-limits/', data);
    return response.data;
  },

  // POST /api/subscriptions/usage/reset/
  resetUserUsage: async (data: UsageResetRequest): Promise<UsageSummary> => {
    const response = await apiClient.post<UsageSummary>('/subscriptions/usage/reset/', data);
    return response.data;
  },

  // ========== ACTIVITY LOGS ==========
  
  // GET /api/activity/admin/logs/
  getActivityLogs: async (filters?: ActivityLogsFilterParams): Promise<ActivityLogsResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.page_size) params.append('page_size', filters.page_size.toString());
      if (filters.action) params.append('action', filters.action);
      if (filters.resource_type) params.append('resource_type', filters.resource_type);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
    }
    const queryString = params.toString();
    const url = `/activity/admin/logs/${queryString ? '?' + queryString : ''}`;
    const response = await apiClient.get<ActivityLogsResponse>(url);
    return response.data;
  },

  // ========== PAYMENTS & TRANSACTIONS ==========
  
  // GET /api/subscriptions/admin/billing-details/
  getAllTransactions: async (filters?: TransactionsFilterParams): Promise<TransactionsListResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.page_size) params.append('page_size', filters.page_size.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
    }
    const queryString = params.toString();
    const url = `/subscriptions/admin/billing-details/${queryString ? '?' + queryString : ''}`;
    const response = await apiClient.get<TransactionsListResponse>(url);
    return response.data;
  },

  // POST /api/payments/refunds/
  issueRefund: async (data: RefundRequest): Promise<RefundResponse> => {
    const response = await apiClient.post<RefundResponse>('/payments/refunds/', data);
    return response.data;
  },
};

// ========== ANALYTICS INTERFACES ==========

export interface UserStatsResponse {
  total_users: number;
  active_users: number;
  new_users: {
    today: number;
    week: number;
    month: number;
  };
  subscription_breakdown: Array<{
    tier__display_name: string;
    count: number;
  }>;
  total_conversations: number;
  total_messages: number;
  avg_messages_per_user: number;
}

export interface ConversationStatsResponse {
  total_conversations: number;
  active_conversations: number;
  archived_conversations: number;
  total_messages: number;
  message_breakdown: {
    gemini: number;
    heygen: number;
    user_input: number;
  };
  time_metrics: {
    conversations_today: number;
    conversations_week: number;
  };
  user_metrics: {
    avg_conversations: number;
    max_conversations: number;
  };
}

export interface RevenueStatsResponse {
  total_revenue: number;
  revenue_today: number;
  revenue_month: number;
  active_subscriptions: number;
  mrr: number;
  total_discounts: number;
  revenue_by_tier: Array<{
    tier__display_name: string;
    count: number;
    monthly_revenue: number;
  }>;
  average_transaction: number;
}

export interface SystemHealthResponse {
  health_score: number;
  status: string;
  timestamp: string;
  metrics: {
    error_rate_percent: number;
    avg_response_time_ms: number;
    active_users: number;
    database_connections: number;
    critical_errors: number;
    warnings: number;
  };
}

export interface EventLog {
  id: string;
  event_type: string;
  severity: string;
  user: number;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface EventLogsResponse {
  count: number;
  results: EventLog[];
}

export interface DailyMetric {
  date: string;
  new_users: number;
  active_users: number;
  new_conversations: number;
  total_messages: number;
  revenue: number;
  errors: number;
}

export interface DailyMetricsResponse {
  count: number;
  results: DailyMetric[];
}

export interface HourlyMetric {
  timestamp: string;
  active_users: number;
  requests: number;
  errors: number;
  avg_response_time_ms: number;
  revenue: number;
}

export interface HourlyMetricsResponse {
  count: number;
  results: HourlyMetric[];
}

export interface UserStatistic {
  user: number;
  subscription_tier: string;
  conversations_count: number;
  messages_count: number;
  total_usage_percent: number;
  last_active_at: string;
}

export interface UserStatisticsListResponse {
  count: number;
  results: UserStatistic[];
}

export const analyticsAPI = {
  // GET /api/admin/analytics/users/stats/
  getUserStats: async (): Promise<UserStatsResponse> => {
    const response = await apiClient.get<any>('/admin/analytics/users/stats/');
    return response.data.data || response.data;
  },

  // GET /api/admin/analytics/conversations/stats/
  getConversationStats: async (): Promise<ConversationStatsResponse> => {
    const response = await apiClient.get<any>('/admin/analytics/conversations/stats/');
    return response.data.data || response.data;
  },

  // GET /api/admin/analytics/revenue/
  getRevenueStats: async (): Promise<RevenueStatsResponse> => {
    const response = await apiClient.get<any>('/admin/analytics/revenue/');
    return response.data.data || response.data;
  },

  // GET /api/admin/analytics/system-health/
  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    const response = await apiClient.get<any>('/admin/analytics/system-health/');
    return response.data.data || response.data;
  },

  // GET /api/admin/analytics/events/
  getEventLogs: async (filters?: {
    event_type?: string;
    severity?: string;
    user_id?: number;
    days?: number;
  }): Promise<EventLogsResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.event_type) params.append('event_type', filters.event_type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.user_id) params.append('user_id', filters.user_id.toString());
      if (filters.days) params.append('days', filters.days.toString());
    }
    const queryString = params.toString();
    const url = `/admin/analytics/events/${queryString ? '?' + queryString : ''}`;
    const response = await apiClient.get<any>(url);
    return response.data.data || response.data;
  },

  // GET /api/admin/analytics/daily-metrics/
  getDailyMetrics: async (days: number = 30): Promise<DailyMetricsResponse> => {
    const response = await apiClient.get<any>(`/admin/analytics/daily-metrics/?days=${days}`);
    return response.data.data || response.data;
  },

  // GET /api/admin/analytics/hourly-metrics/
  getHourlyMetrics: async (hours: number = 24): Promise<HourlyMetricsResponse> => {
    const response = await apiClient.get<any>(`/admin/analytics/hourly-metrics/?hours=${hours}`);
    return response.data.data || response.data;
  },

  // GET /api/admin/analytics/user-statistics/
  getUserStatistics: async (filters?: {
    tier?: string;
    active?: boolean;
  }): Promise<UserStatisticsListResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.tier) params.append('tier', filters.tier);
      if (filters.active !== undefined) params.append('active', filters.active.toString());
    }
    const queryString = params.toString();
    const url = `/admin/analytics/user-statistics/${queryString ? '?' + queryString : ''}`;
    const response = await apiClient.get<any>(url);
    return response.data.data || response.data;
  },
};

export default apiClient;