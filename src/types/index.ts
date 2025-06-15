export interface User {
  id: number;
  userId: string;
  name: string;
  role: 'super_admin' | 'admin' | 'worker';
  createdAt: string;
}

export interface Machine {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface MachineAssignment {
  id: number;
  machineId: number;
  workerId: number;
  machineName?: string;
  workerName?: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface RawMaterial {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  description: string;
}

export interface DashboardStats {
  // Removed materialUsage property
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Mould {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  per_hour_production: number | null;
  createdAt: string;
  updatedAt: string;
}