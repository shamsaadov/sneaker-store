import type { Product, Category, FilterOptions } from '../types';

const API_BASE_URL = window.location.hostname === 'localhost' ?
    'https://steepstep.ru/api' :
    '/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    // Не указываем Content-Type здесь, чтобы не триггерить CORS preflight на GET
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
      Accept: 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: this.getAuthHeaders(),
      // mode: 'cors' // по умолчанию для cross-origin
    };

    try {
      // Добавляем Content-Type только если есть body и метод не GET/HEAD
      const method = (options.method || 'GET').toUpperCase();
      const hasBody = options.body !== undefined && options.body !== null;
      const mergedHeaders: HeadersInit = {
        ...defaultOptions.headers,
        ...options.headers,
        ...((method !== 'GET' && method !== 'HEAD' && hasBody) ? { 'Content-Type': 'application/json' } : {}),
      };

      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: mergedHeaders,
      });

      if (!response.ok) {
        // Handle 401 Unauthorized - clear token and redirect to login
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.reload();
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Products API
  async getProducts(filters?: Partial<FilterOptions>): Promise<Product[]> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.brands?.length) params.append('brands', filters.brands.join(','));
      if (filters.sizes?.length) params.append('sizes', filters.sizes.join(','));
      if (filters.priceRange) {
        params.append('min_price', filters.priceRange[0].toString());
        params.append('max_price', filters.priceRange[1].toString());
      }
      if (filters.categories?.length) params.append('categories', filters.categories.join(','));
      if (filters.sortBy) params.append('sort_by', filters.sortBy);
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder);
    }

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return this.request<Product[]>(endpoint);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.request<Product[]>(`/products/search/${encodeURIComponent(query)}`);
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return this.request<Product[]>(`/products/featured/list?limit=${limit}`);
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getCategory(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    return this.request<Category>(`/categories/slug/${slug}`);
  }

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Filters API
  async getBrands(): Promise<string[]> {
    return this.request<string[]>('/products/filters/brands');
  }

  async getSizes(): Promise<number[]> {
    return this.request<number[]>('/products/filters/sizes');
  }

  async getPriceRange(): Promise<{ min: number; max: number }> {
    return this.request<{ min: number; max: number }>('/products/filters/price-range');
  }

  // Orders API
  async getOrders(filters?: any): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters) {
      for (const key of Object.keys(filters)) {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key].toString());
        }
      }
    }

    const queryString = params.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    return this.request<any[]>(endpoint);
  }

  async getOrder(id: string): Promise<any> {
    return this.request<any>(`/orders/${id}`);
  }

  async getOrderByNumber(orderNumber: string): Promise<any> {
    return this.request<any>(`/orders/number/${orderNumber}`);
  }

  async createOrder(orderData: any): Promise<any> {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, updateData: any): Promise<any> {
    return this.request<any>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async updateOrderStatus(id: string, status: string, notes?: string): Promise<any> {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  async deleteOrder(id: string): Promise<void> {
    await this.request<void>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }



  async getPendingOrders(): Promise<any[]> {
    return this.request<any[]>('/orders/admin/pending');
  }

  async getRecentOrders(limit = 10): Promise<any[]> {
    return this.request<any[]>(`/orders/admin/recent?limit=${limit}`);
  }

  async getOrdersStatistics(): Promise<any> {
    return this.request<any>('/orders/admin/statistics');
  }

  // Special Orders API
  async getSpecialOrders(filters?: any): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key].toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/special-orders${queryString ? `?${queryString}` : ''}`;
    return this.request<any[]>(endpoint);
  }

  async getSpecialOrder(id: string): Promise<any> {
    return this.request<any>(`/special-orders/${id}`);
  }

  async createSpecialOrder(orderData: any): Promise<any> {
    return this.request<any>('/special-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateSpecialOrder(id: string, updateData: any): Promise<any> {
    return this.request<any>(`/special-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async updateSpecialOrderStatus(id: string, status: string, adminNotes?: string): Promise<any> {
    return this.request<any>(`/special-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
  }

  async setSpecialOrderEstimate(id: string, estimatedPrice: number, estimatedDelivery?: string, adminNotes?: string): Promise<any> {
    return this.request<any>(`/special-orders/${id}/estimate`, {
      method: 'PATCH',
      body: JSON.stringify({
        estimated_price: estimatedPrice,
        estimated_delivery: estimatedDelivery,
        admin_notes: adminNotes
      }),
    });
  }

  async markSpecialOrderAsFound(id: string, foundProductUrl: string, finalPrice?: number, adminNotes?: string): Promise<any> {
    return this.request<any>(`/special-orders/${id}/found`, {
      method: 'PATCH',
      body: JSON.stringify({
        found_product_url: foundProductUrl,
        final_price: finalPrice,
        admin_notes: adminNotes
      }),
    });
  }

  async deleteSpecialOrder(id: string): Promise<void> {
    await this.request<void>(`/special-orders/${id}`, {
      method: 'DELETE',
    });
  }



  async getUrgentSpecialOrders(): Promise<any[]> {
    return this.request<any[]>('/special-orders/admin/urgent');
  }

  async getSpecialOrdersStatistics(): Promise<any> {
    return this.request<any>('/special-orders/admin/statistics');
  }

  // Analytics API
  async getDashboardAnalytics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalUsers: number;
    breakdown: {
      regularOrders: number;
      specialOrders: number;
    };
  }> {
    return this.request('/analytics/dashboard');
  }

  async getMonthlyAnalytics(): Promise<Array<{
    month: string;
    revenue: number;
    orders: number;
    products: number;
  }>> {
    return this.request('/analytics/monthly');
  }

  async getRecentActivity(): Promise<Array<{
    action: string;
    item: string;
    time: string;
    type: string;
    icon: string;
  }>> {
    return this.request('/analytics/activity');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }

  // Authentication API
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const result = await this.request<{ user: any; token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    return result;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<{ user: any; token: string }> {
    const result = await this.request<{ user: any; token: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/users/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  async getProfile(): Promise<any> {
    return this.request('/users/profile');
  }

  async updateProfile(userData: { name?: string; email?: string }): Promise<any> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<void> {
    return this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  }

  async createAdmin(adminData: {
    email: string;
    password: string;
    name: string;
    adminKey: string;
  }): Promise<any> {
    return this.request('/users/create-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  // Check if user is logged in and token is valid
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get current user from localStorage
  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const apiService = new ApiService();
export default apiService;
