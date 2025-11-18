import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentAPI } from '@/api';

// Get all payments (admin)
export const useGetPayments = (params: any = {}) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const response = await paymentAPI.getAllPayments(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get single payment
export const useGetPayment = (paymentId: string) => {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const response = await paymentAPI.getPayment(paymentId);
      return response.data;
    },
    enabled: !!paymentId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Create payment (admin)
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await paymentAPI.createPayment(paymentData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Payment created successfully');
    },
    onError: (error: any) => {
      console.error('Create payment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create payment';
      console.error('Error:', errorMessage);
    },
  });
};

// Update payment (admin)
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, paymentData }: { paymentId: string; paymentData: any }) => {
      const response = await paymentAPI.updatePayment(paymentId, paymentData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment', variables.paymentId] });
      console.log('Payment updated successfully');
    },
    onError: (error: any) => {
      console.error('Update payment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update payment';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete payment (admin)
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await paymentAPI.deletePayment(paymentId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Payment deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete payment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete payment';
      console.error('Error:', errorMessage);
    },
  });
};

// Get client payments
export const useGetClientPayments = (clientId: string) => {
  return useQuery({
    queryKey: ['payments', 'client', clientId],
    queryFn: async () => {
      const response = await paymentAPI.getClientPayments(clientId);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get invoice payments
export const useGetInvoicePayments = (invoiceId: string) => {
  return useQuery({
    queryKey: ['payments', 'invoice', invoiceId],
    queryFn: async () => {
      const response = await paymentAPI.getInvoicePayments(invoiceId);
      return response.data;
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Initiate payment (M-Pesa or Paystack)
export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await paymentAPI.initiatePayment(paymentData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Payment initiated successfully');
    },
    onError: (error: any) => {
      console.error('Initiate payment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to initiate payment';
      console.error('Error:', errorMessage);
    },
  });
};

// Query M-Pesa payment status
export const useQueryMpesaStatus = (checkoutRequestId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['payments', 'mpesa-status', checkoutRequestId],
    queryFn: async () => {
      const response = await paymentAPI.queryMpesaStatus(checkoutRequestId);
      return response.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!checkoutRequestId,
    staleTime: 1000 * 30, // 30 seconds (shorter for payment status)
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

