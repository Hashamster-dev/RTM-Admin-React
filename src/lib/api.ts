// API Base URL - should be set via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  revenue?: number;
}

// Helper function to get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token
const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove auth token
const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

// API Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      // Handle unauthorized (token expired/invalid)
      if (response.status === 401) {
        removeToken();
        throw new Error('Unauthorized. Please sign in again.');
      }

      // Handle errors
      if (!data.success) {
        throw new Error(data.error || data.message || 'An error occurred');
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Add isAdminLogin flag for admin panel logins
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...credentials,
        isAdminLogin: true,
      }),
    });

    // Store token
    if (response.token) {
      setToken(response.token);
    }

    return response;
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'GET',
    });
  }

  async logout(): Promise<void> {
    removeToken();
  }

  // User endpoints (Admin only)
  async getUsers(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || result.message || 'Failed to fetch users');
    }

    // Backend returns: { success, message, data: User[], pagination: {...} }
    return {
      success: result.success,
      message: result.message || 'Users retrieved successfully',
      data: result.data || [],
      pagination: result.pagination,
    } as PaginatedResponse<User>;
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'GET',
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard stats endpoint
  async getDashboardStats(): Promise<DashboardStats> {
    // For now, we'll calculate stats from users
    // Later, you can create a dedicated endpoint
    const usersResponse = await this.getUsers({ limit: 1000 });
    const users = usersResponse.data || [];

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalUsers: usersResponse.pagination?.total || users.length,
      activeUsers: users.length, // You can enhance this with lastLogin tracking
      newUsersThisMonth: users.filter(
        (user) => new Date(user.createdAt) >= thisMonth
      ).length,
    };
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// Export token management functions
export { getToken, setToken, removeToken };

