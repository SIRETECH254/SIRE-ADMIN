import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactAPI } from '@/api';

// Get all messages (admin)
export const useGetAllMessages = (params: any = {}) => {
  return useQuery({
    queryKey: ['contact', 'messages', params],
    queryFn: async () => {
      const response = await contactAPI.getAllMessages(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get single message
export const useGetMessage = (messageId: string) => {
  return useQuery({
    queryKey: ['contact', 'message', messageId],
    queryFn: async () => {
      const response = await contactAPI.getMessage(messageId);
      return response.data;
    },
    enabled: !!messageId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Submit contact message
export const useSubmitContactMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: any) => {
      const response = await contactAPI.submitContactMessage(messageData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact', 'messages'] });
      console.log('Contact message submitted successfully');
    },
    onError: (error: any) => {
      console.error('Submit contact message error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit contact message';
      console.error('Error:', errorMessage);
    },
  });
};

// Mark as read
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await contactAPI.markAsRead(messageId);
      return response.data;
    },
    onSuccess: (data, messageId) => {
      queryClient.invalidateQueries({ queryKey: ['contact', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact', 'message', messageId] });
      console.log('Message marked as read');
    },
    onError: (error: any) => {
      console.error('Mark as read error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark message as read';
      console.error('Error:', errorMessage);
    },
  });
};

// Reply to message
export const useReplyToMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, replyData }: { messageId: string; replyData: any }) => {
      const response = await contactAPI.replyToMessage(messageId, replyData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact', 'message', variables.messageId] });
      console.log('Reply sent successfully');
    },
    onError: (error: any) => {
      console.error('Reply to message error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reply to message';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete message
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await contactAPI.deleteMessage(messageId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact', 'messages'] });
      console.log('Message deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete message error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete message';
      console.error('Error:', errorMessage);
    },
  });
};

// Archive message
export const useArchiveMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await contactAPI.archiveMessage(messageId);
      return response.data;
    },
    onSuccess: (data, messageId) => {
      queryClient.invalidateQueries({ queryKey: ['contact', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact', 'message', messageId] });
      console.log('Message archived successfully');
    },
    onError: (error: any) => {
      console.error('Archive message error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to archive message';
      console.error('Error:', errorMessage);
    },
  });
};

