import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceAPI } from '@/api';

// Get all invoices (admin)
export const useGetInvoices = (params: any = {}) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await invoiceAPI.getAllInvoices(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get single invoice
export const useGetInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await invoiceAPI.getInvoice(invoiceId);
      return response.data;
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Create invoice (admin)
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await invoiceAPI.createInvoice(invoiceData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      console.log('Invoice created successfully');
    },
    onError: (error: any) => {
      console.error('Create invoice error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create invoice';
      console.error('Error:', errorMessage);
    },
  });
};

// Update invoice (admin)
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, invoiceData }: { invoiceId: string; invoiceData: any }) => {
      const response = await invoiceAPI.updateInvoice(invoiceId, invoiceData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      console.log('Invoice updated successfully');
    },
    onError: (error: any) => {
      console.error('Update invoice error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update invoice';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete invoice (admin)
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await invoiceAPI.deleteInvoice(invoiceId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      console.log('Invoice deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete invoice error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete invoice';
      console.error('Error:', errorMessage);
    },
  });
};

// Mark as paid (admin)
export const useMarkAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await invoiceAPI.markAsPaid(invoiceId);
      return response.data;
    },
    onSuccess: (data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      console.log('Invoice marked as paid successfully');
    },
    onError: (error: any) => {
      console.error('Mark as paid error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark invoice as paid';
      console.error('Error:', errorMessage);
    },
  });
};

// Mark as overdue (admin)
export const useMarkAsOverdue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await invoiceAPI.markAsOverdue(invoiceId);
      return response.data;
    },
    onSuccess: (data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      console.log('Invoice marked as overdue successfully');
    },
    onError: (error: any) => {
      console.error('Mark as overdue error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark invoice as overdue';
      console.error('Error:', errorMessage);
    },
  });
};

// Cancel invoice (admin)
export const useCancelInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await invoiceAPI.cancelInvoice(invoiceId);
      return response.data;
    },
    onSuccess: (data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      console.log('Invoice cancelled successfully');
    },
    onError: (error: any) => {
      console.error('Cancel invoice error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel invoice';
      console.error('Error:', errorMessage);
    },
  });
};

// Generate invoice PDF
export const useGenerateInvoicePDF = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId, 'pdf'],
    queryFn: async () => {
      const response = await invoiceAPI.generateInvoicePDF(invoiceId);
      return response.data;
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Send invoice via email (admin)
export const useSendInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await invoiceAPI.sendInvoice(invoiceId);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Invoice sent successfully');
    },
    onError: (error: any) => {
      console.error('Send invoice error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send invoice';
      console.error('Error:', errorMessage);
    },
  });
};

