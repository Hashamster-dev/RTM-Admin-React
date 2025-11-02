// API Base URL - should be set via environment variable
// const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'https://rtm-backend.vercel.app/api';

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
  referralCode?: string;
  referredBy?: User | null;
  referredUsers?: User[];
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

export interface PaymentMethod {
  _id: string;
  name: string;
  ibanOrAccount: string;
  accountHolderName: string;
  logoUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  drawDate: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPurchase {
  _id: string;
  purchaseId: string;
  user: string | { _id: string; name: string; email: string; phone: string };
  ticket: string | { _id: string; name: string; price: number; imageUrl: string; drawDate: string; description?: string };
  paymentMethod: string | { _id: string; name: string; logoUrl: string; accountHolderName: string; ibanOrAccount: string };
  transactionId: string;
  quantity: number;
  amountPaid: number;
  receiptImageUrl: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string | { _id: string; name: string; email: string };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
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

  // Payment Methods endpoints (Admin only)
  async getPaymentMethods(activeOnly?: boolean): Promise<PaymentMethod[]> {
    const query = activeOnly !== undefined ? `?activeOnly=${activeOnly}` : '';
    return this.request<PaymentMethod[]>(`/payment-methods${query}`, {
      method: 'GET',
    });
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethod> {
    return this.request<PaymentMethod>(`/payment-methods/${id}`, {
      method: 'GET',
    });
  }

  async createPaymentMethod(data: {
    name: string;
    ibanOrAccount: string;
    accountHolderName: string;
    logo: File;
  }): Promise<PaymentMethod> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('ibanOrAccount', data.ibanOrAccount);
    formData.append('accountHolderName', data.accountHolderName);
    formData.append('logo', data.logo);

    const url = `${this.baseURL}/payment-methods`;
    const token = getToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const result: ApiResponse<PaymentMethod> = await response.json();

    if (!result.success) {
      throw new Error(result.error || result.message || 'Failed to create payment method');
    }

    if (response.status === 401) {
      removeToken();
      throw new Error('Unauthorized. Please sign in again.');
    }

    return result.data!;
  }

  async updatePaymentMethod(
    id: string,
    data: {
      name?: string;
      ibanOrAccount?: string;
      accountHolderName?: string;
      isActive?: boolean;
      logo?: File;
    }
  ): Promise<PaymentMethod> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.ibanOrAccount) formData.append('ibanOrAccount', data.ibanOrAccount);
    if (data.accountHolderName) formData.append('accountHolderName', data.accountHolderName);
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
    if (data.logo) formData.append('logo', data.logo);

    const url = `${this.baseURL}/payment-methods/${id}`;
    const token = getToken();

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const result: ApiResponse<PaymentMethod> = await response.json();

    if (!result.success) {
      throw new Error(result.error || result.message || 'Failed to update payment method');
    }

    if (response.status === 401) {
      removeToken();
      throw new Error('Unauthorized. Please sign in again.');
    }

    return result.data!;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await this.request(`/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }

  // Tickets endpoints (Admin only)
  async getTickets(activeOnly?: boolean): Promise<Ticket[]> {
    const query = activeOnly !== undefined ? `?activeOnly=${activeOnly}` : '';
    return this.request<Ticket[]>(`/tickets${query}`, {
      method: 'GET',
    });
  }

  async getTicketById(id: string): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}`, {
      method: 'GET',
    });
  }

  async createTicket(data: {
    name: string;
    description?: string;
    price: number;
    drawDate: string;
    image: File;
    sortOrder?: number;
  }): Promise<Ticket> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', String(data.price));
    formData.append('drawDate', data.drawDate);
    if (data.sortOrder !== undefined) {
      formData.append('sortOrder', String(data.sortOrder));
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('image', data.image);

    const url = `${this.baseURL}/tickets`;
    const token = getToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const result: ApiResponse<Ticket> = await response.json();

    if (!result.success) {
      throw new Error(result.error || result.message || 'Failed to create ticket');
    }

    if (response.status === 401) {
      removeToken();
      throw new Error('Unauthorized. Please sign in again.');
    }

    return result.data!;
  }

  async updateTicket(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      drawDate?: string;
      isActive?: boolean;
      sortOrder?: number;
      image?: File;
    }
  ): Promise<Ticket> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', String(data.price));
    if (data.drawDate) formData.append('drawDate', data.drawDate);
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
    if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
    if (data.image) formData.append('image', data.image);

    const url = `${this.baseURL}/tickets/${id}`;
    const token = getToken();

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const result: ApiResponse<Ticket> = await response.json();

    if (!result.success) {
      throw new Error(result.error || result.message || 'Failed to update ticket');
    }

    if (response.status === 401) {
      removeToken();
      throw new Error('Unauthorized. Please sign in again.');
    }

    return result.data!;
  }

  async deleteTicket(id: string): Promise<void> {
    await this.request(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  // Ticket Purchases endpoints (Admin only)
  async getTicketPurchases(status?: 'pending' | 'approved' | 'rejected'): Promise<TicketPurchase[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<TicketPurchase[]>(`/ticket-purchases${query}`, {
      method: 'GET',
    });
  }

  async getTicketPurchaseById(id: string): Promise<TicketPurchase> {
    return this.request<TicketPurchase>(`/ticket-purchases/${id}`, {
      method: 'GET',
    });
  }

  async updatePurchaseStatus(
    id: string,
    status: 'approved' | 'rejected',
    reviewNotes?: string
  ): Promise<TicketPurchase> {
    return this.request<TicketPurchase>(`/ticket-purchases/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewNotes }),
    });
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// Export token management functions
export { getToken, setToken, removeToken };

