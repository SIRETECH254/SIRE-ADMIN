import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI } from '@/api';

// Get all projects (admin)
export const useGetProjects = (params: any = {}) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const response = await projectAPI.getAllProjects(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get project statistics (admin)
export const useGetProjectStats = () => {
  return useQuery({
    queryKey: ['projects', 'stats'],
    queryFn: async () => {
      const response = await projectAPI.getProjectStats();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get assigned projects
export const useGetAssignedProjects = () => {
  return useQuery({
    queryKey: ['projects', 'assigned'],
    queryFn: async () => {
      const response = await projectAPI.getAssignedProjects();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get client projects
export const useGetClientProjects = (clientId: string) => {
  return useQuery({
    queryKey: ['projects', 'client', clientId],
    queryFn: async () => {
      const response = await projectAPI.getClientProjects(clientId);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get single project
export const useGetProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await projectAPI.getProject(projectId);
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Create project (admin)
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: any) => {
      const response = await projectAPI.createProject(projectData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      console.log('Project created successfully');
    },
    onError: (error: any) => {
      console.error('Create project error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      console.error('Error:', errorMessage);
    },
  });
};

// Update project
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, projectData }: { projectId: string; projectData: any }) => {
      const response = await projectAPI.updateProject(projectId, projectData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      console.log('Project updated successfully');
    },
    onError: (error: any) => {
      console.error('Update project error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update project';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete project (admin)
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await projectAPI.deleteProject(projectId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      console.log('Project deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete project error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      console.error('Error:', errorMessage);
    },
  });
};

// Assign team members (admin)
export const useAssignTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, teamData }: { projectId: string; teamData: any }) => {
      const response = await projectAPI.assignTeamMembers(projectId, teamData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      console.log('Team members assigned successfully');
    },
    onError: (error: any) => {
      console.error('Assign team members error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to assign team members';
      console.error('Error:', errorMessage);
    },
  });
};

// Update project status
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: string }) => {
      const response = await projectAPI.updateProjectStatus(projectId, status);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      console.log('Project status updated successfully');
    },
    onError: (error: any) => {
      console.error('Update project status error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update project status';
      console.error('Error:', errorMessage);
    },
  });
};

// Update progress
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, progress }: { projectId: string; progress: number }) => {
      const response = await projectAPI.updateProgress(projectId, progress);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      console.log('Project progress updated successfully');
    },
    onError: (error: any) => {
      console.error('Update progress error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update progress';
      console.error('Error:', errorMessage);
    },
  });
};

// Add milestone
export const useAddMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, milestoneData }: { projectId: string; milestoneData: any }) => {
      const response = await projectAPI.addMilestone(projectId, milestoneData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      console.log('Milestone added successfully');
    },
    onError: (error: any) => {
      console.error('Add milestone error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add milestone';
      console.error('Error:', errorMessage);
    },
  });
};

// Update milestone
export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      milestoneData,
    }: {
      projectId: string;
      milestoneId: string;
      milestoneData: any;
    }) => {
      const response = await projectAPI.updateMilestone(projectId, milestoneId, milestoneData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      console.log('Milestone updated successfully');
    },
    onError: (error: any) => {
      console.error('Update milestone error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update milestone';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete milestone
export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) => {
      const response = await projectAPI.deleteMilestone(projectId, milestoneId);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      console.log('Milestone deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete milestone error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete milestone';
      console.error('Error:', errorMessage);
    },
  });
};

// Upload attachment
export const useUploadAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, formData }: { projectId: string; formData: FormData }) => {
      const response = await projectAPI.uploadAttachment(projectId, formData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      console.log('Attachment uploaded successfully');
    },
    onError: (error: any) => {
      console.error('Upload attachment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload attachment';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete attachment
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, attachmentId }: { projectId: string; attachmentId: string }) => {
      const response = await projectAPI.deleteAttachment(projectId, attachmentId);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      console.log('Attachment deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete attachment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete attachment';
      console.error('Error:', errorMessage);
    },
  });
};

