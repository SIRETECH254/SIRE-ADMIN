import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationAPI } from '@/api';

// Get all quotations (admin)
export const useGetQuotations = (params: any = {}) => {
  return useQuery({
    queryKey: ['quotations', params],
    queryFn: async () => {
      const response = await quotationAPI.getAllQuotations(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get single quotation
export const useGetQuotation = (quotationId: string) => {
  return useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: async () => {
      const response = await quotationAPI.getQuotation(quotationId);
      return response.data;
    },
    enabled: !!quotationId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Create quotation (admin)
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationData: any) => {
      const response = await quotationAPI.createQuotation(quotationData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      console.log('Quotation created successfully');
    },
    onError: (error: any) => {
      console.error('Create quotation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create quotation';
      console.error('Error:', errorMessage);
    },
  });
};

// Update quotation (admin)
export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quotationId, quotationData }: { quotationId: string; quotationData: any }) => {
      const response = await quotationAPI.updateQuotation(quotationId, quotationData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.quotationId] });
      console.log('Quotation updated successfully');
    },
    onError: (error: any) => {
      console.error('Update quotation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update quotation';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete quotation (admin)
export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await quotationAPI.deleteQuotation(quotationId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      console.log('Quotation deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete quotation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete quotation';
      console.error('Error:', errorMessage);
    },
  });
};

// Accept quotation (client)
export const useAcceptQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await quotationAPI.acceptQuotation(quotationId);
      return response.data;
    },
    onSuccess: (data, quotationId) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      console.log('Quotation accepted successfully');
    },
    onError: (error: any) => {
      console.error('Accept quotation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept quotation';
      console.error('Error:', errorMessage);
    },
  });
};

// Reject quotation (client)
export const useRejectQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await quotationAPI.rejectQuotation(quotationId);
      return response.data;
    },
    onSuccess: (data, quotationId) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      console.log('Quotation rejected successfully');
    },
    onError: (error: any) => {
      console.error('Reject quotation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject quotation';
      console.error('Error:', errorMessage);
    },
  });
};

// Convert to invoice (admin)
export const useConvertToInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await quotationAPI.convertToInvoice(quotationId);
      return response.data;
    },
    onSuccess: (data, quotationId) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      console.log('Quotation converted to invoice successfully');
    },
    onError: (error: any) => {
      console.error('Convert to invoice error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to convert quotation to invoice';
      console.error('Error:', errorMessage);
    },
  });
};

// Generate quotation PDF
export const useGenerateQuotationPDF = (quotationId: string) => {
  return useQuery({
    queryKey: ['quotation', quotationId, 'pdf'],
    queryFn: async () => {
      const response = await quotationAPI.generateQuotationPDF(quotationId);
      return response.data;
    },
    enabled: !!quotationId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Send quotation via email (admin)
export const useSendQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await quotationAPI.sendQuotation(quotationId);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Quotation sent successfully');
    },
    onError: (error: any) => {
      console.error('Send quotation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send quotation';
      console.error('Error:', errorMessage);
    },
  });
};

