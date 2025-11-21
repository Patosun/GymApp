import { apiService } from './apiService';
import { Branch } from '../types/api';

export class BranchService {
  // Obtener todas las sucursales activas
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await apiService.get<Branch[]>('/branches');
      return response.data || [];
    } catch (error: any) {
      console.error('Error obteniendo sucursales:', error);
      return [];
    }
  }

  // Obtener detalles de una sucursal específica
  async getBranchDetails(branchId: string): Promise<Branch | null> {
    try {
      const response = await apiService.get<Branch>(`/branches/${branchId}`);
      return response.data || null;
    } catch (error: any) {
      console.error('Error obteniendo detalles de sucursal:', error);
      return null;
    }
  }

  // Buscar sucursal más cercana (requeriría geolocalización)
  async getNearestBranch(latitude: number, longitude: number): Promise<Branch | null> {
    try {
      const response = await apiService.get<Branch>('/branches/nearest', {
        lat: latitude,
        lng: longitude
      });
      return response.data || null;
    } catch (error: any) {
      console.error('Error obteniendo sucursal más cercana:', error);
      return null;
    }
  }
}

export const branchService = new BranchService();