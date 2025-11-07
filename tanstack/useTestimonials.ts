import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testimonialAPI } from '@/api';

// Get all testimonials (admin)
export const useGetTestimonials = (params: any = {}) => {
  return useQuery({
    queryKey: ['testimonials', params],
    queryFn: async () => {
      const response = await testimonialAPI.getAllTestimonials(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get published testimonials
export const useGetPublishedTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials', 'published'],
    queryFn: async () => {
      const response = await testimonialAPI.getPublishedTestimonials();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get single testimonial
export const useGetTestimonial = (testimonialId: string) => {
  return useQuery({
    queryKey: ['testimonial', testimonialId],
    queryFn: async () => {
      const response = await testimonialAPI.getTestimonial(testimonialId);
      return response.data;
    },
    enabled: !!testimonialId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Create testimonial (client)
export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testimonialData: any) => {
      const response = await testimonialAPI.createTestimonial(testimonialData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      console.log('Testimonial created successfully');
    },
    onError: (error: any) => {
      console.error('Create testimonial error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create testimonial';
      console.error('Error:', errorMessage);
    },
  });
};

// Update testimonial
export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ testimonialId, testimonialData }: { testimonialId: string; testimonialData: any }) => {
      const response = await testimonialAPI.updateTestimonial(testimonialId, testimonialData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial', variables.testimonialId] });
      console.log('Testimonial updated successfully');
    },
    onError: (error: any) => {
      console.error('Update testimonial error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update testimonial';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete testimonial
export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testimonialId: string) => {
      const response = await testimonialAPI.deleteTestimonial(testimonialId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      console.log('Testimonial deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete testimonial error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete testimonial';
      console.error('Error:', errorMessage);
    },
  });
};

// Approve testimonial (admin)
export const useApproveTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ testimonialId, isApproved }: { testimonialId: string; isApproved: boolean }) => {
      const response = await testimonialAPI.approveTestimonial(testimonialId, isApproved);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial', variables.testimonialId] });
      console.log('Testimonial approval updated successfully');
    },
    onError: (error: any) => {
      console.error('Approve testimonial error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update testimonial approval';
      console.error('Error:', errorMessage);
    },
  });
};

// Publish testimonial (admin)
export const usePublishTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testimonialId: string) => {
      const response = await testimonialAPI.publishTestimonial(testimonialId);
      return response.data;
    },
    onSuccess: (data, testimonialId) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial', testimonialId] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'published'] });
      console.log('Testimonial published successfully');
    },
    onError: (error: any) => {
      console.error('Publish testimonial error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to publish testimonial';
      console.error('Error:', errorMessage);
    },
  });
};

// Unpublish testimonial (admin)
export const useUnpublishTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testimonialId: string) => {
      const response = await testimonialAPI.unpublishTestimonial(testimonialId);
      return response.data;
    },
    onSuccess: (data, testimonialId) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial', testimonialId] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'published'] });
      console.log('Testimonial unpublished successfully');
    },
    onError: (error: any) => {
      console.error('Unpublish testimonial error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to unpublish testimonial';
      console.error('Error:', errorMessage);
    },
  });
};

