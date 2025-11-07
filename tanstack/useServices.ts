import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceAPI } from '@/api';

// Get all services (admin)
export const useGetServices = (params: any = {}) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const response = await serviceAPI.getAllServices(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get active services (public)
export const useGetActiveServices = () => {
  return useQuery({
    queryKey: ['services', 'active'],
    queryFn: async () => {
      const response = await serviceAPI.getActiveServices();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get single service
export const useGetService = (serviceId: string) => {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await serviceAPI.getService(serviceId);
      return response.data;
    },
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Create service (admin)
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await serviceAPI.createService(serviceData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      console.log('Service created successfully');
    },
    onError: (error: any) => {
      console.error('Create service error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create service';
      console.error('Error:', errorMessage);
    },
  });
};

// Update service (admin)
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, serviceData }: { serviceId: string; serviceData: any }) => {
      const response = await serviceAPI.updateService(serviceId, serviceData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      console.log('Service updated successfully');
    },
    onError: (error: any) => {
      console.error('Update service error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update service';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete service (admin)
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await serviceAPI.deleteService(serviceId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      console.log('Service deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete service error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete service';
      console.error('Error:', errorMessage);
    },
  });
};

// Toggle service status (admin)
export const useToggleServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await serviceAPI.toggleServiceStatus(serviceId);
      return response.data;
    },
    onSuccess: (data, serviceId) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
      console.log('Service status toggled successfully');
    },
    onError: (error: any) => {
      console.error('Toggle service status error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to toggle service status';
      console.error('Error:', errorMessage);
    },
  });
};

// Upload service icon (admin)
export const useUploadServiceIcon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, formData }: { serviceId: string; formData: FormData }) => {
      const response = await serviceAPI.uploadServiceIcon(serviceId, formData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      console.log('Service icon uploaded successfully');
    },
    onError: (error: any) => {
      console.error('Upload service icon error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload service icon';
      console.error('Error:', errorMessage);
    },
  });
};

