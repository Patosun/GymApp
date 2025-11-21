import { create } from 'zustand';
import { User, Branch, Class, Reservation, MemberStats } from '../types/api';
import { authService } from '../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  requires2FA: boolean;
  tempCredentials: { email: string; password: string } | null;
}

interface AppState {
  // Estados de autenticación
  auth: AuthState;
  
  // Estados de datos
  branches: Branch[];
  availableClasses: Class[];
  myReservations: Reservation[];
  memberStats: MemberStats | null;
  
  // Estados de UI
  isRefreshing: boolean;
  activeTab: string;
  
  // Acciones de autenticación
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  setLoading: (loading: boolean) => void;
  setRequires2FA: (requires: boolean, email?: string, password?: string) => void;
  
  // Acciones de datos
  setBranches: (branches: Branch[]) => void;
  setAvailableClasses: (classes: Class[]) => void;
  setMyReservations: (reservations: Reservation[]) => void;
  setMemberStats: (stats: MemberStats | null) => void;
  
  // Acciones de UI
  setRefreshing: (refreshing: boolean) => void;
  setActiveTab: (tab: string) => void;
  
  // Acciones complejas
  login: (email: string, password: string) => Promise<boolean>;
  verify2FA: (otpCode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Estado inicial
  auth: {
    isAuthenticated: false,
    user: null,
    isLoading: true,
    requires2FA: false,
    tempCredentials: null,
  },
  branches: [],
  availableClasses: [],
  myReservations: [],
  memberStats: null,
  isRefreshing: false,
  activeTab: 'home',

  // Setters simples
  setUser: (user) => 
    set((state) => ({
      auth: { ...state.auth, user }
    })),

  setAuthenticated: (isAuthenticated) =>
    set((state) => ({
      auth: { ...state.auth, isAuthenticated }
    })),

  setLoading: (isLoading) =>
    set((state) => ({
      auth: { ...state.auth, isLoading }
    })),

  setRequires2FA: (requires2FA, email, password) =>
    set((state) => ({
      auth: {
        ...state.auth,
        requires2FA,
        tempCredentials: requires2FA && email && password ? { email, password } : null
      }
    })),

  setBranches: (branches) => set({ branches }),
  setAvailableClasses: (availableClasses) => set({ availableClasses }),
  setMyReservations: (myReservations) => set({ myReservations }),
  setMemberStats: (memberStats) => set({ memberStats }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setActiveTab: (activeTab) => set({ activeTab }),

  // Acciones de autenticación
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      set((state) => ({ auth: { ...state.auth, isLoading: true } }));
      
      const response = await authService.login({ email, password });
      
      if (response.success) {
        if (response.requires2FA) {
          set((state) => ({
            auth: {
              ...state.auth,
              requires2FA: true,
              tempCredentials: { email, password },
              isLoading: false
            }
          }));
          return false; // Indica que necesita 2FA
        } else if (response.user) {
          set((state) => ({
            auth: {
              ...state.auth,
              isAuthenticated: true,
              user: response.user!,
              isLoading: false,
              requires2FA: false,
              tempCredentials: null
            }
          }));
          return true;
        }
      }
      
      set((state) => ({ auth: { ...state.auth, isLoading: false } }));
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      set((state) => ({ auth: { ...state.auth, isLoading: false } }));
      return false;
    }
  },

  verify2FA: async (otpCode: string): Promise<boolean> => {
    try {
      const { auth } = get();
      if (!auth.tempCredentials) return false;

      set((state) => ({ auth: { ...state.auth, isLoading: true } }));

      const response = await authService.verify2FA(
        auth.tempCredentials.email,
        auth.tempCredentials.password,
        otpCode
      );

      if (response.success && response.user) {
        set((state) => ({
          auth: {
            ...state.auth,
            isAuthenticated: true,
            user: response.user!,
            isLoading: false,
            requires2FA: false,
            tempCredentials: null
          }
        }));
        return true;
      }

      set((state) => ({ auth: { ...state.auth, isLoading: false } }));
      return false;
    } catch (error) {
      console.error('Error en verify2FA:', error);
      set((state) => ({ auth: { ...state.auth, isLoading: false } }));
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authService.logout();
      set({
        auth: {
          isAuthenticated: false,
          user: null,
          isLoading: false,
          requires2FA: false,
          tempCredentials: null,
        },
        branches: [],
        availableClasses: [],
        myReservations: [],
        memberStats: null,
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  },

  initializeAuth: async (): Promise<void> => {
    try {
      set((state) => ({ auth: { ...state.auth, isLoading: true } }));
      
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        const user = await authService.getCurrentUser();
        if (user) {
          set((state) => ({
            auth: {
              ...state.auth,
              isAuthenticated: true,
              user,
              isLoading: false
            }
          }));
          
          // Cargar datos iniciales
          get().refreshData();
          return;
        }
      }
      
      set((state) => ({
        auth: {
          ...state.auth,
          isAuthenticated: false,
          user: null,
          isLoading: false
        }
      }));
    } catch (error) {
      console.error('Error inicializando auth:', error);
      set((state) => ({
        auth: {
          ...state.auth,
          isAuthenticated: false,
          user: null,
          isLoading: false
        }
      }));
    }
  },

  refreshData: async (): Promise<void> => {
    // Esta función se implementará para cargar datos específicos según el rol
    const { auth } = get();
    if (!auth.user) return;

    try {
      set({ isRefreshing: true });
      
      // Aquí cargaremos datos según el rol del usuario
      // Por ahora, solo un placeholder
      
      set({ isRefreshing: false });
    } catch (error) {
      console.error('Error refreshing data:', error);
      set({ isRefreshing: false });
    }
  },
}));