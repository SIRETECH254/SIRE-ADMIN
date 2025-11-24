## Roles Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Roles List UI](#roles-list-ui)
- [Details UI](#details-ui)
- [Edit Role UI](#edit-role-ui)
- [Create Role UI](#create-role-ui)
- [Filters, Search & Pagination](#filters-search--pagination)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Role Assignment](#role-assignment)
- [Future Enhancements](#future-enhancements)

### Imports
The Roles screens reuse shared layout, themed helpers, table components and TanStack Query hooks:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Pagination from '@/components/table/Pagination';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDate, getInitials } from '@/utils';
import {
  useGetAllRoles,
  useGetRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useGetUsersByRole,
} from '@/tanstack/useRoles';
```

### Data Sources
- Primary API (see server docs):
  - `GET /api/roles` (list with pagination, filters, search)
  - `GET /api/roles/:roleId` (details)
  - `POST /api/roles` (create - super admin only)
  - `PUT /api/roles/:roleId` (update: displayName, description, permissions, isActive - super admin only)
  - `DELETE /api/roles/:roleId` (delete - super admin only)
  - `GET /api/roles/:roleId/users` (get users with this role)
- TanStack Query hooks:
  - `useGetAllRoles(params)` for list
  - `useGetRole(roleId)` for details
  - `useCreateRole()` for create (super admin)
  - `useUpdateRole()` for edit (super admin)
  - `useDeleteRole()` for delete (super admin)
  - `useGetUsersByRole(roleId, params)` for listing users with a role

### Hooks & State
- List screen:
  - Local: `searchTerm`, `debouncedSearch`, `filterStatus`, `currentPage`, `itemsPerPage`, `confirmDelete`
  - Derived: `params` memo with `search`, `status`, `page`, `limit`
  - Query: `useGetAllRoles(params)` providing `{ data, isLoading }`
- Details screen:
  - Param: `id` from route
  - Query: `useGetRole(roleId)` for role details, `useGetUsersByRole(roleId)` for users list
  - Mutations: `useDeleteRole()` (if needed in future)
  - Local: `confirmDelete`, `deleteError`
- Edit screen:
  - Param: `id`
  - Query: `useGetRole(roleId)` for initial values
  - Mutations: `useUpdateRole()`
  - Local: `name`, `displayName`, `description`, `isActive`, `inlineStatus`
  - Note: Role `name` cannot be changed after creation (read-only field)
- Create screen:
  - Mutations: `useCreateRole()`
  - Local: `name`, `displayName`, `description`, `isActive`, `inlineStatus`
  - Role name is automatically converted to lowercase with underscores

### Roles List UI
- RN-compatible table using `react-native-paper` DataTable:
  - Header columns: Role, Display Name, Description, Status, Users, Created, Actions
  - Rows render role name, display name, truncated description, status badge, user count, created date
  - Actions: View, Edit, Delete
- A top toolbar includes:
  - Search input with debounce (300ms) for name/displayName/description
  - Status filter dropdown (all, active, inactive)
  - Rows per page selector (10, 20, 50)
  - "Add Role" primary action (super admin only)
- Pagination:
  - Prev/Next with page window text
  - Shown only when total pages > 1

### Details UI
- Role header: Display Name and status badge
- Icon display: MaterialIcon for role (admin-panel-settings)
- Role Information section:
  - Name (role identifier, lowercase with underscores)
  - Display Name (human-readable name)
  - Description
  - Created/Updated dates
- Permissions section (if permissions array exists):
  - List of permissions with check icons
- Users with this Role section:
  - List of users assigned this role
  - User cards showing avatar, name, email
  - Clickable to navigate to user detail page
  - Shows total count in header
- Action buttons: Edit, Delete
- Edit button navigates to `/(authenticated)/roles/[id]/edit`

### Edit Role UI
- Title: "Edit Role"
- Form fields:
  - `name` (read-only, TextInput disabled) - Role name cannot be changed
  - `displayName` (required, TextInput)
  - `description` (optional, multiline TextInput)
  - `isActive` (Switch component for status)
- Save:
  - `useUpdateRole()` with roleId and roleData
  - Inline success message then navigate back
- Note: Permissions management may be handled separately or in future updates

### Create Role UI
- Title: "Create Role"
- Form fields:
  - `name` (required, TextInput) - Automatically converted to lowercase with underscores
  - `displayName` (required, TextInput)
  - `description` (optional, multiline TextInput)
  - `isActive` (Switch component, default: true)
- Save:
  - `useCreateRole()` with roleData
  - Inline success message then navigate to role detail page
- Role name validation: Should follow naming convention (lowercase, underscores)

### Filters, Search & Pagination
- Search:
  - Debounced input (300ms) for role name, display name, description
  - Cleared when search input is cleared
  - Resets page to 1 on search
- Filters:
  - Status filter: all, active, inactive
  - Clear filters button when any filter is active
- Pagination:
  - Page size options: 10, 20, 50
  - Page navigation: Previous/Next buttons
  - Shows current page, total pages, total items
  - Hidden when only one page exists

### Mutation & Cache Behaviour
- Create/Update/Delete mutations:
  - Invalidate `['roles']` query on success
  - Invalidate `['role', roleId]` on single role updates
  - Invalidate `['users']` queries if role assignment affects user lists
- Optimistic updates: Not implemented (consider for future)
- Error handling:
  - Display inline error messages
  - Log errors to console
  - Retry logic handled by TanStack Query retry config

### Navigation Flow
- List → Details: `/(authenticated)/roles/[id]`
- List → Create: `/(authenticated)/roles/create`
- Details → Edit: `/(authenticated)/roles/[id]/edit`
- Edit → Details: Back navigation
- Create → Details: Navigate to created role detail page
- Details → User Detail: `/(authenticated)/users/[userId]` (from users list in role detail)

### Error & Loading States
- Loading states:
  - Full-screen loading component for initial load
  - Skeleton rows in table during refetch
  - Activity indicators on action buttons during mutations
- Error states:
  - Inline error alerts for mutations
  - Error message row in table if list query fails
  - Retry button on error state
- Empty states:
  - "No roles found" message in table
  - "Add Role" button when empty

### Role Assignment
Role assignment to users is handled through the user management screens:
- **User Edit Screen** (`app/(authenticated)/users/[id]/edit.tsx`):
  - Currently uses single role picker (backward compatibility)
  - Future: Multi-select for role assignment
- **User Detail Screen** (`app/(authenticated)/users/[id]/index.tsx`):
  - Displays all roles assigned to the user
  - Shows roles as comma-separated list or badges
- **Role Assignment APIs**:
  - `POST /api/users/:userId/roles` - Assign role to user
    - Hook: `useAssignRole()` from `useUsers`
  - `DELETE /api/users/:userId/roles/:roleId` - Remove role from user
    - Hook: `useRemoveRole()` from `useUsers`
- **Helper Functions**:
  - `hasRole(user, roleName)` - Check if user has specific role
  - `getRoleNames(user)` - Get array of role names from user
  - `getPrimaryRole(user)` - Get primary/first role from user

### Integration with User Management
- Clients are now users with "client" role:
  - Client list uses `useGetClients()` from `useUsers` hook
  - Client screens fetch user data via `useGetUserById()`
  - Client creation uses `useAdminCreateUser()` with `roleNames: ['client']`
- User list displays roles:
  - Shows all roles assigned to each user
  - Roles displayed as comma-separated list or badges
  - Role filter in user list searches by role name

### Wireframes
1. **Roles List**:
   - Toolbar: Search | Status Filter | Rows | Add Role
   - Table: Role | Display Name | Description | Status | Users | Created | Actions
2. **Role Detail**:
   - Header: Display Name, Status Badge
   - Info Card: Name, Display Name, Description, Dates
   - Permissions Card: List of permissions (if available)
   - Users Card: List of users with this role
   - Actions: Edit, Delete
3. **Create/Edit Role**:
   - Form: Name (read-only in edit), Display Name, Description, Status Toggle
   - Actions: Cancel, Save

### Future Enhancements
- [ ] Multi-select role assignment UI in user edit screen
- [ ] Permissions management UI within role edit
- [ ] Role-based access control (RBAC) enforcement
- [ ] Role templates for common role configurations
- [ ] Bulk role assignment to multiple users
- [ ] Role usage analytics (how many users per role)
- [ ] Role hierarchy/superior roles
- [ ] Custom permissions per role
- [ ] Role expiration dates
- [ ] Audit log for role changes

