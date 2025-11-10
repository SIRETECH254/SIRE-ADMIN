import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout as logoutAction,
  updateUser,
  setTokens,
  clearError,
  setLoading,
  setAuthLoading,
  setAuthSuccess,
  setAuthFailure,
  clearAuth,
} from '../redux/slices/authSlice';
import { RootState } from '../redux/types';
import { authAPI, userAPI } from '../api';
import { User } from '../redux/types';

// Types
interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

interface OTPData {
  email: string;
  otp: string;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
  user?: User;
}

// Context value type
interface AuthContextValue {
  // State (from Redux)
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth Functions
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  verifyOTP: (otpData: OTPData) => Promise<AuthResult>;
  resendOTP: (emailData: { email: string }) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
  updateProfile: (profileData: ProfileData) => Promise<AuthResult>;
  changePassword: (passwordData: PasswordData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Get state from Redux (single source of truth)
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const error = useSelector((state: RootState) => state.auth.error);

  // Check if user is already logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const storedUserString = await AsyncStorage.getItem('user');

        // 1) Rehydrate immediately from AsyncStorage so state survives reloads
        if (token && storedUserString) {
          try {
            const storedUser = JSON.parse(storedUserString);
            if (storedUser) {
              // Restore user state (tokens are already in AsyncStorage)
              dispatch(setAuthSuccess(storedUser));
              dispatch(setTokens({ accessToken: token }));
            } else {
              dispatch(clearAuth());
            }
          } catch {
            dispatch(clearAuth());
          }
        } else {
          dispatch(clearAuth());
        }

        // Mark loading complete for initial render
        dispatch(setLoading(false));

        // 2) Background refresh of user profile; do NOT clear tokens on failure
        const refreshUserInBackground = async () => {
          if (!token) return;
          try {
            const response = await authAPI.getMe();
            const userData = response.data.data.user;
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            dispatch(setAuthSuccess(userData));
          } catch (error: any) {
            console.log('Background token validation failed:', error.response?.status);
            // Intentionally do not clear tokens here to preserve persisted state
          }
        };

        refreshUserInBackground();
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    dispatch(loginStart());
    dispatch(setAuthLoading(true));

    try {
      const response = await authAPI.login(credentials);
      const { user: userData, accessToken, refreshToken } = response.data.data;

      // Store tokens and user data in AsyncStorage
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Update Redux state
      dispatch(
        loginSuccess({
          user: userData,
          accessToken,
          refreshToken,
        })
      );

      console.log('Login successful!');
      return { success: true };
    } catch (error: any) {
      // Prefer server-provided, specific errors
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      dispatch(setAuthFailure(errorMessage));
      console.error('Login failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<AuthResult> => {
    dispatch(registerStart());

    try {
      const response = await authAPI.register(userData);
      dispatch(registerSuccess());
      console.log('Registration successful! Please check your email for OTP verification.');
      return { success: true, data: response.data.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch(registerFailure(errorMessage));
      dispatch(setAuthFailure(errorMessage));
      console.error('Registration failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Verify OTP function
  const verifyOTP = async (otpData: OTPData): Promise<AuthResult> => {
    dispatch(loginStart());

    try {
      const response = await authAPI.verifyOTP(otpData);
      const { user: userData, accessToken, refreshToken } = response.data.data;

      // Store tokens and user data
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Update Redux state
      dispatch(
        loginSuccess({
          user: userData,
          accessToken,
          refreshToken,
        })
      );

      console.log('Email verified successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      dispatch(loginFailure(errorMessage));
      dispatch(setAuthFailure(errorMessage));
      console.error('OTP verification failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Resend OTP function
  const resendOTP = async (emailData: { email: string }): Promise<AuthResult> => {
    try {
      await authAPI.resendOTP(emailData);
      console.log('OTP has been resent to your email!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      console.error('Failed to resend OTP:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<AuthResult> => {
    try {
      await authAPI.forgotPassword(email);
      console.log('Password reset instructions sent to your email!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      console.error('Failed to send reset email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password function
  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<AuthResult> => {
    try {
      await authAPI.resetPassword(token, newPassword);
      console.log('Password reset successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      console.error('Failed to reset password:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update profile function
  const updateProfile = async (profileData: ProfileData): Promise<AuthResult> => {
    try {
      const response = await userAPI.updateProfile(profileData);
      const updatedUser = response.data.data.user;

      // Update AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // Update Redux state
      dispatch(updateUser(updatedUser));
      dispatch(setAuthSuccess(updatedUser));

      console.log('Profile updated successfully!');
      return { success: true, user: updatedUser };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      console.error('Failed to update profile:', errorMessage);
      throw error;
    }
  };

  // Change password function
  const changePassword = async (passwordData: PasswordData): Promise<AuthResult> => {
    try {
      await userAPI.changePassword(passwordData);
      console.log('Password changed successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      console.error('Failed to change password:', errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage regardless of API call success
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');

      // Clear Redux state
      dispatch(logoutAction());
      dispatch(clearAuth());

      console.log('Logged out successfully!');

      // Navigate to login page
      router.replace('/(public)/login');
    }
  };

  // Clear error function
  const clearErrorHandler = () => {
    dispatch(clearError());
    dispatch(setAuthFailure(null));
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    logout,
    clearError: clearErrorHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

