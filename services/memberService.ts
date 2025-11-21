import { apiService } from './apiService';
import { MemberStats, CheckIn, QRCodeData, APIResponse } from '../types/api';

export class MemberService {
  // Obtener estadísticas del miembro
  async getMemberStats(): Promise<MemberStats | null> {
    try {
      const response = await apiService.get<MemberStats>('/members/dashboard-stats');
      return response.data || null;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas del miembro:', error);
      return null;
    }
  }

  // Obtener historial de check-ins
  async getCheckInHistory(): Promise<CheckIn[]> {
    try {
      const response = await apiService.get<CheckIn[]>('/checkins/my-history');
      return response.data || [];
    } catch (error: any) {
      console.error('Error obteniendo historial de check-ins:', error);
      return [];
    }
  }

  // Realizar check-in con QR escaneado
  async performCheckIn(qrData: any, branchId: string): Promise<APIResponse> {
    try {
      // Validar que el QR es para check-in
      if (qrData.type !== 'checkin') {
        throw {
          success: false,
          message: 'Código QR no válido para check-in'
        };
      }

      // Validar que no esté expirado
      const now = new Date();
      const expiresAt = new Date(qrData.expiresAt);
      
      if (now > expiresAt) {
        throw {
          success: false,
          message: 'Código QR expirado'
        };
      }

      // Validar que sea de la sucursal correcta
      if (qrData.branchId !== branchId) {
        throw {
          success: false,
          message: 'Este QR es para otra sucursal'
        };
      }

      // Realizar check-in
      const response = await apiService.post('/checkins', {
        branchId: qrData.branchId,
        qrCodeData: qrData
      });

      return response;
    } catch (error: any) {
      throw error;
    }
  }

  // Realizar check-out
  async performCheckOut(): Promise<APIResponse> {
    try {
      const response = await apiService.post('/checkins/checkout');
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  // Verificar si tiene check-in activo
  async hasActiveCheckIn(): Promise<boolean> {
    try {
      const response = await apiService.get<{ hasActiveCheckIn: boolean }>('/checkins/status');
      return response.data?.hasActiveCheckIn || false;
    } catch (error: any) {
      console.error('Error verificando check-in activo:', error);
      return false;
    }
  }

  // Obtener información del miembro actual
  async getCurrentMemberInfo(): Promise<any> {
    try {
      const response = await apiService.get('/members/me');
      return response.data || null;
    } catch (error: any) {
      console.error('Error obteniendo información del miembro:', error);
      return null;
    }
  }
}

export const memberService = new MemberService();