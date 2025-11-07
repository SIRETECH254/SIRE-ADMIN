import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/api';

// Get admin dashboard
export const useGetAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const response = await dashboardAPI.getAdminDashboard();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (dashboard data should be relatively fresh)
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get client dashboard
export const useGetClientDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'client'],
    queryFn: async () => {
      const response = await dashboardAPI.getClientDashboard();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get revenue stats
export const useGetRevenueStats = (params: any = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'revenue', params],
    queryFn: async () => {
      const response = await dashboardAPI.getRevenueStats(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get project stats
export const useGetProjectStats = (params: any = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'projects', params],
    queryFn: async () => {
      const response = await dashboardAPI.getProjectStats(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get client activity stats
export const useGetClientActivityStats = (params: any = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'client-activity', params],
    queryFn: async () => {
      const response = await dashboardAPI.getClientActivityStats(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get service demand stats
export const useGetServiceDemandStats = (params: any = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'service-demand', params],
    queryFn: async () => {
      const response = await dashboardAPI.getServiceDemandStats(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

