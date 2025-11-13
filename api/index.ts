import { api } from './config';

// Auth API calls
export const authAPI = {
  // Register
  register: (userData: any) => api.post('/api/auth/register', userData),

  // Verify OTP
  verifyOTP: (otpData: any) => api.post('/api/auth/verify-otp', otpData),

  // Resend OTP
  resendOTP: (emailData: any) => api.post('/api/auth/resend-otp', emailData),

  // Login
  login: (credentials: any) => api.post('/api/auth/login', credentials),

  // Logout
  logout: () => api.post('/api/auth/logout'),

  // Forgot Password
  forgotPassword: (email: string) => api.post('/api/auth/forgot-password', { email }),

  // Reset Password
  resetPassword: (token: string, newPassword: string) =>
    api.post(`/api/auth/reset-password/${token}`, { newPassword }),

  // Refresh Token
  refreshToken: (refreshToken: string) =>
    api.post('/api/auth/refresh-token', { refreshToken }),

  // Get current user
  getMe: () => api.get('/api/auth/me'),
};

// Client API calls
export const clientAPI = {
  // Get all clients (admin)
  getAllClients: (params?: any) => api.get('/api/clients', { params }),

  // Get single client
  getClient: (id: string) => api.get(`/api/clients/${id}`),

  // Register client (public)
  registerClient: (clientData: any) => api.post('/api/clients/register', clientData),

  // Update client
  updateClient: (id: string, clientData: any) => api.put(`/api/clients/${id}`, clientData),

  // Update client status (admin)
  updateClientStatus: (id: string, statusData: any) => api.put(`/api/clients/${id}/status`, statusData),

  // Delete client (admin)
  deleteClient: (id: string) => api.delete(`/api/clients/${id}`),

  // Get client stats
  getClientStats: (id: string) => api.get(`/api/clients/${id}/stats`),

  // Get client projects
  getClientProjects: (id: string) => api.get(`/api/clients/${id}/projects`),

  // Get client invoices
  getClientInvoices: (id: string) => api.get(`/api/clients/${id}/invoices`),

  // Get client payments
  getClientPayments: (id: string) => api.get(`/api/clients/${id}/payments`),
};

// Service API calls
export const serviceAPI = {
  // Get all services (admin)
  getAllServices: (params?: any) => api.get('/api/services', { params }),

  // Get active services (public)
  getActiveServices: () => api.get('/api/services/active'),

  // Get single service
  getService: (id: string) => api.get(`/api/services/${id}`),

  // Create service (admin)
  createService: (serviceData: any) => api.post('/api/services', serviceData),

  // Update service (admin)
  updateService: (id: string, serviceData: any) => api.put(`/api/services/${id}`, serviceData),

  // Delete service (admin)
  deleteService: (id: string) => api.delete(`/api/services/${id}`),

  // Toggle service status (admin)
  toggleServiceStatus: (id: string) => api.patch(`/api/services/${id}/toggle-status`),

  // Upload service icon (admin)
  uploadServiceIcon: (id: string, formData: FormData) =>
    api.post(`/api/services/${id}/icon`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Quotation API calls
export const quotationAPI = {
  // Get all quotations (admin)
  getAllQuotations: (params?: any) => api.get('/api/quotations', { params }),

  // Get single quotation
  getQuotation: (quotationId: string) => api.get(`/api/quotations/${quotationId}`),

  // Create quotation (admin)
  createQuotation: (quotationData: any) => api.post('/api/quotations', quotationData),

  // Update quotation (admin)
  updateQuotation: (quotationId: string, quotationData: any) =>
    api.put(`/api/quotations/${quotationId}`, quotationData),

  // Delete quotation (admin)
  deleteQuotation: (quotationId: string) => api.delete(`/api/quotations/${quotationId}`),

  // Accept quotation (client)
  acceptQuotation: (quotationId: string) => api.post(`/api/quotations/${quotationId}/accept`),

  // Reject quotation (client)
  rejectQuotation: (quotationId: string) => api.post(`/api/quotations/${quotationId}/reject`),

  // Convert to invoice (admin)
  convertToInvoice: (quotationId: string) =>
    api.post(`/api/quotations/${quotationId}/convert-to-invoice`),

  // Generate PDF
  generateQuotationPDF: (quotationId: string) =>
    api.get(`/api/quotations/${quotationId}/pdf`, { responseType: 'blob' }),

  // Send quotation via email (admin)
  sendQuotation: (quotationId: string) => api.post(`/api/quotations/${quotationId}/send`),
};

// Invoice API calls
export const invoiceAPI = {
  // Get all invoices (admin)
  getAllInvoices: (params?: any) => api.get('/api/invoices', { params }),

  // Get single invoice
  getInvoice: (invoiceId: string) => api.get(`/api/invoices/${invoiceId}`),

  // Create invoice (admin)
  createInvoice: (invoiceData: any) => api.post('/api/invoices', invoiceData),

  // Update invoice (admin)
  updateInvoice: (invoiceId: string, invoiceData: any) =>
    api.put(`/api/invoices/${invoiceId}`, invoiceData),

  // Delete invoice (admin)
  deleteInvoice: (invoiceId: string) => api.delete(`/api/invoices/${invoiceId}`),

  // Mark as paid (admin)
  markAsPaid: (invoiceId: string) => api.patch(`/api/invoices/${invoiceId}/mark-paid`),

  // Mark as overdue (admin)
  markAsOverdue: (invoiceId: string) => api.patch(`/api/invoices/${invoiceId}/mark-overdue`),

  // Cancel invoice (admin)
  cancelInvoice: (invoiceId: string) => api.patch(`/api/invoices/${invoiceId}/cancel`),

  // Generate PDF
  generateInvoicePDF: (invoiceId: string) =>
    api.get(`/api/invoices/${invoiceId}/pdf`, { responseType: 'blob' }),

  // Send invoice via email (admin)
  sendInvoice: (invoiceId: string) => api.post(`/api/invoices/${invoiceId}/send`),
};

// Payment API calls
export const paymentAPI = {
  // Get all payments (admin)
  getAllPayments: (params?: any) => api.get('/api/payments', { params }),

  // Get single payment
  getPayment: (paymentId: string) => api.get(`/api/payments/${paymentId}`),

  // Create payment (admin)
  createPayment: (paymentData: any) => api.post('/api/payments', paymentData),

  // Update payment (admin)
  updatePayment: (paymentId: string, paymentData: any) =>
    api.put(`/api/payments/${paymentId}`, paymentData),

  // Delete payment (admin)
  deletePayment: (paymentId: string) => api.delete(`/api/payments/${paymentId}`),

  // Get client payments
  getClientPayments: (clientId: string) => api.get(`/api/payments/client/${clientId}`),

  // Get invoice payments
  getInvoicePayments: (invoiceId: string) => api.get(`/api/payments/invoice/${invoiceId}`),

  // Initiate payment (M-Pesa or Paystack)
  initiatePayment: (paymentData: any) => api.post('/api/payments/initiate', paymentData),

  // Query M-Pesa payment status
  queryMpesaStatus: (checkoutRequestId: string) =>
    api.get(`/api/payments/mpesa-status/${checkoutRequestId}`),
};

// Project API calls
export const projectAPI = {
  // Get all projects (admin)
  getAllProjects: (params?: any) => api.get('/api/projects', { params }),

  // Get project statistics (admin)
  getProjectStats: () => api.get('/api/projects/stats'),

  // Get assigned projects
  getAssignedProjects: () => api.get('/api/projects/assigned'),

  // Get client projects
  getClientProjects: (clientId: string) => api.get(`/api/projects/client/${clientId}`),

  // Get single project
  getProject: (projectId: string) => api.get(`/api/projects/${projectId}`),

  // Create project (admin)
  createProject: (projectData: any) => api.post('/api/projects', projectData),

  // Update project
  updateProject: (projectId: string, projectData: any) =>
    api.put(`/api/projects/${projectId}`, projectData),

  // Delete project (admin)
  deleteProject: (projectId: string) => api.delete(`/api/projects/${projectId}`),

  // Assign team members (admin)
  assignTeamMembers: (projectId: string, teamData: any) =>
    api.post(`/api/projects/${projectId}/assign`, teamData),

  // Update status
  updateProjectStatus: (projectId: string, status: string) =>
    api.patch(`/api/projects/${projectId}/status`, { status }),

  // Update progress
  updateProgress: (projectId: string, progress: number) =>
    api.patch(`/api/projects/${projectId}/progress`, { progress }),

  // Add milestone
  addMilestone: (projectId: string, milestoneData: any) =>
    api.post(`/api/projects/${projectId}/milestones`, milestoneData),

  // Update milestone
  updateMilestone: (projectId: string, milestoneId: string, milestoneData: any) =>
    api.patch(`/api/projects/${projectId}/milestones/${milestoneId}`, milestoneData),

  // Delete milestone
  deleteMilestone: (projectId: string, milestoneId: string) =>
    api.delete(`/api/projects/${projectId}/milestones/${milestoneId}`),

  // Upload attachment
  uploadAttachment: (projectId: string, formData: FormData) =>
    api.post(`/api/projects/${projectId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete attachment
  deleteAttachment: (projectId: string, attachmentId: string) =>
    api.delete(`/api/projects/${projectId}/attachments/${attachmentId}`),
};

// Testimonial API calls
export const testimonialAPI = {
  // Get all testimonials (admin)
  getAllTestimonials: (params?: any) => api.get('/api/testimonials', { params }),

  // Get published testimonials
  getPublishedTestimonials: () => api.get('/api/testimonials/published'),

  // Get single testimonial
  getTestimonial: (id: string) => api.get(`/api/testimonials/${id}`),

  // Create testimonial (client)
  createTestimonial: (testimonialData: any) => api.post('/api/testimonials', testimonialData),

  // Update testimonial
  updateTestimonial: (id: string, testimonialData: any) =>
    api.put(`/api/testimonials/${id}`, testimonialData),

  // Delete testimonial
  deleteTestimonial: (id: string) => api.delete(`/api/testimonials/${id}`),

  // Approve testimonial (admin)
  approveTestimonial: (id: string, isApproved: boolean) =>
    api.post(`/api/testimonials/${id}/approve`, { isApproved }),

  // Publish testimonial (admin)
  publishTestimonial: (id: string) => api.post(`/api/testimonials/${id}/publish`),

  // Unpublish testimonial (admin)
  unpublishTestimonial: (id: string) => api.post(`/api/testimonials/${id}/unpublish`),
};

// Notification API calls
export const notificationAPI = {
  // Get user notifications
  getUserNotifications: (params?: any) => api.get('/api/notifications', { params }),

  // Get unread count
  getUnreadCount: () => api.get('/api/notifications/unread-count'),

  // Get unread notifications
  getUnreadNotifications: () => api.get('/api/notifications/unread'),

  // Get single notification
  getNotification: (notificationId: string) => api.get(`/api/notifications/${notificationId}`),

  // Mark as read
  markAsRead: (notificationId: string) =>
    api.patch(`/api/notifications/${notificationId}/read`),

  // Mark all as read
  markAllAsRead: () => api.patch('/api/notifications/read-all'),

  // Delete notification
  deleteNotification: (notificationId: string) =>
    api.delete(`/api/notifications/${notificationId}`),

  // Send notification (admin)
  sendNotification: (notificationData: any) => api.post('/api/notifications', notificationData),

  // Send invoice reminder (admin)
  sendInvoiceReminder: (invoiceId: string) =>
    api.post('/api/notifications/invoice-reminder', { invoiceId }),

  // Send payment confirmation (admin)
  sendPaymentConfirmation: (paymentId: string) =>
    api.post('/api/notifications/payment-confirmation', { paymentId }),

  // Send project update (admin)
  sendProjectUpdate: (projectId: string, updateData: any) =>
    api.post('/api/notifications/project-update', { projectId, ...updateData }),

  // Send bulk notification (super admin)
  sendBulkNotification: (notificationData: any) =>
    api.post('/api/notifications/bulk', notificationData),

  // Get notifications by category
  getNotificationsByCategory: (category: string) =>
    api.get(`/api/notifications/category/${category}`),
};

// Contact API calls
export const contactAPI = {
  // Get all messages (admin)
  getAllMessages: (params?: any) => api.get('/api/contact', { params }),

  // Get single message
  getMessage: (id: string) => api.get(`/api/contact/${id}`),

  // Submit contact message
  submitContactMessage: (messageData: any) => api.post('/api/contact', messageData),

  // Mark as read
  markAsRead: (id: string) => api.patch(`/api/contact/${id}/read`),

  // Reply to message
  replyToMessage: (id: string, replyData: any) =>
    api.post(`/api/contact/${id}/reply`, replyData),

  // Delete message
  deleteMessage: (id: string) => api.delete(`/api/contact/${id}`),

  // Archive message
  archiveMessage: (id: string) => api.patch(`/api/contact/${id}/archive`),
};

// Dashboard API calls
export const dashboardAPI = {
  // Admin dashboard
  getAdminDashboard: () => api.get('/api/dashboard/admin'),

  // Client dashboard
  getClientDashboard: () => api.get('/api/dashboard/client'),

  // Revenue stats
  getRevenueStats: (params?: any) => api.get('/api/dashboard/revenue', { params }),

  // Project stats
  getProjectStats: (params?: any) => api.get('/api/dashboard/projects', { params }),

  // Client activity
  getClientActivityStats: (params?: any) =>
    api.get('/api/dashboard/client-activity', { params }),

  // Service demand
  getServiceDemandStats: (params?: any) =>
    api.get('/api/dashboard/service-demand', { params }),
};

// User API calls (Admin Management)
export const userAPI = {
  // Get own profile
  getProfile: () => api.get('/api/users/profile'),

  // Update own profile
  updateProfile: (profileData: any) =>
    profileData instanceof FormData
      ? api.put('/api/users/profile', profileData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      : api.put('/api/users/profile', profileData),

  // Change password
  changePassword: (passwordData: any) => api.put('/api/users/change-password', passwordData),

  // Get notification preferences
  getNotificationPreferences: () => api.get('/api/users/notifications'),

  // Update notification preferences
  updateNotificationPreferences: (preferences: any) =>
    api.put('/api/users/notifications', preferences),

  // Get all users (admin)
  getAllUsers: (params?: any) => api.get('/api/users', { params }),

  // Get single user (admin)
  getUserById: (userId: string) => api.get(`/api/users/${userId}`),

  // Create admin user (super admin)
  adminCreateUser: (userData: any) => api.post('/api/users/admin-create', userData),

  // Update user status (super admin)
  updateUserStatus: (userId: string, statusData: any) =>
    api.put(`/api/users/${userId}/status`, statusData),

  // Set user as admin (super admin)
  setUserAdmin: (userId: string, adminData: any) =>
    api.put(`/api/users/${userId}/admin`, adminData),

  // Update user (admin) - full profile edit
  updateUser: (userId: string, userData: any) =>
    api.put(`/api/users/${userId}`, userData),

  // Get user roles (admin)
  getUserRoles: (userId: string) => api.get(`/api/users/${userId}/roles`),

  // Delete user (super admin)
  deleteUser: (userId: string) => api.delete(`/api/users/${userId}`),
};

// Export default api instance and re-export from config
export { api };
export default api;

