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

export default apiClient;