import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleAPI, userAPI } from '@/api';

// Get all roles
export const useGetAllRoles = (params: any = {}) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: async () => {
      const response = await roleAPI.getAllRoles(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get single role
export const useGetRole = (roleId: string) => {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: async () => {
      const response = await roleAPI.getRole(roleId);
      return response.data;
    },
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Create role (super admin)
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: any) => {
      const response = await roleAPI.createRole(roleData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      console.log('Role created successfully');
    },
    onError: (error: any) => {
      console.error('Create role error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create role';
      console.error('Error:', errorMessage);
    },
  });
};

// Update role (super admin)
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, roleData }: { roleId: string; roleData: any }) => {
      const response = await roleAPI.updateRole(roleId, roleData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      console.log('Role updated successfully');
    },
    onError: (error: any) => {
      console.error('Update role error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update role';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete role (super admin)
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const response = await roleAPI.deleteRole(roleId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      console.log('Role deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete role error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete role';
      console.error('Error:', errorMessage);
    },
  });
};

// Get users by role
export const useGetUsersByRole = (roleId: string, params: any = {}) => {
  return useQuery({
    queryKey: ['role', roleId, 'users', params],
    queryFn: async () => {
      const response = await roleAPI.getUsersByRole(roleId, params);
      return response.data;
    },
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Note: useGetClients is exported from useUsers.ts instead

