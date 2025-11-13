## Users Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Users List UI](#users-list-ui)
- [Details UI](#details-ui)
- [Edit User UI](#edit-user-ui)
- [Create User UI](#create-user-ui)
- [Filters, Search & Pagination](#filters-search--pagination)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Future Enhancements](#future-enhancements)

### Imports
The Users screens reuse shared layout, themed helpers and TanStack Query hooks:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  useGetAllUsers,
  useGetUserById,
  useAdminCreateUser,
  useUpdateUser,
} from '@/tanstack/useUsers';
```

### Data Sources
- Primary API:
  - `GET /api/users` (list with pagination, filters, search)
  - `GET /api/users/:userId` (details)
  - `POST /api/users/admin-create` (create)
  - `PUT /api/users/:userId` (full admin update: firstName, lastName, phone, role, isActive)
- TanStack Query hooks:
  - `useGetAllUsers(params)` for list
  - `useGetUserById(userId)` for details
  - `useAdminCreateUser()` for create
  - `useUpdateUser()` for admin edit

### Hooks & State
- List screen:
  - Local: `searchTerm`, `debouncedSearch`, `filterRole`, `filterStatus`, `currentPage`, `itemsPerPage`, `selectedUsers`
  - Derived: `params` memo with role/status/search/page/limit
  - Query: `useGetAllUsers(params)` providing `{ data, isLoading }`
- Details screen:
  - Param: `id` from route
  - Query: `useGetUserById(id)`
- Edit screen:
  - Param: `id`
  - Query: `useGetUserById(id)` for initial values
  - Mutation: `useUpdateUser()`
  - Local state: `firstName`, `lastName`, `email (disabled)`, `phone`, `role`, `isActive`, `inlineStatus`
- Create screen:
  - Mutation: `useAdminCreateUser()`
  - Local state: `firstName`, `lastName`, `email`, `password`, `phone`, `role`, `inlineStatus`

### Users List UI
- RN-compatible table using Views:
  - Header row with columns: Avatar/Name, Email, Role, Status, Created, Actions
  - Rows render user initials or avatar, then metadata
  - Touch-friendly actions: View, Edit
- Includes a top toolbar:
  - Search input with debounce
  - Filters: Role, Status
  - Rows per page select
  - “Add User” primary action
- Pagination:
  - Prev/Next buttons with current/total pages display

### Details UI
- Avatar or initials in a circle
- Name, email, pills for role and active status
- Contact panel (email, phone)
- Account panel (role, active flag, created/updated)
- Edit button leading to `/(authenticated)/users/[id]/edit`

### Edit User UI
- Title: “Edit User”
- Form fields:
  - `firstName` (required)
  - `lastName` (required)
  - `email` (read-only)
  - `phone` (optional)
  - `role` (select)
  - `isActive` (toggle)
- Save via `PUT /api/users/:id` using `useUpdateUser()`; success shows inline Alert and navigates back.

### Create User UI
- Title: “Create User”
- Form fields:
  - `firstName`, `lastName`, `email`, `password` (required)
  - `phone` (optional)
  - `role` (select)
- Submit via `POST /api/users/admin-create`; on success, navigate to details.

### Filters, Search & Pagination
- Role filter options: `super_admin`, `admin`, `finance`, `project_manager`, `staff`, `client`
- Status filter options: `all | active | inactive`
- Search: trims and debounces; passed as `search` param
- Pagination params: `page`, `limit`

### Mutation & Cache Behaviour
- `useUpdateUser()` invalidates:
  - `['users', 'list']`
  - `['users', 'detail', userId]`
- `useAdminCreateUser()` invalidates `['users', 'list']`
- Success flows show success `Alert`, then navigate back or to details
- Errors display backend messages from `error.response?.data?.message`

### Navigation Flow
- Sidebar “Users” → `/(authenticated)/users/index.tsx`
- “View” action → `/(authenticated)/users/[id]/index.tsx`
- “Edit” action → `/(authenticated)/users/[id]/edit.tsx`
- “Add User” → `/(authenticated)/users/create.tsx`

### Error & Loading States
- List: `Loading` spinner during initial fetch; empty state when no users
- Details: `Loading` for fetch; `Alert` for errors
- Edit/Create: disable buttons while submitting; inline success/error messages; safe retries

### Future Enhancements
- Bulk actions (activate/deactivate, role changes)
- Sort by columns (name, role, status, created)
- Server-side export (CSV)
- Advanced filters (date range, role multi-select)


