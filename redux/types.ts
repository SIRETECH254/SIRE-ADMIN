// Redux State Types

export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: Role[];
  // Computed field for backward compatibility
  primaryRole?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
}

