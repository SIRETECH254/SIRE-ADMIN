import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '@/api';

// Get user notifications
export const useGetUserNotifications = (params: any = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await notificationAPI.getUserNotifications(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 1, // 1 minute (notifications should be fresh)
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get unread count
export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await notificationAPI.getUnreadCount();
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds (unread count should be very fresh)
    gcTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get unread notifications
export const useGetUnreadNotifications = () => {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const response = await notificationAPI.getUnreadNotifications();
      return response.data;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get single notification
export const useGetNotification = (notificationId: string) => {
  return useQuery({
    queryKey: ['notification', notificationId],
    queryFn: async () => {
      const response = await notificationAPI.getNotification(notificationId);
      return response.data;
    },
    enabled: !!notificationId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Mark as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await notificationAPI.markAsRead(notificationId);
      return response.data;
    },
    onSuccess: (data, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification', notificationId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      console.log('Notification marked as read');
    },
    onError: (error: any) => {
      console.error('Mark as read error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark notification as read';
      console.error('Error:', errorMessage);
    },
  });
};

// Mark all as read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationAPI.markAllAsRead();
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      console.log('All notifications marked as read');
    },
    onError: (error: any) => {
      console.error('Mark all as read error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark all notifications as read';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await notificationAPI.deleteNotification(notificationId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      console.log('Notification deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete notification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete notification';
      console.error('Error:', errorMessage);
    },
  });
};

// Send notification (admin)
export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationData: any) => {
      const response = await notificationAPI.sendNotification(notificationData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      console.log('Notification sent successfully');
    },
    onError: (error: any) => {
      console.error('Send notification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send notification';
      console.error('Error:', errorMessage);
    },
  });
};

// Send invoice reminder (admin)
export const useSendInvoiceReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await notificationAPI.sendInvoiceReminder(invoiceId);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Invoice reminder sent successfully');
    },
    onError: (error: any) => {
      console.error('Send invoice reminder error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send invoice reminder';
      console.error('Error:', errorMessage);
    },
  });
};

// Send payment confirmation (admin)
export const useSendPaymentConfirmation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await notificationAPI.sendPaymentConfirmation(paymentId);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Payment confirmation sent successfully');
    },
    onError: (error: any) => {
      console.error('Send payment confirmation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send payment confirmation';
      console.error('Error:', errorMessage);
    },
  });
};

// Send project update (admin)
export const useSendProjectUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, updateData }: { projectId: string; updateData: any }) => {
      const response = await notificationAPI.sendProjectUpdate(projectId, updateData);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Project update sent successfully');
    },
    onError: (error: any) => {
      console.error('Send project update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send project update';
      console.error('Error:', errorMessage);
    },
  });
};

// Send bulk notification (super admin)
export const useSendBulkNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationData: any) => {
      const response = await notificationAPI.sendBulkNotification(notificationData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      console.log('Bulk notification sent successfully');
    },
    onError: (error: any) => {
      console.error('Send bulk notification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send bulk notification';
      console.error('Error:', errorMessage);
    },
  });
};

// Get notifications by category
export const useGetNotificationsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['notifications', 'category', category],
    queryFn: async () => {
      const response = await notificationAPI.getNotificationsByCategory(category);
      return response.data;
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

