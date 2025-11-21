import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIResponse } from '../types/api';

// Configuración de la API
const API_BASE_URL = 'https://backend-gym-5.vercel.app';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        console.log('API Request:', {
          url: `${config.baseURL}${config.url}`,
          method: config.method,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : null
        });
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('API Response Success:', {
          url: response.config.url,
          status: response.status,
          dataPreview: typeof response.data === 'object' ? Object.keys(response.data || {}) : response.data
        });
        return response;
      },
      async (error) => {
        console.error('API Response Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // Si el token expira, redirecto al login
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos genéricos
  async get<T = any>(endpoint: string, params?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post<T = any>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    try {
      console.log(`ApiService: POST ${endpoint}`, data);
      const response = await this.api.post(endpoint, data);
      console.log(`ApiService: POST ${endpoint} response:`, {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      console.error(`ApiService: POST ${endpoint} error:`, error);
      throw this.handleError(error);
    }
  }

  async put<T = any>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete<T = any>(endpoint: string): Promise<APIResponse<T>> {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Error de respuesta del servidor
      return {
        success: false,
        message: error.response.data?.message || 'Error del servidor',
        error: error.response.data?.error || 'Server Error',
      };
    } else if (error.request) {
      // Error de red
      return {
        success: false,
        message: 'Error de conexión. Verifica tu internet.',
        error: 'Network Error',
      };
    } else {
      // Otro tipo de error
      return {
        success: false,
        message: 'Error inesperado',
        error: error.message || 'Unknown Error',
      };
    }
  }

  // Métodos de autenticación
  async login(email: string, password: string): Promise<APIResponse> {
    return this.post('/api/auth/login', { email, password });
  }

  async verify2FA(userId: string, code: string): Promise<APIResponse> {
    return this.post('/api/auth/verify-otp', { userId, otpCode: code });
  }

  async refreshToken(): Promise<APIResponse> {
    return this.post('/api/auth/refresh-token');
  }

  // Métodos de clases
  async getClasses(): Promise<APIResponse> {
    return this.get('/api/classes');
  }

  async getAvailableClasses(): Promise<APIResponse> {
    return this.get('/api/classes/available');
  }

  async getMyClasses(): Promise<APIResponse> {
    return this.get('/api/classes/my-classes');
  }

  async reserveClass(classId: string): Promise<APIResponse> {
    return this.post(`/api/classes/${classId}/reserve`);
  }

  async cancelReservation(classId: string): Promise<APIResponse> {
    return this.delete(`/api/classes/${classId}/reserve`);
  }

  // Métodos de dashboard y estadísticas
  async getDashboardStats(): Promise<APIResponse> {
    return this.get('/api/dashboard/stats');
  }

  async getMemberStats(): Promise<APIResponse> {
    return this.get('/api/members/my-stats');
  }

  async getMemberProfile(): Promise<APIResponse> {
    return this.get('/api/members/profile');
  }

  async updateMemberProfile(data: any): Promise<APIResponse> {
    return this.put('/api/members/profile', data);
  }

  // Métodos de check-ins
  async getMyCheckIns(): Promise<APIResponse> {
    return this.get('/api/checkins/my-checkins');
  }

  async createCheckIn(data: { qrCode: string, branchId: string }): Promise<APIResponse> {
    return this.post('/api/checkins', data);
  }

  async checkOut(checkInId: string, notes?: string): Promise<APIResponse> {
    return this.put(`/api/checkins/${checkInId}/checkout`, { notes });
  }

  async getActiveCheckIn(): Promise<APIResponse> {
    return this.get('/api/checkins/active');
  }

  // Método para cambiar la URL base si es necesario
  setBaseURL(url: string) {
    this.api.defaults.baseURL = url;
  }
}

export const apiService = new ApiService();