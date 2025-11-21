import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';
import { AuthResponse, LoginRequest, User } from '../types/api';

export class AuthService {
  // Login con soporte para 2FA
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        const { token, user, requires2FA } = response.data;
        
        if (requires2FA) {
          // Si requiere 2FA, retornar sin guardar token
          return {
            success: true,
            message: 'Se requiere código 2FA',
            requires2FA: true
          };
        }
        
        if (token && user) {
          // Guardar token y datos de usuario
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
          
          return {
            success: true,
            message: 'Login exitoso',
            user,
            token
          };
        }
      }
      
      return response.data || { success: false, message: 'Error en login' };
    } catch (error: any) {
      throw error;
    }
  }

  // Verificar código 2FA
  async verify2FA(email: string, password: string, otpCode: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', {
        email,
        password,
        otpCode
      });

      if (response.success && response.data) {
        const { token, user } = response.data;
        
        if (token && user) {
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
          
          return {
            success: true,
            message: 'Autenticación 2FA exitosa',
            user,
            token
          };
        }
      }

      return response.data || { success: false, message: 'Código 2FA inválido' };
    } catch (error: any) {
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error durante logout:', error);
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Verificar si está autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Cambiar contraseña
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return response.data || { success: false, message: 'Error cambiando contraseña' };
    } catch (error: any) {
      throw error;
    }
  }

  // Solicitar reset de contraseña
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/forgot-password', {
        email
      });
      
      return response.data || { success: false, message: 'Error enviando email' };
    } catch (error: any) {
      throw error;
    }
  }

  // Actualizar perfil de usuario
  async updateProfile(userData: Partial<User>): Promise<AuthResponse> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw { success: false, message: 'Usuario no encontrado' };
      }

      const response = await apiService.put<AuthResponse>(`/users/${currentUser.id}`, userData);
      
      if (response.success && response.data?.user) {
        // Actualizar datos en storage
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      return response.data || { success: false, message: 'Error actualizando perfil' };
    } catch (error: any) {
      throw error;
    }
  }

  // Obtener token actual
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();