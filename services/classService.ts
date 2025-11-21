import { apiService } from './apiService';
import { Class, Reservation, TodayClass, TrainerClass, APIResponse } from '../types/api';

export class ClassService {
  // Obtener clases disponibles para miembros
  async getAvailableClasses(branchId?: string, date?: string): Promise<Class[]> {
    try {
      const params: any = {};
      if (branchId) params.branchId = branchId;
      if (date) params.date = date;

      const response = await apiService.get<Class[]>('/classes/available', params);
      return response.data || [];
    } catch (error: any) {
      console.error('Error obteniendo clases disponibles:', error);
      return [];
    }
  }

  // Obtener clases de hoy para miembros
  async getTodayClasses(): Promise<TodayClass[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiService.get<TodayClass[]>('/classes/available', { 
        date: today 
      });
      return response.data || [];
    } catch (error: any) {
      console.error('Error obteniendo clases de hoy:', error);
      return [];
    }
  }

  // Obtener mis reservas/inscripciones
  async getMyReservations(): Promise<Reservation[]> {
    try {
      const response = await apiService.get<Reservation[]>('/classes/my-reservations');
      return response.data || [];
    } catch (error: any) {
      console.error('Error obteniendo mis reservas:', error);
      return [];
    }
  }

  // Inscribirse a una clase
  async enrollInClass(classId: string): Promise<APIResponse> {
    try {
      const response = await apiService.post('/classes/enroll', { classId });
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  // Cancelar inscripción
  async cancelEnrollment(reservationId: string): Promise<APIResponse> {
    try {
      const response = await apiService.delete(`/classes/reservations/${reservationId}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  // PARA ENTRENADORES: Obtener clases asignadas
  async getTrainerClasses(): Promise<TrainerClass[]> {
    try {
      const response = await apiService.get<TrainerClass[]>('/classes/trainer');
      return response.data || [];
    } catch (error: any) {
      console.error('Error obteniendo clases del entrenador:', error);
      return [];
    }
  }

  // PARA ENTRENADORES: Obtener clases de hoy
  async getTrainerTodayClasses(): Promise<TrainerClass[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiService.get<TrainerClass[]>('/classes/trainer', { 
        date: today 
      });
      return response.data || [];
    } catch (error: any) {
      console.error('Error obteniendo clases de hoy del entrenador:', error);
      return [];
    }
  }

  // PARA ENTRENADORES: Actualizar estado de clase
  async updateClassStatus(classId: string, status: string): Promise<APIResponse> {
    try {
      const response = await apiService.put(`/classes/${classId}`, { status });
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  // PARA ENTRENADORES: Marcar asistencia de miembro
  async markAttendance(reservationId: string, status: 'COMPLETED' | 'NO_SHOW'): Promise<APIResponse> {
    try {
      const response = await apiService.put(`/classes/reservations/${reservationId}`, { status });
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  // Obtener detalles de una clase específica
  async getClassDetails(classId: string): Promise<Class | null> {
    try {
      const response = await apiService.get<Class>(`/classes/${classId}`);
      return response.data || null;
    } catch (error: any) {
      console.error('Error obteniendo detalles de clase:', error);
      return null;
    }
  }
}

export const classService = new ClassService();