# Sire Admin API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints available in the Sire Admin application. The API follows RESTful conventions and uses JWT-based authentication.

**Base URL:** `http://localhost:5000` (configurable via `EXPO_PUBLIC_API_URL` environment variable)

All API endpoints are prefixed with `/api`, so the full URL format is: `http://localhost:5000/api/{endpoint}`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### Authentication Flow

1. **Login/Register** - Obtain access token and refresh token
2. **Token Storage** - Tokens are stored in AsyncStorage
3. **Automatic Refresh** - Access tokens are automatically refreshed when expired (401 response)
4. **Token Refresh** - Use refresh token to get a new access token

---

## API Endpoints

### Auth Endpoints

**Base:** `/api/auth`

#### Register
- **Endpoint:** `POST /auth/register`
- **Description:** Admin registration with OTP verification
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "phone": "string" // optional
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent to email",
    "data": { ... }
  }
  ```

#### Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Description:** Verify OTP and activate account
- **Request Body:**
  ```json
  {
    "email": "string",
    "otp": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Account activated",
    "data": {
      "accessToken": "string",
      "refreshToken": "string",
      "user": { ... }
    }
  }
  ```

#### Resend OTP
- **Endpoint:** `POST /auth/resend-otp`
- **Description:** Resend OTP for verification
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```

#### Login
- **Endpoint:** `POST /auth/login`
- **Description:** Admin login (email/phone + password)
- **Request Body:**
  ```json
  {
    "email": "string", // or phone
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "string",
      "refreshToken": "string",
      "user": { ... }
    }
  }
  ```

#### Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** Logout user
- **Auth Required:** Yes

#### Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Description:** Send password reset email
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```

#### Reset Password
- **Endpoint:** `POST /auth/reset-password/:token`
- **Description:** Reset password with token
- **Request Body:**
  ```json
  {
    "newPassword": "string"
  }
  ```

#### Refresh Token
- **Endpoint:** `POST /auth/refresh-token`
- **Description:** Refresh JWT token
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "string"
    }
  }
  ```

#### Get Current User
- **Endpoint:** `GET /auth/me`
- **Description:** Get current user profile
- **Auth Required:** Yes

---

### Client Endpoints

**Base:** `/api/clients`

#### Get All Clients
- **Endpoint:** `GET /clients`
- **Description:** Get all clients (admin only)
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `search` - Search query
  - `status` - Filter by status

#### Get Single Client
- **Endpoint:** `GET /clients/:id`
- **Description:** Get single client details
- **Auth Required:** Yes

#### Update Client
- **Endpoint:** `PUT /clients/:id`
- **Description:** Update client profile
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "company": "string",
    "address": "string",
    "city": "string",
    "country": "string"
  }
  ```

#### Delete Client
- **Endpoint:** `DELETE /clients/:id`
- **Description:** Delete client (admin only)
- **Auth Required:** Yes (Admin)

#### Get Client Stats
- **Endpoint:** `GET /clients/:id/stats`
- **Description:** Get client statistics
- **Auth Required:** Yes

#### Get Client Projects
- **Endpoint:** `GET /clients/:id/projects`
- **Description:** Get client's projects
- **Auth Required:** Yes

#### Get Client Invoices
- **Endpoint:** `GET /clients/:id/invoices`
- **Description:** Get client's invoices
- **Auth Required:** Yes

#### Get Client Payments
- **Endpoint:** `GET /clients/:id/payments`
- **Description:** Get client's payments
- **Auth Required:** Yes

---

### Service Endpoints

**Base:** `/api/services`

#### Get All Services
- **Endpoint:** `GET /services`
- **Description:** Get all services (admin only)
- **Auth Required:** Yes (Admin)

#### Get Active Services
- **Endpoint:** `GET /services/active`
- **Description:** Get published/active services (public)
- **Auth Required:** No

#### Get Single Service
- **Endpoint:** `GET /services/:id`
- **Description:** Get single service details
- **Auth Required:** No

#### Create Service
- **Endpoint:** `POST /services`
- **Description:** Create new service (admin only)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "features": ["string"],
    "icon": "string" // optional
  }
  ```

#### Update Service
- **Endpoint:** `PUT /services/:id`
- **Description:** Update service (admin only)
- **Auth Required:** Yes (Admin)

#### Delete Service
- **Endpoint:** `DELETE /services/:id`
- **Description:** Delete service (admin only)
- **Auth Required:** Yes (Admin)

#### Toggle Service Status
- **Endpoint:** `PATCH /services/:id/toggle-status`
- **Description:** Activate/deactivate service (admin only)
- **Auth Required:** Yes (Admin)

#### Upload Service Icon
- **Endpoint:** `POST /services/:id/icon`
- **Description:** Upload service icon (admin only)
- **Auth Required:** Yes (Admin)
- **Content-Type:** `multipart/form-data`

---

### Quotation Endpoints

**Base:** `/api/quotations`

#### Get All Quotations
- **Endpoint:** `GET /quotations`
- **Description:** Get all quotations (admin only)
- **Auth Required:** Yes (Admin)

#### Get Single Quotation
- **Endpoint:** `GET /quotations/:quotationId`
- **Description:** Get single quotation details
- **Auth Required:** Yes

#### Create Quotation
- **Endpoint:** `POST /quotations`
- **Description:** Create quotation (admin)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "project": "ObjectId",
    "client": "ObjectId",
    "items": [
      {
        "description": "string",
        "quantity": "number",
        "unitPrice": "number",
        "total": "number"
      }
    ],
    "tax": "number",
    "discount": "number",
    "validUntil": "Date",
    "notes": "string"
  }
  ```

#### Update Quotation
- **Endpoint:** `PUT /quotations/:quotationId`
- **Description:** Update quotation (admin)
- **Auth Required:** Yes (Admin)

#### Delete Quotation
- **Endpoint:** `DELETE /quotations/:quotationId`
- **Description:** Delete quotation (admin)
- **Auth Required:** Yes (Admin)

#### Accept Quotation
- **Endpoint:** `POST /quotations/:quotationId/accept`
- **Description:** Client accepts quotation
- **Auth Required:** Yes (Client)

#### Reject Quotation
- **Endpoint:** `POST /quotations/:quotationId/reject`
- **Description:** Client rejects quotation
- **Auth Required:** Yes (Client)

#### Convert to Invoice
- **Endpoint:** `POST /quotations/:quotationId/convert-to-invoice`
- **Description:** Convert quotation to invoice (admin)
- **Auth Required:** Yes (Admin)

#### Generate PDF
- **Endpoint:** `GET /quotations/:quotationId/pdf`
- **Description:** Generate quotation PDF
- **Auth Required:** Yes
- **Response:** PDF file (blob)

#### Send Quotation
- **Endpoint:** `POST /quotations/:quotationId/send`
- **Description:** Email quotation to client (admin)
- **Auth Required:** Yes (Admin)

---

### Invoice Endpoints

**Base:** `/api/invoices`

#### Get All Invoices
- **Endpoint:** `GET /invoices`
- **Description:** Get all invoices (admin only)
- **Auth Required:** Yes (Admin)

#### Get Single Invoice
- **Endpoint:** `GET /invoices/:invoiceId`
- **Description:** Get single invoice details
- **Auth Required:** Yes

#### Create Invoice
- **Endpoint:** `POST /invoices`
- **Description:** Create invoice (admin)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "client": "ObjectId",
    "quotation": "ObjectId", // optional
    "projectTitle": "string",
    "items": [
      {
        "description": "string",
        "quantity": "number",
        "unitPrice": "number",
        "total": "number"
      }
    ],
    "tax": "number",
    "discount": "number",
    "dueDate": "Date",
    "notes": "string"
  }
  ```

#### Update Invoice
- **Endpoint:** `PUT /invoices/:invoiceId`
- **Description:** Update invoice (admin)
- **Auth Required:** Yes (Admin)

#### Delete Invoice
- **Endpoint:** `DELETE /invoices/:invoiceId`
- **Description:** Delete invoice (admin)
- **Auth Required:** Yes (Admin)

#### Mark as Paid
- **Endpoint:** `PATCH /invoices/:invoiceId/mark-paid`
- **Description:** Mark invoice as paid (admin)
- **Auth Required:** Yes (Admin)

#### Mark as Overdue
- **Endpoint:** `PATCH /invoices/:invoiceId/mark-overdue`
- **Description:** Mark invoice as overdue (admin)
- **Auth Required:** Yes (Admin)

#### Cancel Invoice
- **Endpoint:** `PATCH /invoices/:invoiceId/cancel`
- **Description:** Cancel invoice (admin)
- **Auth Required:** Yes (Admin)

#### Generate PDF
- **Endpoint:** `GET /invoices/:invoiceId/pdf`
- **Description:** Generate invoice PDF
- **Auth Required:** Yes
- **Response:** PDF file (blob)

#### Send Invoice
- **Endpoint:** `POST /invoices/:invoiceId/send`
- **Description:** Email invoice to client (admin)
- **Auth Required:** Yes (Admin)

---

### Payment Endpoints

**Base:** `/api/payments`

#### Get All Payments
- **Endpoint:** `GET /payments`
- **Description:** Get all payments (admin only)
- **Auth Required:** Yes (Admin)

#### Get Single Payment
- **Endpoint:** `GET /payments/:paymentId`
- **Description:** Get single payment details
- **Auth Required:** Yes

#### Create Payment
- **Endpoint:** `POST /payments`
- **Description:** Record payment (admin)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "invoice": "ObjectId",
    "client": "ObjectId",
    "amount": "number",
    "paymentMethod": "mpesa" | "paystack",
    "paymentDate": "Date",
    "notes": "string"
  }
  ```

#### Update Payment
- **Endpoint:** `PUT /payments/:paymentId`
- **Description:** Update payment (admin)
- **Auth Required:** Yes (Admin)

#### Delete Payment
- **Endpoint:** `DELETE /payments/:paymentId`
- **Description:** Delete payment (admin)
- **Auth Required:** Yes (Admin)

#### Get Client Payments
- **Endpoint:** `GET /payments/client/:clientId`
- **Description:** Get payments for a client
- **Auth Required:** Yes

#### Get Invoice Payments
- **Endpoint:** `GET /payments/invoice/:invoiceId`
- **Description:** Get payments for an invoice
- **Auth Required:** Yes

#### Initiate Payment
- **Endpoint:** `POST /payments/initiate`
- **Description:** Initiate payment (M-Pesa or Paystack)
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "invoiceId": "ObjectId",
    "paymentMethod": "mpesa" | "paystack",
    "phoneNumber": "string" // for M-Pesa
  }
  ```

#### Query M-Pesa Status
- **Endpoint:** `GET /payments/mpesa-status/:checkoutRequestId`
- **Description:** Query M-Pesa payment status by checkout request ID
- **Auth Required:** Yes

---

### Project Endpoints

**Base:** `/api/projects`

#### Get All Projects
- **Endpoint:** `GET /projects`
- **Description:** Get all projects (admin only)
- **Auth Required:** Yes (Admin)

#### Get Project Statistics
- **Endpoint:** `GET /projects/stats`
- **Description:** Get project statistics (admin)
- **Auth Required:** Yes (Admin)

#### Get Assigned Projects
- **Endpoint:** `GET /projects/assigned`
- **Description:** Get projects assigned to current user
- **Auth Required:** Yes

#### Get Client Projects
- **Endpoint:** `GET /projects/client/:clientId`
- **Description:** Get client's projects
- **Auth Required:** Yes

#### Get Single Project
- **Endpoint:** `GET /projects/:projectId`
- **Description:** Get single project details
- **Auth Required:** Yes

#### Create Project
- **Endpoint:** `POST /projects`
- **Description:** Create project (admin)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "client": "ObjectId",
    "services": ["ObjectId"],
    "status": "pending" | "in_progress" | "on_hold" | "completed" | "cancelled",
    "priority": "low" | "medium" | "high" | "urgent",
    "assignedTo": ["ObjectId"],
    "startDate": "Date",
    "endDate": "Date",
    "notes": "string"
  }
  ```

#### Update Project
- **Endpoint:** `PUT /projects/:projectId`
- **Description:** Update project
- **Auth Required:** Yes

#### Delete Project
- **Endpoint:** `DELETE /projects/:projectId`
- **Description:** Delete project (admin)
- **Auth Required:** Yes (Admin)

#### Assign Team Members
- **Endpoint:** `POST /projects/:projectId/assign`
- **Description:** Assign team members to project (admin)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "teamMembers": ["ObjectId"]
  }
  ```

#### Update Project Status
- **Endpoint:** `PATCH /projects/:projectId/status`
- **Description:** Update project status
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "status": "pending" | "in_progress" | "on_hold" | "completed" | "cancelled"
  }
  ```

#### Update Progress
- **Endpoint:** `PATCH /projects/:projectId/progress`
- **Description:** Update project progress percentage
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "progress": "number" // 0-100
  }
  ```

#### Add Milestone
- **Endpoint:** `POST /projects/:projectId/milestones`
- **Description:** Add project milestone
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "dueDate": "Date"
  }
  ```

#### Update Milestone
- **Endpoint:** `PATCH /projects/:projectId/milestones/:milestoneId`
- **Description:** Update milestone
- **Auth Required:** Yes

#### Delete Milestone
- **Endpoint:** `DELETE /projects/:projectId/milestones/:milestoneId`
- **Description:** Delete milestone
- **Auth Required:** Yes

#### Upload Attachment
- **Endpoint:** `POST /projects/:projectId/attachments`
- **Description:** Upload project file
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`

#### Delete Attachment
- **Endpoint:** `DELETE /projects/:projectId/attachments/:attachmentId`
- **Description:** Delete project file
- **Auth Required:** Yes

---

### Testimonial Endpoints

**Base:** `/api/testimonials`

#### Get All Testimonials
- **Endpoint:** `GET /testimonials`
- **Description:** Get all testimonials (admin only)
- **Auth Required:** Yes (Admin)

#### Get Published Testimonials
- **Endpoint:** `GET /testimonials/published`
- **Description:** Get published testimonials (public)
- **Auth Required:** No

#### Get Single Testimonial
- **Endpoint:** `GET /testimonials/:id`
- **Description:** Get single testimonial
- **Auth Required:** Yes

#### Create Testimonial
- **Endpoint:** `POST /testimonials`
- **Description:** Client submits testimonial
- **Auth Required:** Yes (Client)
- **Request Body:**
  ```json
  {
    "project": "ObjectId", // optional
    "rating": "number", // 1-5
    "message": "string"
  }
  ```

#### Update Testimonial
- **Endpoint:** `PUT /testimonials/:id`
- **Description:** Update testimonial
- **Auth Required:** Yes

#### Delete Testimonial
- **Endpoint:** `DELETE /testimonials/:id`
- **Description:** Delete testimonial
- **Auth Required:** Yes

#### Approve Testimonial
- **Endpoint:** `POST /testimonials/:id/approve`
- **Description:** Admin approves testimonial
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "isApproved": "boolean"
  }
  ```

#### Publish Testimonial
- **Endpoint:** `POST /testimonials/:id/publish`
- **Description:** Publish testimonial (admin)
- **Auth Required:** Yes (Admin)

#### Unpublish Testimonial
- **Endpoint:** `POST /testimonials/:id/unpublish`
- **Description:** Unpublish testimonial (admin)
- **Auth Required:** Yes (Admin)

---

### Notification Endpoints

**Base:** `/api/notifications`

#### Get User Notifications
- **Endpoint:** `GET /notifications`
- **Description:** Get user's notifications
- **Auth Required:** Yes

#### Get Unread Count
- **Endpoint:** `GET /notifications/unread-count`
- **Description:** Get unread notification count
- **Auth Required:** Yes

#### Get Unread Notifications
- **Endpoint:** `GET /notifications/unread`
- **Description:** Get unread notifications
- **Auth Required:** Yes

#### Get Single Notification
- **Endpoint:** `GET /notifications/:notificationId`
- **Description:** Get single notification
- **Auth Required:** Yes

#### Mark as Read
- **Endpoint:** `PATCH /notifications/:notificationId/read`
- **Description:** Mark notification as read
- **Auth Required:** Yes

#### Mark All as Read
- **Endpoint:** `PATCH /notifications/read-all`
- **Description:** Mark all notifications as read
- **Auth Required:** Yes

#### Delete Notification
- **Endpoint:** `DELETE /notifications/:notificationId`
- **Description:** Delete notification
- **Auth Required:** Yes

#### Send Notification
- **Endpoint:** `POST /notifications`
- **Description:** Send notification (admin)
- **Auth Required:** Yes (Admin)

#### Send Invoice Reminder
- **Endpoint:** `POST /notifications/invoice-reminder`
- **Description:** Send invoice reminder (admin)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "invoiceId": "ObjectId"
  }
  ```

#### Send Payment Confirmation
- **Endpoint:** `POST /notifications/payment-confirmation`
- **Description:** Send payment confirmation (admin)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "paymentId": "ObjectId"
  }
  ```

#### Send Project Update
- **Endpoint:** `POST /notifications/project-update`
- **Description:** Send project update notification (admin)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "projectId": "ObjectId",
    "message": "string"
  }
  ```

#### Send Bulk Notification
- **Endpoint:** `POST /notifications/bulk`
- **Description:** Send bulk notification (super admin)
- **Auth Required:** Yes (Super Admin)

#### Get Notifications by Category
- **Endpoint:** `GET /notifications/category/:category`
- **Description:** Get notifications by category
- **Auth Required:** Yes
- **Categories:** `invoice`, `payment`, `project`, `quotation`, `general`

---

### Contact Endpoints

**Base:** `/api/contact`

#### Get All Messages
- **Endpoint:** `GET /contact`
- **Description:** Get all contact messages (admin only)
- **Auth Required:** Yes (Admin)

#### Get Single Message
- **Endpoint:** `GET /contact/:id`
- **Description:** Get single contact message
- **Auth Required:** Yes (Admin)

#### Submit Contact Message
- **Endpoint:** `POST /contact`
- **Description:** Submit contact form message
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string", // optional
    "subject": "string",
    "message": "string"
  }
  ```

#### Mark as Read
- **Endpoint:** `PATCH /contact/:id/read`
- **Description:** Mark message as read
- **Auth Required:** Yes (Admin)

#### Reply to Message
- **Endpoint:** `POST /contact/:id/reply`
- **Description:** Reply to contact message
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "reply": "string"
  }
  ```

#### Delete Message
- **Endpoint:** `DELETE /contact/:id`
- **Description:** Delete contact message
- **Auth Required:** Yes (Admin)

#### Archive Message
- **Endpoint:** `PATCH /contact/:id/archive`
- **Description:** Archive contact message
- **Auth Required:** Yes (Admin)

---

### Dashboard Endpoints

**Base:** `/api/dashboard`

#### Admin Dashboard
- **Endpoint:** `GET /dashboard/admin`
- **Description:** Get admin dashboard statistics
- **Auth Required:** Yes (Admin)

#### Client Dashboard
- **Endpoint:** `GET /dashboard/client`
- **Description:** Get client dashboard statistics
- **Auth Required:** Yes (Client)

#### Revenue Stats
- **Endpoint:** `GET /dashboard/revenue`
- **Description:** Get revenue analytics
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `startDate` - Start date
  - `endDate` - End date
  - `period` - Time period (daily, weekly, monthly, yearly)

#### Project Stats
- **Endpoint:** `GET /dashboard/projects`
- **Description:** Get project statistics
- **Auth Required:** Yes (Admin)

#### Client Activity Stats
- **Endpoint:** `GET /dashboard/client-activity`
- **Description:** Get client activity statistics
- **Auth Required:** Yes (Admin)

#### Service Demand Stats
- **Endpoint:** `GET /dashboard/service-demand`
- **Description:** Get service demand analytics
- **Auth Required:** Yes (Admin)

---

### User Endpoints (Admin Management)

**Base:** `/api/users`

#### Get Own Profile
- **Endpoint:** `GET /users/profile`
- **Description:** Get current user profile
- **Auth Required:** Yes

#### Update Own Profile
- **Endpoint:** `PUT /users/profile`
- **Description:** Update own profile
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "avatar": "string"
  }
  ```

#### Change Password
- **Endpoint:** `PUT /users/change-password`
- **Description:** Change password
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```

#### Get Notification Preferences
- **Endpoint:** `GET /users/notifications`
- **Description:** Get notification preferences
- **Auth Required:** Yes

#### Update Notification Preferences
- **Endpoint:** `PUT /users/notifications`
- **Description:** Update notification preferences
- **Auth Required:** Yes

#### Get All Users
- **Endpoint:** `GET /users`
- **Description:** Get all admin users
- **Auth Required:** Yes (Admin)

#### Get Single User
- **Endpoint:** `GET /users/:userId`
- **Description:** Get single user details
- **Auth Required:** Yes (Admin)

#### Create Admin User
- **Endpoint:** `POST /users/admin-create`
- **Description:** Create admin user (super admin)
- **Auth Required:** Yes (Super Admin)
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "role": "super_admin" | "finance" | "project_manager" | "staff",
    "phone": "string"
  }
  ```

#### Update User Status
- **Endpoint:** `PUT /users/:userId/status`
- **Description:** Update user status (super admin)
- **Auth Required:** Yes (Super Admin)
- **Request Body:**
  ```json
  {
    "isActive": "boolean"
  }
  ```

#### Set User Admin
- **Endpoint:** `PUT /users/:userId/admin`
- **Description:** Set user admin role (super admin)
- **Auth Required:** Yes (Super Admin)
- **Request Body:**
  ```json
  {
    "role": "super_admin" | "finance" | "project_manager" | "staff"
  }
  ```

#### Get User Roles
- **Endpoint:** `GET /users/:userId/roles`
- **Description:** Get user roles
- **Auth Required:** Yes (Admin)

#### Delete User
- **Endpoint:** `DELETE /users/:userId`
- **Description:** Delete user (super admin)
- **Auth Required:** Yes (Super Admin)

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Error Handling

The API client automatically handles:
- **401 Unauthorized** - Attempts to refresh the access token using the refresh token
- **Token Refresh** - Automatically retries the original request after token refresh
- **FormData** - Automatically handles file uploads with proper Content-Type headers

## Usage Example

```typescript
import { authAPI, clientAPI, invoiceAPI } from '@/api';

// Login
const response = await authAPI.login({
  email: 'admin@example.com',
  password: 'password123'
});

// Get all clients
const clients = await clientAPI.getAllClients({ page: 1, limit: 10 });

// Create invoice
const invoice = await invoiceAPI.createInvoice({
  client: 'clientId',
  projectTitle: 'Project Name',
  items: [...],
  dueDate: new Date()
});
```

## Notes

- All dates should be in ISO 8601 format
- File uploads use `FormData` and are automatically handled
- Pagination parameters: `page` (default: 1), `limit` (default: 10)
- Search parameters vary by endpoint
- All ObjectId references should be valid MongoDB ObjectIds

---

**Last Updated:** January 2025  
**Version:** 1.0.0

