import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAPI } from '@/api';

// Get all clients (admin)
export const useGetClients = (params: any = {}) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => {
      const response = await clientAPI.getAllClients(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get single client
export const useGetClient = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await clientAPI.getClient(clientId);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Register client
export const useRegisterClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData: any) => {
      const response = await clientAPI.registerClient(clientData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      console.log('Client created successfully');
    },
    onError: (error: any) => {
      console.error('Create client error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create client';
      console.error('Error:', errorMessage);
    },
  });
};

// Update client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, clientData }: { clientId: string; clientData: any }) => {
      const response = await clientAPI.updateClient(clientId, clientData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      console.log('Client updated successfully');
    },
    onError: (error: any) => {
      console.error('Update client error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update client';
      console.error('Error:', errorMessage);
    },
  });
};

// Update client status (admin)
export const useUpdateClientStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, isActive }: { clientId: string; isActive: boolean }) => {
      const response = await clientAPI.updateClientStatus(clientId, { isActive });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      console.log('Client status updated successfully');
    },
    onError: (error: any) => {
      console.error('Update client status error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update client status';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete client (admin)
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const response = await clientAPI.deleteClient(clientId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      console.log('Client deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete client error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete client';
      console.error('Error:', errorMessage);
    },
  });
};

// Get client stats
export const useGetClientStats = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId, 'stats'],
    queryFn: async () => {
      const response = await clientAPI.getClientStats(clientId);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get client projects
export const useGetClientProjects = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId, 'projects'],
    queryFn: async () => {
      const response = await clientAPI.getClientProjects(clientId);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get client invoices
export const useGetClientInvoices = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId, 'invoices'],
    queryFn: async () => {
      const response = await clientAPI.getClientInvoices(clientId);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get client payments
export const useGetClientPayments = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId, 'payments'],
    queryFn: async () => {
      const response = await clientAPI.getClientPayments(clientId);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

