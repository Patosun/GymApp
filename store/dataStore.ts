import { create } from 'zustand';
import { apiService } from '../services/apiService';

interface Class {
  id: string;
  name: string;
  description: string;
  instructor: string;
  dateTime: string;
  duration: number;
  capacity: number;
  currentAttendees: number;
  branchId: string;
  isActive: boolean;
}

interface CheckIn {
  id: string;
  memberId: string;
  classId?: string;
  branchId: string;
  checkInTime: string;
  checkOutTime?: string;
  type: 'GYM' | 'CLASS';
}

interface DashboardStats {
  totalClasses: number;
  attendedClasses: number;
  upcomingClasses: number;
  favoriteClass: string;
  weeklyGoal: number;
  weeklyProgress: number;
  monthlyVisits: number;
  streak: number;
}

interface AppState {
  // State
  classes: Class[];
  myClasses: Class[];
  checkIns: CheckIn[];
  dashboardStats: DashboardStats | null;
  isLoadingClasses: boolean;
  isLoadingStats: boolean;
  
  // Actions
  loadClasses: () => Promise<void>;
  loadMyClasses: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  loadCheckIns: () => Promise<void>;
  reserveClass: (classId: string) => Promise<boolean>;
  cancelReservation: (classId: string) => Promise<boolean>;
  createCheckIn: (data: any) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useAppDataStore = create<AppState>((set, get) => ({
  // Initial state
  classes: [],
  myClasses: [],
  checkIns: [],
  dashboardStats: null,
  isLoadingClasses: false,
  isLoadingStats: false,

  // Actions
  loadClasses: async () => {
    try {
      set({ isLoadingClasses: true });
      const response = await apiService.getClasses();
      
      if (response.success) {
        set({ classes: response.data });
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      set({ isLoadingClasses: false });
    }
  },

  loadMyClasses: async () => {
    try {
      const response = await apiService.getMyClasses();
      
      if (response.success) {
        set({ myClasses: response.data });
      }
    } catch (error) {
      console.error('Error loading my classes:', error);
    }
  },

  loadDashboardStats: async () => {
    try {
      set({ isLoadingStats: true });
      const response = await apiService.getDashboardStats();
      
      if (response.success) {
        set({ dashboardStats: response.data });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  loadCheckIns: async () => {
    try {
      const response = await apiService.getMyCheckIns();
      
      if (response.success) {
        set({ checkIns: response.data });
      }
    } catch (error) {
      console.error('Error loading check-ins:', error);
    }
  },

  reserveClass: async (classId: string) => {
    try {
      const response = await apiService.reserveClass(classId);
      
      if (response.success) {
        // Actualizar la clase en el estado local
        const { classes } = get();
        const updatedClasses = classes.map(cls => 
          cls.id === classId 
            ? { ...cls, currentAttendees: cls.currentAttendees + 1 }
            : cls
        );
        set({ classes: updatedClasses });
        
        // Recargar mis clases
        await get().loadMyClasses();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error reserving class:', error);
      return false;
    }
  },

  cancelReservation: async (classId: string) => {
    try {
      const response = await apiService.cancelReservation(classId);
      
      if (response.success) {
        // Actualizar la clase en el estado local
        const { classes } = get();
        const updatedClasses = classes.map(cls => 
          cls.id === classId 
            ? { ...cls, currentAttendees: Math.max(0, cls.currentAttendees - 1) }
            : cls
        );
        set({ classes: updatedClasses });
        
        // Recargar mis clases
        await get().loadMyClasses();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error canceling reservation:', error);
      return false;
    }
  },

  createCheckIn: async (data: any) => {
    try {
      const response = await apiService.createCheckIn(data);
      
      if (response.success) {
        // Recargar check-ins
        await get().loadCheckIns();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating check-in:', error);
      return false;
    }
  },

  refreshData: async () => {
    try {
      const { loadClasses, loadMyClasses, loadDashboardStats, loadCheckIns } = get();
      
      await Promise.all([
        loadClasses(),
        loadMyClasses(),
        loadDashboardStats(),
        loadCheckIns(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  },
}));