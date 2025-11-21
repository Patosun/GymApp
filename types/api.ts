// Types para la aplicación móvil GymMaster

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photo?: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'TRAINER' | 'MEMBER';
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  is2FAEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  requires2FA?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  otpCode?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  city: string;
  state: string;
  zipCode?: string;
  isActive: boolean;
  openingTime: string;
  closingTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  branchId: string;
  trainerId?: string;
  capacity: number;
  duration: number;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isRecurring: boolean;
  price?: number;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
  trainer?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      photo?: string;
    };
  };
  _count: {
    reservations: number;
  };
}

export interface Reservation {
  id: string;
  memberId: string;
  classId: string;
  trainerId?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  class: Class;
}

export interface Member {
  id: string;
  userId: string;
  membershipNumber: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  qrCode: string;
  qrCodeExpiry: string;
  isActive: boolean;
  joinDate: string;
  user: User;
}

export interface MemberStats {
  totalCheckinsThisMonth: number;
  membershipEndDate?: string;
  totalEnrolledClasses: number;
  activeMembership?: {
    id: string;
    endDate: string;
    membershipType: {
      name: string;
    };
  };
}

export interface CheckIn {
  id: string;
  memberId: string;
  branchId: string;
  checkInAt: string;
  checkOutAt?: string;
  notes?: string;
  createdAt: string;
  member: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  branch: Branch;
}

export interface QRCodeData {
  type: 'checkin';
  branchId: string;
  branchName: string;
  expiresAt: string;
  generatedAt: string;
  qrImage: string; // base64
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface TodayClass {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  trainer?: string;
  capacity: number;
  enrolled: number;
  branch: {
    name: string;
  };
}

export interface TrainerClass {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  branch: Branch;
  _count: {
    reservations: number;
  };
  reservations: Array<{
    id: string;
    status: string;
    member: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
}