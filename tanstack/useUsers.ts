import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '@/api';

// Get own profile
export const useGetProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Update own profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: any) => {
      const response = await userAPI.updateProfile(profileData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      console.log('Profile updated successfully');
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      console.error('Error:', errorMessage);
    },
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: any) => {
      const response = await userAPI.changePassword(passwordData);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Password changed successfully');
    },
    onError: (error: any) => {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      console.error('Error:', errorMessage);
    },
  });
};

// Get notification preferences
export const useGetNotificationPreferences = () => {
  return useQuery({
    queryKey: ['user', 'notification-preferences'],
    queryFn: async () => {
      const response = await userAPI.getNotificationPreferences();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Update notification preferences
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: any) => {
      const response = await userAPI.updateNotificationPreferences(preferences);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notification-preferences'] });
      console.log('Notification preferences updated successfully');
    },
    onError: (error: any) => {
      console.error('Update notification preferences error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update notification preferences';
      console.error('Error:', errorMessage);
    },
  });
};

// Get all users (admin)
export const useGetAllUsers = (params: any = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get single user (admin)
export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Create admin user (super admin)
export const useAdminCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await userAPI.adminCreateUser(userData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('User created successfully');
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      console.error('Error:', errorMessage);
    },
  });
};

// Update user status (super admin)
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, statusData }: { userId: string; statusData: any }) => {
      const response = await userAPI.updateUserStatus(userId, statusData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      console.log('User status updated successfully');
    },
    onError: (error: any) => {
      console.error('Update user status error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user status';
      console.error('Error:', errorMessage);
    },
  });
};

// Set user as admin (super admin)
export const useSetUserAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, adminData }: { userId: string; adminData: any }) => {
      const response = await userAPI.setUserAdmin(userId, adminData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      console.log('User admin role updated successfully');
    },
    onError: (error: any) => {
      console.error('Set user admin error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user admin role';
      console.error('Error:', errorMessage);
    },
  });
};

// Get user roles (admin)
export const useGetUserRoles = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId, 'roles'],
    queryFn: async () => {
      const response = await userAPI.getUserRoles(userId);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Delete user (super admin)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userAPI.deleteUser(userId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('User deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      console.error('Error:', errorMessage);
    },
  });
};

