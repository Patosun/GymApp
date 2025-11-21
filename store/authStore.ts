import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'MEMBER' | 'TRAINER' | 'ADMIN';
  membershipId?: string;
  branchId?: string;
  qrCode?: string;
  member?: {
    id: string;
    qrCode: string;
    qrCodeExpiry: string;
  };
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  authToken: string | null;
  tempUserId: string | null; // Para almacenar temporalmente durante 2FA
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  verify2FA: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setRequires2FA: (requires: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  requires2FA: false,
  authToken: null,
  tempUserId: null,

  // Actions
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      console.log('AuthStore: Iniciando login con:', { email, password: '***' });
      const response = await apiService.login(email, password);
      
      console.log('AuthStore: Respuesta completa del servidor:', response);
      console.log('AuthStore: response.requires2FA:', response.requires2FA);
      console.log('AuthStore: response.success:', response.success);
      
      // apiService retorna APIResponse<T> con formato {success, data, message}
      if (response.success && response.data) {
        console.log('AuthStore: Login success, data:', response.data);
        
        if (response.requires2FA) {
          console.log('AuthStore: Se requiere 2FA, userId:', response.data.userId);
          // Requiere verificación 2FA
          set({ 
            requires2FA: true, 
            tempUserId: response.data.userId,
            isLoading: false 
          });
          return false;
        } else if (response.data.user && response.data.accessToken) {
          console.log('AuthStore: Login exitoso sin 2FA');
          console.log('AuthStore: Usuario recibido:', response.data.user);
          console.log('AuthStore: ¿Tiene member?', !!response.data.user.member);
          console.log('AuthStore: QR del member:', response.data.user.member?.qrCode);
          // Login exitoso sin 2FA - usar accessToken en lugar de token
          const { user, accessToken } = response.data;
          
          // Guardar en AsyncStorage
          await AsyncStorage.setItem('authToken', accessToken);
          await AsyncStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            authToken: accessToken,
            isAuthenticated: true,
            isLoading: false,
            requires2FA: false,
          });
          
          return true;
        } else {
          console.log('AuthStore: Respuesta sin user/accessToken esperados');
        }
      } else {
        console.log('AuthStore: Respuesta sin success o data:', {
          success: response.success,
          data: response.data,
          message: response.message
        });
      }
      
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  verify2FA: async (code: string) => {
    try {
      set({ isLoading: true });
      
      const { tempUserId } = get();
      if (!tempUserId) {
        throw new Error('No hay sesión de 2FA activa');
      }
      
      console.log('AuthStore: Verificando 2FA con:', { userId: tempUserId, code });
      const response = await apiService.verify2FA(tempUserId, code);
      
      console.log('AuthStore: Respuesta de verify2FA:', response);
      
      // apiService retorna APIResponse<T> con formato {success, data, message}
      if (response.success && response.data && response.data.user && response.data.accessToken) {
        const { user, accessToken } = response.data;
        
        console.log('AuthStore: Verify2FA exitoso, usuario:', user);
        console.log('AuthStore: ¿Tiene member en 2FA?', !!user.member);
        console.log('AuthStore: QR del member en 2FA:', user.member?.qrCode);
        
        // Guardar en AsyncStorage
        await AsyncStorage.setItem('authToken', accessToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        set({
          user,
          authToken: accessToken,
          isAuthenticated: true,
          isLoading: false,
          requires2FA: false,
          tempUserId: null, // Limpiar userId temporal
        });
        
        return true;
      } else {
        set({ isLoading: false });
        return false;
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      set({ isLoading: false });
      
      // Extraer el mensaje de error más específico
      let errorMessage = 'Error de verificación 2FA';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      // Limpiar AsyncStorage
      await AsyncStorage.multiRemove(['authToken', 'user']);
      
      // Resetear state
      set({
        user: null,
        isAuthenticated: false,
        authToken: null,
        requires2FA: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });
      
      const [storedToken, storedUser] = await AsyncStorage.multiGet(['authToken', 'user']);
      
      const token = storedToken[1];
      const userString = storedUser[1];
      
      if (token && userString) {
        const user = JSON.parse(userString);
        
        console.log('AuthStore: Usuario cargado del storage:', user);
        console.log('AuthStore: ¿Tiene member en storage?', !!user.member);
        console.log('AuthStore: QR del member en storage:', user.member?.qrCode);
        
        set({
          user,
          authToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load stored auth error:', error);
      set({ isLoading: false });
    }
  },

  // Alias para compatibilidad
  initializeAuth: async () => {
    return get().loadStoredAuth();
  },

  setRequires2FA: (requires: boolean) => {
    set({ requires2FA: requires });
  },
}));