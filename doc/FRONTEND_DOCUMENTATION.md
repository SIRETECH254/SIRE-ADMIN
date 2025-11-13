# 🚀 Sire Tech Admin - Frontend Documentation

## 📋 Table of Contents
- [Technology Stack](#technology-stack)
- [Required Packages](#required-packages)
- [Architecture Overview](#architecture-overview)
- [Pages & Screens](#pages--screens)
- [Components](#components)
- [Hooks](#hooks)
- [Constants](#constants)
- [Routing Structure](#routing-structure)
- [Styling Approach](#styling-approach)
- [UI Design System](#ui-design-system)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)

---

## 🛠️ Technology Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Routing:** Expo Router (File-based routing)
- **Styling:** 
  - NativeWind (Tailwind CSS for React Native)
  - StyleSheet (React Native)
  - Themed Components
- **Navigation:** React Navigation (via Expo Router)
- **Platform Support:** iOS, Android, Web
- **Build System:** Expo

---

## 📦 Required Packages

### Core Dependencies
```json
{
  "expo": "~54.0.22",
  "expo-router": "~6.0.14",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-web": "~0.21.0",
  "typescript": "~5.9.2"
}
```

### Navigation & Routing
```json
{
  "@react-navigation/native": "^7.1.8",
  "@react-navigation/bottom-tabs": "^7.4.0",
  "@react-navigation/elements": "^2.6.3",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-gesture-handler": "~2.28.0"
}
```

### Styling & UI
```json
{
  "nativewind": "^5.0.0-preview.2",
  "tailwindcss": "^4.1.16",
  "@tailwindcss/postcss": "^4.1.16",
  "postcss": "^8.5.6",
  "react-native-css": "^3.0.1"
}
```

### Expo Modules
```json
{
  "expo-constants": "~18.0.10",
  "expo-font": "~14.0.9",
  "expo-haptics": "~15.0.7",
  "expo-image": "~3.0.10",
  "expo-linking": "~8.0.8",
  "expo-splash-screen": "~31.0.10",
  "expo-status-bar": "~3.0.8",
  "expo-symbols": "~1.0.7",
  "expo-system-ui": "~6.0.8",
  "expo-web-browser": "~15.0.9"
}
```

### Icons & Visual
```json
{
  "@expo/vector-icons": "^15.0.3"
}
```

### Animations
```json
{
  "react-native-reanimated": "~4.1.1",
  "react-native-worklets": "0.5.1"
}
```

### Dev Dependencies
```json
{
  "@types/react": "~19.1.0",
  "eslint": "^9.25.0",
  "eslint-config-expo": "~10.0.0"
}
```

---

## 🏗️ Architecture Overview

### Folder Structure
```
sire-admin/
├── app/                          # File-based routing (Expo Router)
│   ├── (authenticated)/          # Authenticated routes group
│   │   ├── _layout.tsx          # Authenticated layout (with auth guard)
│   │   ├── index.tsx            # Admin dashboard (main overview)
│   │   │
│   │   ├── clients/             # Client management section
│   │   │   ├── index.tsx        # Client list page
│   │   │   ├── [id].tsx         # Client detail page
│   │   │   ├── create.tsx       # Create new client
│   │   │   ├── [id]/edit.tsx    # Edit client
│   │   │   ├── [id]/projects.tsx # Client's projects
│   │   │   ├── [id]/invoices.tsx # Client's invoices
│   │   │   ├── [id]/payments.tsx # Client's payments
│   │   │   └── [id]/stats.tsx   # Client statistics
│   │   │
│   │   ├── services/            # Service management section
│   │   │   ├── index.tsx        # Service list page
│   │   │   ├── [id].tsx         # Service detail page
│   │   │   ├── create.tsx       # Create new service
│   │   │   └── [id]/edit.tsx    # Edit service
│   │   │
│   │   ├── quotations/          # Quotation management section
│   │   │   ├── index.tsx        # Quotation list page
│   │   │   ├── [id].tsx         # Quotation detail page
│   │   │   ├── create.tsx       # Create new quotation
│   │   │   ├── [id]/edit.tsx    # Edit quotation
│   │   │   └── [id]/convert.tsx # Convert to invoice
│   │   │
│   │   ├── invoices/            # Invoice management section
│   │   │   ├── index.tsx        # Invoice list page
│   │   │   ├── [id].tsx         # Invoice detail page
│   │   │   ├── create.tsx       # Create new invoice
│   │   │   └── [id]/edit.tsx    # Edit invoice
│   │   │
│   │   ├── payments/             # Payment management section
│   │   │   ├── index.tsx        # Payment list page
│   │   │   ├── [id].tsx         # Payment detail page
│   │   │   ├── create.tsx       # Record payment (admin)
│   │   │   └── initiate.tsx     # Initiate payment (M-Pesa/Paystack)
│   │   │
│   │   ├── projects/             # Project management section
│   │   │   ├── index.tsx        # Project list page
│   │   │   ├── [id].tsx         # Project detail page
│   │   │   ├── create.tsx       # Create new project
│   │   │   ├── [id]/edit.tsx    # Edit project
│   │   │   ├── [id]/milestones.tsx # Project milestones
│   │   │   └── [id]/attachments.tsx # Project attachments
│   │   │
│   │   ├── testimonials/         # Testimonial management section
│   │   │   ├── index.tsx        # Testimonial list page
│   │   │   ├── [id].tsx         # Testimonial detail page
│   │   │   └── [id]/approve.tsx # Approve/publish testimonial
│   │   │
│   │   ├── notifications/        # Notification center
│   │   │   ├── index.tsx        # Notification list page
│   │   │   ├── [id].tsx         # Notification detail page
│   │   │   └── settings.tsx     # Notification preferences
│   │   │
│   │   ├── contact/              # Contact message management
│   │   │   ├── index.tsx        # Contact messages list
│   │   │   ├── [id].tsx         # Message detail page
│   │   │   └── [id]/reply.tsx   # Reply to message
│   │   │
│   │   ├── users/                # Admin user management (super admin)
│   │   │   ├── index.tsx        # User list page
│   │   │   ├── [id].tsx         # User detail page
│   │   │   ├── create.tsx       # Create admin user
│   │   │   └── [id]/edit.tsx    # Edit user role/status
│   │   │
│   │   ├── profile/              # User profile management
│   │   │   ├── index.tsx        # View/edit own profile
│   │   │   └── change-password.tsx # Change password
│   │   │
│   │   └── settings/             # App settings
│   │       ├── index.tsx        # General settings
│   │       ├── notifications.tsx # Notification preferences
│   │       └── account.tsx      # Account settings
│   │
│   ├── (public)/                 # Public routes group
│   │   ├── _layout.tsx          # Public layout
│   │   ├── login.tsx            # Login screen
│   │   ├── register.tsx         # Admin registration screen
│   │   ├── verify-otp.tsx       # OTP verification screen
│   │   ├── forgot-password.tsx  # Forgot password screen
│   │   └── reset-password/[token].tsx # Reset password screen
│   │
│   ├── _layout.tsx              # Root layout
│   ├── +html.tsx                # HTML shell for web
│   ├── +not-found.tsx           # 404 Not Found page
│   └── index.tsx                # Root/index route (redirects to login or dashboard)
│
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components (Design System)
│   │   ├── Button.tsx          # Button variants (Primary, Secondary, Danger)
│   │   ├── Input.tsx           # Form inputs with validation
│   │   ├── Card.tsx            # Card container with accent strip
│   │   ├── Modal.tsx           # Modal dialogs
│   │   ├── Alert.tsx           # Notifications/alerts (Success, Error, Info)
│   │   ├── Badge.tsx           # Status badges
│   │   ├── collapsible.tsx     # Collapsible/Accordion component
│   │   ├── icon-symbol.tsx     # Icon component (Android/Web)
│   │   └── icon-symbol.ios.tsx # Icon component (iOS)
│   ├── layout/                  # Layout components
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── Sidebar.tsx         # Side navigation menu
│   │   ├── Footer.tsx          # Page footer
│   │   └── Container.tsx       # Page container wrapper
│   ├── forms/                   # Form components
│   │   ├── FormInput.tsx       # Form input with label and error
│   │   ├── Select.tsx          # Dropdown select component
│   │   ├── DatePicker.tsx      # Date selection component
│   │   └── Checkbox.tsx        # Checkbox input component
│   ├── external-link.tsx        # External link component
│   ├── haptic-tab.tsx           # Haptic feedback tab button
│   ├── hello-wave.tsx           # Animated wave component
│   ├── parallax-scroll-view.tsx # Parallax scroll container
│   ├── themed-text.tsx          # Themed text component
│   └── themed-view.tsx          # Themed view component
│
├── hooks/                       # Custom React hooks
│   ├── use-color-scheme.ts      # Color scheme hook (native)
│   ├── use-color-scheme.web.ts  # Color scheme hook (web)
│   └── use-theme-color.ts       # Theme color hook
│
├── constants/                   # App constants
│   └── theme.ts                 # Theme colors, fonts, brand palette, spacing
├── services/                    # API & external services
│   └── api.ts                   # Axios API client with interceptors
│
├── assets/                      # Static assets
│   └── images/                  # Image assets
│       ├── icon.png
│       ├── favicon.png
│       ├── splash-icon.png
│       └── ...
│
├── doc/                         # Documentation
│   └── FRONTEND_DOCUMENTATION.md
│
├── scripts/                     # Build scripts
│   └── reset-project.js         # Reset project script
│
├── .expo/                       # Expo build files
├── node_modules/                # Dependencies
│
├── app.json                     # Expo configuration
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
├── metro.config.js              # Metro bundler configuration
├── global.css                   # Global styles (Tailwind imports)
├── .env                         # Environment variables (API URLs, etc.)
└── .gitignore                   # Git ignore rules
```

### Architecture Patterns

#### 1. **File-Based Routing**
- Uses Expo Router for file-based navigation
- Route structure mirrors folder structure
- Grouped routes using parentheses: `(authenticated)`, `(public)`
- Dynamic routes with brackets: `[id].tsx`
- Special files: `+html.tsx` (web HTML shell), `+not-found.tsx` (404 page)

#### 2. **Component Architecture**
- **UI Components:** Base design system components in `components/ui/` (Button, Input, Card, Modal, Alert, Badge)
- **Layout Components:** Navigation and page structure in `components/layout/` (Navbar, Sidebar, Footer, Container)
- **Form Components:** Form-specific inputs in `components/forms/` (FormInput, Select, DatePicker, Checkbox)
- **Table Components:** Data presentation in `components/tables/` (Table, TableHeader, TableRow, Pagination)
- **Screen Components:** Page-level components in `components/screens/admin/` (Dashboard, ClientList, ProjectCard, InvoiceTable)
- **Presentational Components:** UI-only components in `components/` root (ThemedText, ThemedView, etc.)
- **Screen Pages:** Full page screens in `app/` directory
- **Themed Components:** Dark/light mode aware components throughout

#### 3. **Styling Strategy**
- **NativeWind:** Tailwind CSS utility classes
- **StyleSheet:** React Native StyleSheet for complex styles
- **Themed Components:** Automatic dark/light mode support
- **Global Styles:** CSS imports via `global.css`

#### 4. **State Management**
- React hooks for local component state
- Auth context (`AuthProvider`) for session lifecycle helpers
- Redux Toolkit + Redux Persist for global app/auth state
- TanStack Query for server state caching and data synchronization
- Expo Router for navigation state

#### 5. **Services Layer**
- API client in `api/config.ts` built on axios
- Request/response interceptors for authentication
- Centralized error handling
- Environment-based configuration

---

## 📱 Pages & Screens

### 1. Root Layout (`app/_layout.tsx`)
**Purpose:** Root navigation structure and app-wide configuration

**Features:**
- Stack navigator setup
- Theme provider (dark/light mode)
- Status bar configuration
- Global layout wrapper
- Route group organization
- Providers composed for data/state:
  - `QueryClientProvider` (TanStack Query)
  - Redux `Provider` with persisted store
  - `AuthProvider` for auth context orchestration

**Routes:**
- `(authenticated)` - Protected routes requiring authentication
- `(public)` - Public routes (login, register, etc.)
- Root index route for initial navigation

---

### 2. HTML Shell (`app/+html.tsx`)
**Purpose:** Custom HTML shell for web platform

**Features:**
- Web-specific HTML structure
- Meta tags configuration
- Custom head content
- Web styling setup

---

### 3. Not Found Page (`app/+not-found.tsx`)
**Purpose:** 404 error page for unmatched routes

**Features:**
- User-friendly error message
- Navigation back to home
- Error illustration/icon

---

### 4. Root Index (`app/index.tsx`)
**Purpose:** Entry point route that redirects based on auth status

**Features:**
- Authentication check
- Redirects to login (if not authenticated)
- Redirects to dashboard (if authenticated)
- Loading state handling

---

### 5. Authenticated Layout (`app/(authenticated)/_layout.tsx`)
**Purpose:** Layout wrapper for authenticated routes with auth guard

**Features:**
- Authentication guard/middleware
- Protected route access control
- Shared layout for authenticated pages
- Navigation structure for authenticated users

---

### 6. Public Layout (`app/(public)/_layout.tsx`)
**Purpose:** Layout wrapper for public routes

**Features:**
- Public route layout
- No authentication required
- Shared styling for public pages

---

### 7. Login Screen (`app/(public)/login.tsx`)
**Purpose:** User authentication/login screen

**Features:**
- Email/password login form
- Form validation
- Error handling
- Redirect to dashboard on success

---

### 8. Register Screen (`app/(public)/register.tsx`)
**Purpose:** User registration screen

**Features:**
- Registration form
- Form validation
- Error handling
- Redirect to login on success

---

### 9. Authenticated Index (`app/(authenticated)/index.tsx`)
**Purpose:** Admin dashboard/main screen

**Features:**
- Dashboard overview
- Statistics widgets
- Quick actions
- Recent activity

---

### 10. Client Management Pages

#### `app/(authenticated)/clients/index.tsx`
**Purpose:** Client list page

**Features:**
- Display all clients in table/card view
- Search and filter clients
- Sort by name, email, status
- Quick actions (view, edit, delete)
- Pagination support
- Export functionality

#### `app/(authenticated)/clients/[id].tsx`
**Purpose:** Client detail page

**Features:**
- Client profile information
- Contact details
- Account status
- Quick stats (projects count, invoices, payments)
- Navigation to related resources
- Action buttons (edit, delete, deactivate)

#### `app/(authenticated)/clients/create.tsx`
**Purpose:** Create new client

**Features:**
- Registration form (firstName, lastName, email, phone, password)
- Company information (optional)
- Address details
- Form validation
- Success redirect to client detail page

#### `app/(authenticated)/clients/[id]/edit.tsx`
**Purpose:** Edit client information

**Features:**
- Pre-filled form with existing data
- Update client profile
- Change account status
- Form validation
- Save changes

#### `app/(authenticated)/clients/[id]/projects.tsx`
**Purpose:** View client's projects

**Features:**
- List of all projects for the client
- Project status filter
- Project cards with key information
- Link to project detail pages

#### `app/(authenticated)/clients/[id]/invoices.tsx`
**Purpose:** View client's invoices

**Features:**
- Invoice list with status indicators
- Filter by status (draft, sent, paid, overdue)
- Payment summary
- Link to invoice detail pages

#### `app/(authenticated)/clients/[id]/payments.tsx`
**Purpose:** View client's payment history

**Features:**
- Payment transaction list
- Filter by payment method (M-Pesa, Paystack)
- Payment status indicators
- Transaction details

#### `app/(authenticated)/clients/[id]/stats.tsx`
**Purpose:** Client statistics dashboard

**Features:**
- Total projects count
- Total invoices and amount
- Payment statistics
- Activity timeline
- Charts and graphs

---

### 11. Service Management Pages

#### `app/(authenticated)/services/index.tsx`
**Purpose:** Service list page

**Features:**
- Display all services
- Active/inactive filter
- Search services
- Service cards with icons
- Quick actions (view, edit, toggle status, delete)

#### `app/(authenticated)/services/[id].tsx`
**Purpose:** Service detail page

**Features:**
- Service title and description
- Features list
- Service icon/image
- Active status indicator
- Edit and delete actions

#### `app/(authenticated)/services/create.tsx`
**Purpose:** Create new service

**Features:**
- Service form (title, description, features)
- Icon upload (Cloudinary)
- Feature list management (add/remove)
- Active status toggle
- Form validation

#### `app/(authenticated)/services/[id]/edit.tsx`
**Purpose:** Edit service

**Features:**
- Pre-filled service form
- Update service details
- Modify features
- Change icon
- Toggle active status

---

### 12. Quotation Management Pages

#### `app/(authenticated)/quotations/index.tsx`
**Purpose:** Quotation list page

**Features:**
- Display all quotations with status
- Filter by status (pending, sent, accepted, rejected, converted)
- Search by quotation number or client
- Sort by date, amount, status
- Quick actions (view, edit, send, convert)

#### `app/(authenticated)/quotations/[id].tsx`
**Purpose:** Quotation detail page

**Features:**
- Quotation header (number, date, client)
- Items table with quantities and prices
- Subtotal, tax, discount, total breakdown
- Status indicator
- Valid until date
- Notes section
- Actions: Edit, Send, Convert to Invoice, Generate PDF, Delete

#### `app/(authenticated)/quotations/create.tsx`
**Purpose:** Create new quotation

**Features:**
- Client selection
- Project selection (optional)
- Items management (add/remove items)
- Tax and discount inputs
- Valid until date picker
- Notes field
- Auto-calculate totals

#### `app/(authenticated)/quotations/[id]/edit.tsx`
**Purpose:** Edit quotation

**Features:**
- Pre-filled quotation form
- Modify items, quantities, prices
- Update tax, discount, valid until
- Recalculate totals
- Save changes

#### `app/(authenticated)/quotations/[id]/convert.tsx`
**Purpose:** Convert quotation to invoice

**Features:**
- Confirmation dialog
- Invoice preview
- Auto-fill invoice details from quotation
- Create invoice and link quotation

---

### 13. Invoice Management Pages

#### `app/(authenticated)/invoices/index.tsx`
**Purpose:** Invoice list page

**Features:**
- Display all invoices
- Filter by status (draft, sent, paid, partially_paid, overdue, cancelled)
- Search by invoice number or client
- Sort by date, amount, due date
- Payment status indicators
- Quick actions (view, edit, send, mark paid)

#### `app/(authenticated)/invoices/[id].tsx`
**Purpose:** Invoice detail page

**Features:**
- Invoice header (number, date, client, due date)
- Items table
- Pricing breakdown (subtotal, tax, discount, total)
- Payment status and paid amount
- Payment history
- Actions: Edit, Send, Mark as Paid, Generate PDF, Cancel

#### `app/(authenticated)/invoices/create.tsx`
**Purpose:** Create new invoice

**Features:**
- Client selection
- Quotation selection (optional - auto-fill from quotation)
- Project title input
- Items management
- Tax and discount inputs
- Due date picker
- Notes field
- Auto-calculate totals

#### `app/(authenticated)/invoices/[id]/edit.tsx`
**Purpose:** Edit invoice

**Features:**
- Pre-filled invoice form
- Modify items and pricing
- Update due date, tax, discount
- Edit notes
- Recalculate totals

---

### 14. Payment Management Pages

#### `app/(authenticated)/payments/index.tsx`
**Purpose:** Payment list page

**Features:**
- Display all payments
- Filter by status (pending, completed, failed)
- Filter by payment method (M-Pesa, Paystack)
- Search by payment number or client
- Sort by date, amount
- Quick actions (view, update status)

#### `app/(authenticated)/payments/[id].tsx`
**Purpose:** Payment detail page

**Features:**
- Payment information (number, amount, date)
- Invoice reference
- Client details
- Payment method and status
- Transaction ID and references
- Processor-specific metadata
- Notes and metadata

#### `app/(authenticated)/payments/create.tsx`
**Purpose:** Record payment manually (admin)

**Features:**
- Invoice selection
- Client selection (auto-filled from invoice)
- Amount input
- Payment method selection
- Payment date picker
- Transaction ID input
- Notes field
- Save payment record

#### `app/(authenticated)/payments/initiate.tsx`
**Purpose:** Initiate payment (M-Pesa/Paystack)

**Features:**
- Invoice selection
- Payment method selection (M-Pesa or Paystack)
- Phone number input (for M-Pesa)
- Payment amount (pre-filled from invoice)
- Initiate payment button
- Payment status tracking
- Webhook handling UI

---

### 15. Project Management Pages

#### `app/(authenticated)/projects/index.tsx`
**Purpose:** Project list page

**Features:**
- Display all projects
- Filter by status (pending, in_progress, on_hold, completed, cancelled)
- Filter by priority (low, medium, high, urgent)
- Search by project number or title
- Assignee filter
- Sort by date, priority, progress
- Project cards with status indicators

#### `app/(authenticated)/projects/[id].tsx`
**Purpose:** Project detail page

**Features:**
- Project header (number, title, status, priority)
- Description
- Client information
- Related quotation and invoice
- Services included
- Assigned team members
- Timeline (start date, end date, completion date)
- Progress bar and percentage
- Milestones list
- Attachments section
- Notes section
- Actions: Edit, Update Status, Update Progress, Add Milestone

#### `app/(authenticated)/projects/create.tsx`
**Purpose:** Create new project

**Features:**
- Project title and description
- Client selection
- Service selection (multi-select)
- Status and priority selection
- Team member assignment (multi-select)
- Start date and end date pickers
- Initial progress percentage
- Add initial milestones
- Notes field

#### `app/(authenticated)/projects/[id]/edit.tsx`
**Purpose:** Edit project

**Features:**
- Pre-filled project form
- Update project details
- Modify team assignments
- Change status and priority
- Update timeline
- Edit notes

#### `app/(authenticated)/projects/[id]/milestones.tsx`
**Purpose:** Manage project milestones

**Features:**
- Milestones list
- Add new milestone (title, description, due date)
- Update milestone status
- Mark milestone as completed
- Delete milestone

#### `app/(authenticated)/projects/[id]/attachments.tsx`
**Purpose:** Manage project attachments

**Features:**
- Attachments list with download links
- Upload new attachments (Cloudinary)
- Delete attachments
- View attachment details

---

### 16. Testimonial Management Pages

#### `app/(authenticated)/testimonials/index.tsx`
**Purpose:** Testimonial list page

**Features:**
- Display all testimonials
- Filter by approval status (approved, pending)
- Filter by publish status (published, unpublished)
- Search by client name
- Rating filter (1-5 stars)
- Quick actions (approve, publish, view, delete)

#### `app/(authenticated)/testimonials/[id].tsx`
**Purpose:** Testimonial detail page

**Features:**
- Client information
- Related project (if any)
- Rating display (stars)
- Testimonial message
- Approval status
- Publish status
- Actions: Approve, Publish, Unpublish, Edit, Delete

#### `app/(authenticated)/testimonials/[id]/approve.tsx`
**Purpose:** Approve and publish testimonial

**Features:**
- Review testimonial content
- Approve testimonial
- Publish/unpublish toggle
- Admin notes

---

### 17. Notification Management Pages

#### `app/(authenticated)/notifications/index.tsx`
**Purpose:** Notification center

**Features:**
- Notification list (in_app notifications)
- Unread count badge
- Filter by category (invoice, payment, project, quotation, general)
- Filter by read/unread status
- Mark as read functionality
- Mark all as read
- Delete notifications
- Notification actions (if available)

#### `app/(authenticated)/notifications/[id].tsx`
**Purpose:** Notification detail page

**Features:**
- Full notification message
- Category and type
- Timestamp
- Read status
- Associated resource link (if available)
- Action buttons (if available)
- Mark as read/delete

#### `app/(authenticated)/notifications/settings.tsx`
**Purpose:** Notification preferences

**Features:**
- Email notification preferences
- SMS notification preferences
- Push notification preferences
- In-app notification preferences
- Category-specific preferences
- Save preferences

---

### 18. Contact Message Management Pages

#### `app/(authenticated)/contact/index.tsx`
**Purpose:** Contact messages list

**Features:**
- Display all contact messages
- Filter by status (unread, read, replied, archived)
- Search by name, email, subject
- Sort by date
- Unread count indicator
- Quick actions (view, reply, archive, delete)

#### `app/(authenticated)/contact/[id].tsx`
**Purpose:** Contact message detail page

**Features:**
- Sender information (name, email, phone)
- Subject and message
- Status indicator
- Reply section (if not replied)
- Reply history
- Actions: Reply, Mark as Read, Archive, Delete

#### `app/(authenticated)/contact/[id]/reply.tsx`
**Purpose:** Reply to contact message

**Features:**
- Original message display
- Reply form (email reply)
- Reply message input
- Send reply
- Mark as replied

---

### 19. User Management Pages (Super Admin)

#### `app/(authenticated)/users/index.tsx`
**Purpose:** Admin user list page

**Features:**
- Display all admin users
- Filter by role (super_admin, finance, project_manager, staff)
- Filter by active status
- Search by name or email
- Quick actions (view, edit, activate/deactivate, delete)
- **Access:** Super admin only

#### `app/(authenticated)/users/[id].tsx`
**Purpose:** User detail page

**Features:**
- User profile information
- Role and permissions
- Active status
- Created date
- Actions: Edit Role, Update Status, Delete

#### `app/(authenticated)/users/create.tsx`
**Purpose:** Create admin user

**Features:**
- User registration form
- Role selection (finance, project_manager, staff)
- Email and password
- Profile information
- **Access:** Super admin only

#### `app/(authenticated)/users/[id]/edit.tsx`
**Purpose:** Edit user role and status

**Features:**
- Update user role
- Change active status
- Update profile information
- **Access:** Super admin only

---

### 20. Profile Management Pages

#### `app/(authenticated)/profile/index.tsx`
**Purpose:** View and edit own profile

**Features:**
- Display current user profile
- Edit profile information (firstName, lastName, phone, avatar)
- Update email
- Avatar upload
- Save changes

#### `app/(authenticated)/profile/change-password.tsx`
**Purpose:** Change password

**Features:**
- Current password input
- New password input
- Confirm password input
- Password strength indicator
- Form validation
- Update password

---

### 21. Settings Pages

#### `app/(authenticated)/settings/index.tsx`
**Purpose:** General settings

**Features:**
- App configuration
- System preferences
- Theme settings
- Navigation to other settings sections

#### `app/(authenticated)/settings/notifications.tsx`
**Purpose:** Notification preferences

**Features:**
- Email notification toggles
- SMS notification toggles
- Push notification toggles
- Category-specific preferences
- Save preferences

#### `app/(authenticated)/settings/account.tsx`
**Purpose:** Account settings

**Features:**
- Account information
- Security settings
- Privacy settings
- Delete account option

---

### 22. Public Auth Pages

#### `app/(public)/verify-otp.tsx`
**Purpose:** OTP verification screen

**Features:**
- OTP input field (6 digits)
- Timer countdown
- Resend OTP button
- Verify OTP
- Redirect to login on success

#### `app/(public)/forgot-password.tsx`
**Purpose:** Forgot password screen

**Features:**
- Email input
- Send reset link button
- Success message
- Link to login

#### `app/(public)/reset-password/[token].tsx`
**Purpose:** Reset password screen

**Features:**
- Token validation
- New password input
- Confirm password input
- Reset password button
- Redirect to login on success

---

## 🧩 Components

### 1. Themed Components

#### `ThemedText`
**Location:** `components/themed-text.tsx`

**Purpose:** Text component with automatic dark/light mode support

**Props:**
```typescript
type ThemedTextProps = {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  // ... TextProps
}
```

**Usage:**
```typescript
<ThemedText type="title">Welcome!</ThemedText>
<ThemedText type="subtitle">Dashboard</ThemedText>
```

---

#### `ThemedView`
**Location:** `components/themed-view.tsx`

**Purpose:** View component with automatic dark/light mode background

**Props:**
```typescript
type ThemedViewProps = {
  lightColor?: string;
  darkColor?: string;
  // ... ViewProps
}
```

**Usage:**
```typescript
<ThemedView style={styles.container}>
  <ThemedText>Content</ThemedText>
</ThemedView>
```

---

### 2. UI Components

#### `Collapsible`
**Location:** `components/ui/collapsible.tsx`

**Purpose:** Accordion/collapsible content component

**Props:**
```typescript
type Props = {
  title: string;
  children: ReactNode;
}
```

**Usage:**
```typescript
<Collapsible title="Feature Details">
  <ThemedText>Hidden content</ThemedText>
</Collapsible>
```

---

#### `IconSymbol`
**Location:** `components/ui/icon-symbol.tsx` (Android/Web)
**Location:** `components/ui/icon-symbol.ios.tsx` (iOS)

**Purpose:** Platform-optimized icon component

**Props:**
```typescript
type IconSymbolProps = {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp;
  weight?: 'regular' | 'bold' | ...;
}
```

**Usage:**
```typescript
<IconSymbol name="house.fill" size={28} color="#000" />
```

---

### 3. Layout Components

#### `ParallaxScrollView`
**Location:** `components/parallax-scroll-view.tsx`

**Purpose:** Scroll view with parallax header effect

**Props:**
```typescript
type Props = {
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  children: ReactNode;
}
```

**Features:**
- Parallax scrolling effect
- Animated header
- Theme-aware background
- Smooth animations using Reanimated

**Usage:**
```typescript
<ParallaxScrollView
  headerImage={<Image source={...} />}
  headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
>
  <ThemedText>Content</ThemedText>
</ParallaxScrollView>
```

---

### 4. Navigation Components

#### `ExternalLink`
**Location:** `components/external-link.tsx`

**Purpose:** External link with web browser integration

**Features:**
- Opens in external browser
- Web-safe navigation
- Customizable styling

---

#### `HapticTab`
**Location:** `components/haptic-tab.tsx`

**Purpose:** Tab button with haptic feedback

**Features:**
- Haptic feedback on press
- Native feel
- Customizable behavior

---

### 5. Animated Components

#### `HelloWave`
**Location:** `components/hello-wave.tsx`

**Purpose:** Animated waving hand emoji

**Features:**
- Smooth rotation animation
- Uses React Native Reanimated
- Playful UI element

---

## 🪝 Hooks

Shared data-fetching hooks powered by TanStack Query live in the `tanstack/` directory (see `doc/TANSTACK_QUERY_DOCUMENTATION.md`) and encapsulate caching, pagination, and mutations for each domain (clients, invoices, projects, etc.). Local UI and theming hooks remain under `hooks/`.

### 1. `useColorScheme`
**Location:** `hooks/use-color-scheme.ts` (Native)
**Location:** `hooks/use-color-scheme.web.ts` (Web)

**Purpose:** Get current color scheme (light/dark)

**Returns:**
```typescript
'light' | 'dark' | null
```

**Usage:**
```typescript
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';
```

---

### 2. `useThemeColor`
**Location:** `hooks/use-theme-color.ts`

**Purpose:** Get theme color based on current color scheme

**Parameters:**
```typescript
props: { light?: string; dark?: string }
colorName: keyof typeof Colors.light & keyof typeof Colors.dark
```

**Returns:**
```typescript
string // Color value
```

**Usage:**
```typescript
const textColor = useThemeColor({}, 'text');
const customColor = useThemeColor(
  { light: '#000', dark: '#fff' },
  'background'
);
```

---

## 📐 Constants

### Theme Constants
**Location:** `constants/theme.ts`

#### Brand Palette (UI Design System)
```typescript
// SIRE TECH Brand Colors - Neutralized Reds for Admin Readability
export const BrandColors = {
  // Primary Brand Colors
  primary: '#7b1c1c',      // Primary Red - Buttons, active icons, highlights
  accent: '#a33c3c',       // Accent Red - Hover states, alerts, emphasis
  soft: '#d86a6a',         // Soft Red - Secondary elements, info tags
  lightTint: '#faeaea',    // Light Tint - Card tints, backgrounds
  
  // Neutral Colors
  text: '#000000',         // Main readable text
  background: '#ffffff',   // Page background
  border: '#e5e5e5',       // Dividers, section separators
  
  // Semantic Colors
  error: '#a33c3c',        // Error states (matches accent)
  success: '#d86a6a',      // Success states (matches soft red)
  disabled: '#f0f0f0',     // Disabled states
  disabledText: '#999999', // Disabled text
};
```

#### Legacy Colors (for backward compatibility)
```typescript
const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: BrandColors.primary,  // Updated to use brand primary
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: BrandColors.primary,  // Updated to use brand primary
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};
```

#### Typography System
```typescript
export const Typography = {
  // Headings
  h1: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 28,  // 28-32px range
    color: BrandColors.text,
  },
  h2: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 24,  // 22-26px range
    color: BrandColors.text,
  },
  
  // Body Text
  body: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,  // 14-16px range
    color: '#111111',
  },
  
  // Caption/Labels
  caption: {
    fontFamily: 'Inter',
    fontWeight: '300',
    fontSize: 12,
    color: '#555555',
  },
};

// Platform-specific font fallbacks
export const Fonts = {
  poppins: Platform.select({
    ios: 'Poppins',
    android: 'Poppins',
    web: "'Poppins', system-ui, sans-serif",
  }),
  inter: Platform.select({
    ios: 'Inter',
    android: 'Inter',
    web: "'Inter', system-ui, sans-serif",
  }),
  // Legacy support
  sans: 'system-ui',
  serif: 'ui-serif',
  rounded: 'ui-rounded',
  mono: 'ui-monospace',
};
```

#### Spacing System
```typescript
// 4-Point Scale for consistent spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Tailwind spacing equivalents
// p-2 (8px) | p-4 (16px) | gap-6 (24px) | py-8 (32px)
```

**Usage Guidelines:**
- **Minimum padding:** 16px (`p-4`)
- **Section spacing:** 64px desktop, 32px mobile
- **Maintain vertical rhythm** using the 4-point scale

---

## 🛣️ Routing Structure

### File-Based Routing (Expo Router)

#### Route Hierarchy
```
app/
├── _layout.tsx              → Root layout
├── +html.tsx                → HTML shell for web
├── +not-found.tsx           → 404 Not Found page
├── index.tsx                → Root route (redirects based on auth)
├── (authenticated)/         → Authenticated routes group (protected)
│   ├── _layout.tsx          → Authenticated layout with auth guard
│   ├── index.tsx            → / (Dashboard overview)
│   ├── clients/             → Client management routes
│   └── ...                  → Other authenticated routes
└── (public)/                → Public routes group
    ├── _layout.tsx          → Public layout
    ├── login.tsx            → /login
    ├── register.tsx         → /register
    └── ...                  → Other public routes
```

#### Navigation Patterns

**Root Stack Navigation:**
```typescript
// app/_layout.tsx
<Stack>
  <Stack.Screen name="(public)" options={{ headerShown: false }} />
  <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
  <Stack.Screen name="+not-found" />
</Stack>
```

**Authenticated Layout:**
```typescript
// app/(authenticated)/_layout.tsx
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="clients" />
  {/* Other authenticated screens */}
</Stack>
```

**Public Layout:**
```typescript
// app/(public)/_layout.tsx
<Stack>
  <Stack.Screen name="login" options={{ headerShown: false }} />
  <Stack.Screen name="register" options={{ headerShown: false }} />
  {/* Other public screens */}
</Stack>
```

**Authentication Guard Example:**
```typescript
// app/(authenticated)/_layout.tsx
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'expo-router';

export default function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(public)/login" />;
  }

  return <Stack>{/* Authenticated routes */}</Stack>;
}
```

**Programmatic Navigation:**
```typescript
import { Link, useRouter } from 'expo-router';

// Using Link component
<Link href="/modal">Open Modal</Link>

// Using router hook
const router = useRouter();
router.push('/modal');
```

**Route Examples:**
Based on backend API structure, all implemented routes:

**Public Routes:**
- `/(public)/login` - Login screen
- `/(public)/register` - Admin registration screen
- `/(public)/verify-otp` - OTP verification screen
- `/(public)/forgot-password` - Forgot password screen
- `/(public)/reset-password/[token]` - Reset password screen (dynamic token route)

**Authenticated Routes - Main Pages:**
- `/(authenticated)/index` - Authenticated landing/dashboard view

**Authenticated Routes - Client Management:**
- `/(authenticated)/clients` - Client list page
- `/(authenticated)/clients/create` - Create new client
- `/(authenticated)/clients/[id]` - Client detail page
- `/(authenticated)/clients/[id]/edit` - Edit client
- `/(authenticated)/clients/[id]/projects` - Client's projects
- `/(authenticated)/clients/[id]/invoices` - Client's invoices
- `/(authenticated)/clients/[id]/payments` - Client's payments
- `/(authenticated)/clients/[id]/stats` - Client statistics

**Authenticated Routes - Service Management:**
- `/(authenticated)/services` - Service list page
- `/(authenticated)/services/create` - Create new service
- `/(authenticated)/services/[id]` - Service detail page
- `/(authenticated)/services/[id]/edit` - Edit service

**Authenticated Routes - Quotation Management:**
- `/(authenticated)/quotations` - Quotation list page
- `/(authenticated)/quotations/create` - Create new quotation
- `/(authenticated)/quotations/[id]` - Quotation detail page
- `/(authenticated)/quotations/[id]/edit` - Edit quotation
- `/(authenticated)/quotations/[id]/convert` - Convert quotation to invoice

**Authenticated Routes - Invoice Management:**
- `/(authenticated)/invoices` - Invoice list page
- `/(authenticated)/invoices/create` - Create new invoice
- `/(authenticated)/invoices/[id]` - Invoice detail page
- `/(authenticated)/invoices/[id]/edit` - Edit invoice

**Authenticated Routes - Payment Management:**
- `/(authenticated)/payments` - Payment list page
- `/(authenticated)/payments/create` - Record payment manually (admin)
- `/(authenticated)/payments/initiate` - Initiate payment (M-Pesa/Paystack)
- `/(authenticated)/payments/[id]` - Payment detail page

**Authenticated Routes - Project Management:**
- `/(authenticated)/projects` - Project list page
- `/(authenticated)/projects/create` - Create new project
- `/(authenticated)/projects/[id]` - Project detail page
- `/(authenticated)/projects/[id]/edit` - Edit project
- `/(authenticated)/projects/[id]/milestones` - Manage project milestones
- `/(authenticated)/projects/[id]/attachments` - Manage project attachments

**Authenticated Routes - Testimonial Management:**
- `/(authenticated)/testimonials` - Testimonial list page
- `/(authenticated)/testimonials/[id]` - Testimonial detail page
- `/(authenticated)/testimonials/[id]/approve` - Approve and publish testimonial

**Authenticated Routes - Notification Management:**
- `/(authenticated)/notifications` - Notification center
- `/(authenticated)/notifications/[id]` - Notification detail page
- `/(authenticated)/notifications/settings` - Notification preferences

**Authenticated Routes - Contact Management:**
- `/(authenticated)/contact` - Contact messages list
- `/(authenticated)/contact/[id]` - Contact message detail page
- `/(authenticated)/contact/[id]/reply` - Reply to contact message

**Authenticated Routes - User Management (Super Admin Only):**
- `/(authenticated)/users` - Admin user list page
- `/(authenticated)/users/create` - Create admin user
- `/(authenticated)/users/[id]` - User detail page
- `/(authenticated)/users/[id]/edit` - Edit user role and status

**Authenticated Routes - Profile Management:**
- `/(authenticated)/profile` - View and edit own profile
- `/(authenticated)/profile/change-password` - Change password

**Authenticated Routes - Settings:**
- `/(authenticated)/settings` - General settings
- `/(authenticated)/settings/notifications` - Notification preferences
- `/(authenticated)/settings/account` - Account settings

**Special Routes:**
- `/` - Root route (redirects based on auth status)
- `+not-found` - 404 error page

---

## 🎨 Styling Approach

### 1. NativeWind (Tailwind CSS)

**Configuration:**
- File: `tailwind.config.js`
- Content paths: `./app/**/*.{js,jsx,ts,tsx}`, `./components/**/*.{js,jsx,ts,tsx}`
- Brand colors configured (see [UI Design System](#ui-design-system))

**Tailwind Configuration with Brand Colors:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7b1c1c',
          accent: '#a33c3c',
          soft: '#d86a6a',
          tint: '#faeaea',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // 4-point scale already included via Tailwind defaults
      },
    },
  },
  presets: [require("nativewind/preset")],
};
```

**Usage with Brand Colors:**
```typescript
<Text className="text-brand-primary text-2xl font-poppins font-bold">Hello</Text>
<View className="flex-1 bg-white">
  {/* Content */}
</View>
```

**Features:**
- Utility-first CSS
- Brand color system integration
- Responsive design
- Platform-specific styles
- 4-point spacing scale

---

### 2. StyleSheet

**Usage:**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

**Note:** Use StyleSheet for complex animations or when Tailwind utilities are insufficient.

---

### 3. Themed Components

**Approach:**
- Automatic color adaptation
- Dark/light mode support
- Consistent theming across app
- Brand color integration

**Implementation:**
```typescript
// Uses useThemeColor hook with brand colors
const color = useThemeColor({}, 'text');
const primaryColor = BrandColors.primary;
```

---

### 4. Global Styles

**File:** `global.css`

**Content:**
```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";
```

---

### Design System Integration

All styling should follow the **SIRE TECH Admin UI Design System** (see [UI Design System](#ui-design-system) section below). This system provides standardized:
- Color palette with neutralized reds
- Typography scale (Poppins for headings, Inter for body)
- Spacing system (4-point scale)
- Component patterns (Buttons, Forms, Cards, Tables)

---

## 🎨 UI Design System

### Overview

The **SIRE TECH ADMIN UI DESIGN SYSTEM** provides a unified, scalable design language for building consistent admin interfaces across web and mobile platforms. This system ensures visual consistency, readability, and maintainability while maintaining the SIRE TECH brand identity through neutralized red accents.

**Design Philosophy:**
- **Corporate • Minimal • Efficient • Redefined**
- Use reds sparingly for clarity and focus
- Prioritize readability and accessibility
- Maintain consistent spacing and typography hierarchy

**Tech Stack:**
- React Native + Expo
- Tailwind CSS (NativeWind)
- Redux Toolkit + Redux Persist (global state)
- TanStack Query (server state)
- React Navigation + Expo Router

---

### Brand Palette

The SIRE TECH admin interface uses a carefully curated palette of neutralized reds designed for long-term readability in admin contexts.

#### Color System

| Role | Hex Value | Usage Context | Tailwind Class |
|------|-----------|---------------|----------------|
| **Primary Red** | `#7b1c1c` | Primary buttons, active icons, key highlights | `bg-brand-primary`, `text-brand-primary` |
| **Accent Red** | `#a33c3c` | Hover states, alerts, emphasis elements | `bg-brand-accent`, `text-brand-accent` |
| **Soft Red** | `#d86a6a` | Secondary elements, info tags, success states | `bg-brand-soft`, `text-brand-soft` |
| **Light Tint** | `#faeaea` | Card backgrounds, subtle highlights | `bg-brand-tint` |
| **Text** | `#000000` | Primary readable text | `text-black` |
| **Background** | `#ffffff` | Page backgrounds, card surfaces | `bg-white` |
| **Border/Lines** | `#e5e5e5` | Dividers, section separators, inputs | `border-gray-300` |

**Color Usage Guidelines:**
- Use red colors strategically to guide attention
- Maintain neutral backgrounds for content readability
- Ensure contrast ratios meet WCAG AA standards (≥4.5:1)
- Avoid overuse of reds - let them provide focus, not distraction

---

### Typography System

Consistent typography creates visual hierarchy and improves readability.

#### Type Scale

| Type | Font Family | Weight | Size Range | Use Case | Tailwind Example |
|------|-------------|--------|------------|----------|------------------|
| **H1** | Poppins | 700 (Bold) | 28-32px | Page titles, hero headings | `font-poppins font-bold text-3xl` |
| **H2** | Poppins | 600 (SemiBold) | 22-26px | Section headers, card titles | `font-poppins font-semibold text-2xl` |
| **H3** | Poppins | 600 | 18-20px | Subsection headers | `font-poppins font-semibold text-xl` |
| **Body** | Inter | 400 (Regular) | 14-16px | General text, descriptions | `font-inter text-base` |
| **Small** | Inter | 400 | 12-14px | Secondary text, captions | `font-inter text-sm` |
| **Caption** | Inter | 300 (Light) | 12px | Labels, helper text | `font-inter font-light text-xs` |

**Implementation:**
```typescript
// Typography usage with NativeWind
<Text className="font-poppins font-bold text-3xl text-black">
  Dashboard
</Text>
<Text className="font-inter text-base text-gray-900">
  Welcome to the admin panel
</Text>
```

**Accessibility:**
- Maintain contrast ratio ≥4.5:1 for body text
- Use appropriate font sizes (minimum 14px for body text)
- Ensure sufficient line height (1.5-1.6x font size)

---

### Spacing & Grid System

Consistent spacing creates visual rhythm and improves content scannability.

#### 4-Point Spacing Scale

```
4px  → xs  (p-1)   - Tight spacing, icons
8px  → sm  (p-2)   - Compact elements
12px → md  (p-3)   - Small gaps
16px → base (p-4)  - Standard padding (minimum)
24px → lg  (p-6)   - Section spacing
32px → xl  (p-8)   - Large gaps
48px → 2xl (p-12)  - Major sections
64px → 3xl (p-16)  - Page-level spacing (max on desktop)
```

**Usage Guidelines:**
- **Minimum padding:** 16px (`p-4`) for interactive elements
- **Section spacing:** 64px desktop, 32px mobile
- **Card padding:** 24px (`p-6`) standard
- **Maintain vertical rhythm** using the 4-point scale

**Responsive Spacing:**
```typescript
// Mobile-first responsive spacing
<View className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</View>
```

---

### Buttons & Actions

Buttons are primary interactive elements that guide user actions.

#### Button Variants

| Type | Background | Text Color | Border | Usage | Tailwind Class |
|------|-----------|------------|--------|-------|----------------|
| **Primary** | `#7b1c1c` | White | None | Main actions (Save, Submit) | `bg-brand-primary text-white` |
| **Secondary** | White | `#7b1c1c` | 1px `#7b1c1c` | Support actions (Cancel, Back) | `bg-white text-brand-primary border border-brand-primary` |
| **Danger** | `#a33c3c` | White | None | Destructive actions (Delete) | `bg-brand-accent text-white` |
| **Ghost** | Transparent | `#7b1c1c` | None | Tertiary actions | `bg-transparent text-brand-primary` |
| **Disabled** | `#f0f0f0` | `#999999` | None | Inactive states | `bg-gray-200 text-gray-500` |

**Button Implementation:**
```typescript
// Primary Button
<TouchableOpacity className="bg-brand-primary text-white rounded-xl px-4 py-2 hover:bg-brand-accent">
  <Text className="text-white font-inter font-semibold text-base">Save</Text>
</TouchableOpacity>

// Secondary Button
<TouchableOpacity className="bg-white border border-brand-primary rounded-xl px-4 py-2">
  <Text className="text-brand-primary font-inter font-semibold text-base">Cancel</Text>
</TouchableOpacity>
```

**Button Specifications:**
- **Height:** Minimum 48px for touch targets
- **Border Radius:** `rounded-xl` (12px) standard
- **Padding:** `px-4 py-2` (16px horizontal, 8px vertical)
- **Hover State:** Slightly darker background (`bg-brand-accent` for primary)
- **Avoid shadows** - prefer subtle hover elevation

---

### Forms & Inputs

Form inputs provide consistent data entry experiences.

#### Input Specifications

| Property | Value | Usage |
|----------|-------|-------|
| **Background** | White (`#ffffff`) | Input field background |
| **Border** | `#e5e5e5` (1px solid) | Default border |
| **Focus Border** | `#7b1c1c` (2px solid) | Active/focused state |
| **Label** | `#333333` | Input labels |
| **Placeholder** | `#999999` | Placeholder text |
| **Error Border** | `#a33c3c` | Error state |
| **Error Text** | `#a33c3c` | Error messages |
| **Border Radius** | `rounded-lg` (8px) | Input corners |

**Input Implementation:**
```typescript
<View className="mb-4">
  <Text className="text-gray-700 font-inter text-sm mb-2">Email Address</Text>
  <TextInput
    className="border border-gray-300 focus:border-brand-primary rounded-lg px-3 py-2 text-black bg-white"
    placeholder="Enter your email"
    placeholderTextColor="#999999"
  />
  {error && (
    <Text className="text-brand-accent text-sm mt-1">{error}</Text>
  )}
</View>
```

**Form Layout:**
- Use vertical layout with consistent spacing (`mb-4` between fields)
- Labels above inputs (not inline)
- Group related fields together
- Show validation errors below inputs

---

### Cards & Containers

Cards organize content into digestible sections.

#### Card Specifications

| Property | Value | Usage |
|----------|-------|-------|
| **Background** | White (`#ffffff`) | Card surface |
| **Border** | `#e5e5e5` (1px solid) | Optional border |
| **Padding** | `p-6` (24px) | Standard padding |
| **Border Radius** | `rounded-2xl` (16px) | Rounded corners |
| **Shadow** | `shadow-sm` | Subtle elevation |
| **Title** | Poppins 600, `#000000` | Card header |
| **Accent Strip** | 4px top border `#7b1c1c` | Optional brand accent |

**Card Implementation:**
```typescript
<View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
  {/* Optional accent strip */}
  <View className="h-1 bg-brand-primary rounded-t-2xl -mt-6 -mx-6 mb-4" />
  
  <Text className="font-poppins font-semibold text-2xl text-black mb-4">
    Project Summary
  </Text>
  {/* Card content */}
</View>
```

**Card Usage:**
- Dashboard widgets
- Project summaries
- Analytics displays
- Content containers

---

### Tables & Lists

Tables present structured data efficiently.

#### Table Specifications

| Element | Style | Usage |
|---------|-------|-------|
| **Header Background** | `#faeaea` | Table header row |
| **Header Text** | Poppins 600, `#7b1c1c` | Column headers |
| **Row Background** | White (hover: `#fff5f5`) | Data rows |
| **Row Divider** | `#e5e5e5` (1px) | Row separator |
| **Body Text** | Inter 14px, `#000000` | Cell content |
| **Alignment** | Left (text), Right (numbers) | Content alignment |

**Table Implementation:**
```typescript
<View className="border border-gray-300 rounded-lg overflow-hidden">
  {/* Header */}
  <View className="bg-brand-tint flex-row border-b border-gray-300">
    <Text className="flex-1 p-4 font-poppins font-semibold text-brand-primary">
      Name
    </Text>
    <Text className="flex-1 p-4 font-poppins font-semibold text-brand-primary text-right">
      Amount
    </Text>
  </View>
  
  {/* Rows */}
  <View className="flex-row border-b border-gray-300 hover:bg-red-50">
    <Text className="flex-1 p-4 font-inter text-base">Project A</Text>
    <Text className="flex-1 p-4 font-inter text-base text-right">$1,200</Text>
  </View>
</View>
```

**Table Best Practices:**
- Align currency and numbers right
- Align dates consistently
- Use hover states for row highlighting
- Include sorting indicators in headers
- Responsive: stack on mobile

---

### Notifications & Alerts

Notifications provide user feedback for actions and system events.

#### Alert Types

| Type | Background | Text | Icon | Usage | Tailwind Class |
|------|-----------|------|------|-------|----------------|
| **Success** | `#d86a6a` (soft red) | White | ✓ | Positive feedback, confirmations | `bg-brand-soft text-white` |
| **Error** | `#a33c3c` (accent red) | White | ⚠️ | Errors, warnings | `bg-brand-accent text-white` |
| **Info** | `#faeaea` (light tint) | Black | ℹ️ | Informational messages | `bg-brand-tint text-black` |

**Alert Implementation:**
```typescript
<View className="bg-brand-soft rounded-lg p-4 flex-row items-center">
  <Text className="text-white mr-2">✓</Text>
  <Text className="text-white font-inter text-base flex-1">
    Changes saved successfully
  </Text>
</View>
```

---

### Reusable Patterns

Common UI patterns that appear throughout the admin interface.

#### Page Template Structure

```
┌─────────────────────────────────────┐
│ Header (Title + Actions)            │
├─────────────────────────────────────┤
│ Filters/Search Bar                  │
├─────────────────────────────────────┤
│ Content Area                        │
│  ┌─────────┐ ┌─────────┐          │
│  │  Card   │ │  Card   │          │
│  └─────────┘ └─────────┘          │
│  ┌───────────────────────┐         │
│  │      Table/List       │         │
│  └───────────────────────┘         │
├─────────────────────────────────────┤
│ Pagination                          │
└─────────────────────────────────────┘
```

**Page Template Implementation:**
```typescript
<View className="flex-1 bg-white p-6">
  {/* Header */}
  <View className="flex-row justify-between items-center mb-6">
    <Text className="font-poppins font-bold text-3xl">Clients</Text>
    <Button variant="primary">Add New</Button>
  </View>
  
  {/* Filters */}
  <View className="mb-6">
    <SearchInput placeholder="Search clients..." />
  </View>
  
  {/* Content */}
  <Card>
    <Table data={clients} />
  </Card>
  
  {/* Pagination */}
  <Pagination />
</View>
```

#### Modal Pattern

```typescript
<Modal visible={visible} transparent>
  <View className="flex-1 bg-black/50 justify-center items-center p-6">
    <View className="bg-white rounded-2xl p-6 w-full max-w-md">
      {/* Accent strip */}
      <View className="h-1 bg-brand-primary rounded-t-2xl -mt-6 -mx-6 mb-4" />
      
      {/* Title */}
      <Text className="font-poppins font-semibold text-2xl text-brand-primary mb-4">
        Confirm Action
      </Text>
      
      {/* Content */}
      <Text className="font-inter text-base mb-6">
        Are you sure you want to delete this item?
      </Text>
      
      {/* Actions (right-aligned) */}
      <View className="flex-row justify-end gap-3">
        <Button variant="secondary">Cancel</Button>
        <Button variant="danger">Delete</Button>
      </View>
    </View>
  </View>
</Modal>
```

#### Empty State Pattern

```typescript
<View className="flex-1 justify-center items-center p-8">
  <Icon name="folder-open" size={64} color="#d86a6a" />
  <Text className="font-poppins font-semibold text-xl text-black mt-4 mb-2">
    No records yet
  </Text>
  <Text className="font-inter text-base text-gray-600 text-center mb-6">
    Get started by adding your first client
  </Text>
  <Button variant="primary">Add New Client</Button>
</View>
```

---

### Responsive Behavior

The design system adapts to different screen sizes for optimal viewing.

#### Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets, large phones |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape), small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

**Responsive Utilities:**
```typescript
// Mobile-first responsive classes
<View className="flex-col md:flex-row">
  <View className="w-full md:w-1/2 p-4 md:p-6">
    {/* Content */}
  </View>
</View>

// Responsive spacing
<View className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</View>
```

**Responsive Guidelines:**
- Flex layouts collapse to vertical on mobile
- Maintain consistent padding (adjust for screen size)
- Avoid edge clipping on small screens
- Stack table columns on mobile
- Use appropriate font sizes for readability

---

### Accessibility

Ensuring the interface is usable by everyone.

#### Accessibility Requirements

1. **Contrast Ratios**
   - Minimum 4.5:1 for normal text
   - Minimum 3:1 for large text (18px+)
   - Test with color contrast analyzers

2. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Visible focus indicators

3. **Touch Targets**
   - Minimum 48px height for buttons/interactive elements
   - Adequate spacing between touch targets

4. **Screen Readers**
   - Semantic HTML/RN components
   - Descriptive labels for inputs
   - Alt text for images
   - ARIA labels where needed

5. **Color Indicators**
   - Don't rely solely on color
   - Use icons and text labels
   - Provide alternative indicators

**Implementation Example:**
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Save changes"
  accessibilityRole="button"
  className="bg-brand-primary rounded-xl px-4 py-3 min-h-[48px]"
>
  <Text className="text-white font-inter font-semibold text-base">
    Save
  </Text>
</TouchableOpacity>
```

---

### Component Directory Structure

Organized component library following the design system.

```
components/
├── ui/                      # Base UI components
│   ├── Button.tsx          # Button variants
│   ├── Input.tsx           # Form inputs
│   ├── Card.tsx            # Card container
│   ├── Modal.tsx           # Modal dialogs
│   ├── Alert.tsx           # Notifications/alerts
│   └── Badge.tsx           # Status badges
│
├── layout/                  # Layout components
│   ├── Navbar.tsx          # Top navigation
│   ├── Sidebar.tsx         # Side navigation
│   ├── Footer.tsx          # Page footer
│   └── Container.tsx       # Page container
│
├── forms/                   # Form components
│   ├── FormInput.tsx       # Form input with label
│   ├── Select.tsx          # Dropdown select
│   ├── DatePicker.tsx      # Date selection
│   └── Checkbox.tsx        # Checkbox input
│
├── tables/                  # Table components
│   ├── Table.tsx           # Data table
│   ├── TableHeader.tsx     # Table header
│   ├── TableRow.tsx        # Table row
│   └── Pagination.tsx      # Pagination controls
│
└── screens/                 # Screen-specific components
    └── admin/
        ├── Dashboard.tsx   # Dashboard layout
        ├── ClientList.tsx  # Client listing
        ├── ProjectCard.tsx # Project card
        └── InvoiceTable.tsx # Invoice table
```

---

### Design System Implementation Checklist

When building new components or pages, ensure:

- [ ] Colors follow brand palette (use Tailwind classes: `bg-brand-primary`, etc.)
- [ ] Typography uses Poppins for headings, Inter for body
- [ ] Spacing follows 4-point scale (`p-4`, `p-6`, `gap-6`, etc.)
- [ ] Buttons meet minimum 48px height requirement
- [ ] Forms have proper labels and error states
- [ ] Cards include optional accent strip
- [ ] Tables use brand-tint header background
- [ ] Alerts follow color system (success, error, info)
- [ ] Responsive breakpoints are considered
- [ ] Accessibility requirements are met
- [ ] Component is placed in correct directory structure

---

### Closing Summary

The **SIRE TECH Admin UI Design System** blends clarity, scalability, and consistency. Muted reds provide brand identity without distraction, Tailwind enforces visual structure, and reusable components ensure long-term maintainability.

This design system standardizes all future UI development across web and mobile platforms, ensuring a cohesive admin experience that prioritizes readability and efficiency.

**Key Principles:**
- **Corporate:** Professional, business-focused aesthetic
- **Minimal:** Clean, uncluttered interfaces
- **Efficient:** Optimized for productivity and task completion
- **Redefined:** Modern approach to admin interfaces with strategic color use

---

## 🔄 State Management

### Current Approach

**Redux Toolkit (Global State):**
- `redux/index.ts` configures the store with `auth` slice and Redux DevTools support
- `redux-persist` stores auth data in AsyncStorage for session continuity
- Serializability checks configured to work with persistence actions

**Auth Context (`AuthProvider`):**
- Wraps the app to coordinate authentication flows with Redux state
- Exposes helpers for login, logout, registration, OTP verification, profile updates, and password changes
- Handles background token refresh and loading states for guarded navigation

**TanStack Query (Server State):**
- `app/_layout.tsx` provides a shared `QueryClient`
- Defaults: 5‑minute `staleTime`, 10‑minute cache (`gcTime`), single retry, opt-out of window refetch
- Query/mutation hooks live under `tanstack/` (e.g., `useClients`, `useProjects`) and encapsulate request/response typing, pagination, and optimistic mutations

**Local State:**
- Standard React state (`useState`, `useReducer`) for view-only concerns and ephemeral UI state

**Navigation State:**
- Managed by Expo Router with Stack layouts and route groups

**Theme State:**
- `useColorScheme` hook powers light/dark mode toggling across NativeWind classes and themed components

### Best Practices
- Keep slice logic focused on serializable data; persist only what is required (currently `auth`)
- Co-locate TanStack Query hooks with their domain APIs to encourage reuse
- Prefer TanStack Query mutations over manual axios calls to maintain cache coherence
- Use the Auth context for workflow orchestration instead of duplicating logic inside screens

---

## 🔌 API Integration

### Recommended Setup

**API Client:**
```typescript
// api/config.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        await AsyncStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export { api, API_BASE_URL };
```

**Usage:**
```typescript
import { authAPI, clientAPI } from '@/api';

// POST request (login)
const loginResponse = await authAPI.login({ email, password });

// GET request (clients list)
const clientsResponse = await clientAPI.getAllClients({ page: 1, limit: 20 });
```

**Environment Variables:**
```env
# .env
EXPO_PUBLIC_API_URL=https://api.siretech.com
EXPO_PUBLIC_APP_ENV=production
```

**Domain Modules:**
- `api/index.ts` centralises resource-specific helpers (`authAPI`, `clientAPI`, `projectAPI`, etc.), each returning the raw axios response so TanStack Query hooks can decide how to handle data and caching.
- Tokens are persisted under `accessToken` and `refreshToken` keys in AsyncStorage; refresh logic updates only the access token to keep silent renewals lightweight.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Expo CLI (optional, included in project)

### Installation

1. **Navigate to project directory:**
```bash
cd Sire-Admin
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
# or
npx expo start
```

### Platform-Specific Commands

**iOS:**
```bash
npm run ios
# or
npx expo start --ios
```

**Android:**
```bash
npm run android
# or
npx expo start --android
```

**Web:**
```bash
npm run web
# or
npx expo start --web
```

### Development Workflow

1. **Start Metro bundler:**
```bash
npm start
```

2. **Choose platform:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app

3. **Hot Reload:**
   - Changes automatically reload
   - Fast Refresh enabled

### Build Commands

**Development Build:**
```bash
npx expo prebuild
npm run ios
npm run android
```

**Production Build:**
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build --platform all
```

---

## 📝 Code Style & Best Practices

### TypeScript

**Strict Mode:** Enabled in `tsconfig.json`

**Path Aliases:**
```typescript
import { ThemedText } from '@/components/themed-text';
```

### Component Patterns

**Functional Components:**
```typescript
export default function HomeScreen() {
  return (
    <ThemedView>
      <ThemedText>Welcome</ThemedText>
    </ThemedView>
  );
}
```

**Type Definitions:**
```typescript
type Props = {
  title: string;
  onPress: () => void;
};

export function Button({ title, onPress }: Props) {
  // Component code
}
```

### Naming Conventions

- **Components:** PascalCase (`ThemedText`, `HomeScreen`)
- **Files:** camelCase for components (`themed-text.tsx`)
- **Hooks:** camelCase with `use` prefix (`useColorScheme`)
- **Constants:** UPPER_SNAKE_CASE for constants (`MAX_COUNT`)
- **Types:** PascalCase (`ThemedTextProps`)

---

## 🔒 Security Considerations

### Authentication

**Token Storage:**
```typescript
import * as SecureStore from 'expo-secure-store';

// Store token
await SecureStore.setItemAsync('token', token);

// Retrieve token
const token = await SecureStore.getItemAsync('token');
```

**API Security:**
- HTTPS only in production
- Token refresh mechanism
- Secure storage for sensitive data

---

## 📱 Platform-Specific Considerations

### iOS

**Features:**
- SF Symbols support (`IconSymbol` component)
- Native haptic feedback
- System font rendering
- Safe area insets

**Configuration:**
- `app.json` → `ios` section
- Info.plist customization
- App Store requirements

### Android

**Features:**
- Material Icons support
- Edge-to-edge display
- Predictive back gesture
- Adaptive icons

**Configuration:**
- `app.json` → `android` section
- Gradle configuration
- Play Store requirements

### Web

**Features:**
- Responsive design
- Browser navigation
- SEO considerations
- Static export support

**Configuration:**
- `app.json` → `web` section
- Static site generation
- Browser compatibility

---

## 🧪 Testing

### Recommended Testing Setup

**Unit Tests:**
```bash
npm install --save-dev jest @testing-library/react-native
```

**Component Tests:**
```typescript
import { render } from '@testing-library/react-native';
import { ThemedText } from '@/components/themed-text';

test('renders correctly', () => {
  const { getByText } = render(<ThemedText>Test</ThemedText>);
  expect(getByText('Test')).toBeTruthy();
});
```

**E2E Tests:**
```bash
npm install --save-dev detox
```

---

## 📚 Additional Resources

### Documentation Links

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Backend Integration

See backend documentation at:
- `../SIRE SERVER/SIRE-API/doc/BACKEND_DOCUMENTATION.md`

---

## 🔄 Version Information

**Current Version:** 1.0.0

**React Native:** 0.81.5
**Expo SDK:** 54.0.22
**TypeScript:** 5.9.2

---

## 📞 Support & Contribution

### Project Structure Guidelines

1. **New Features:**
   - Create feature branch
   - Follow existing code patterns
   - Add TypeScript types
   - Update documentation

2. **Components:**
   - Place in `components/` directory
   - Use themed components when possible
   - Add TypeScript props interface
   - Include usage examples

3. **Pages/Screens:**
   - Use file-based routing
   - Follow naming conventions
   - Implement proper navigation
   - Handle loading/error states

---

**Last Updated:** January 2025
**Version:** 1.0.0
