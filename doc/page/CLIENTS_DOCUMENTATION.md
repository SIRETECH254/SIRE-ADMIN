## Clients Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Clients List UI](#clients-list-ui)
- [Details UI](#details-ui)
- [Edit Client UI](#edit-client-ui)
- [Create Client UI](#create-client-ui)
- [Filters, Search & Pagination](#filters-search--pagination)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Wireframes](#wireframes)
- [Future Enhancements](#future-enhancements)

### Imports
The Clients screens reuse shared layout, themed helpers, table components and TanStack Query hooks:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import Pagination from '@/components/table/Pagination';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getInitials, formatDate } from '@/utils';
import {
  useGetClients,
  useGetUserById,
  useAdminCreateUser,
  useUpdateUser,
  useUpdateUserStatus,
  useDeleteUser,
} from '@/tanstack/useUsers';
```

### Data Sources
- Primary API (see server docs):
  - `GET /api/users/clients` (list clients - users with client role)
  - `GET /api/users/:userId` (get user/client details)
  - `PUT /api/users/:userId` (profile update: firstName, lastName, phone, company, address, city, country)
  - `PUT /api/users/:userId/status` (update `isActive`)
  - `POST /api/users/admin-create` (create client with `roleNames: ['client']`)
  - `DELETE /api/users/:userId` (delete client)
- TanStack Query hooks:
  - `useGetClients(params)` for list (from `useUsers` hook)
  - `useGetUserById(userId)` for details (from `useUsers` hook)
  - `useAdminCreateUser()` for create with `roleNames: ['client']` (from `useUsers` hook)
  - `useUpdateUser()` for profile edit (from `useUsers` hook)
  - `useUpdateUserStatus()` for active toggle (from `useUsers` hook)
  - `useDeleteUser()` for delete (from `useUsers` hook)
- **Note**: Clients are now users with the "client" role. All client operations use the user API endpoints.

### Hooks & State
- List screen:
  - Local: `searchTerm`, `debouncedSearch`, `filterStatus`, `filterVerification`, `currentPage`, `itemsPerPage`, `confirmDelete`
  - Derived: `params` memo with `search`, `isActive`, `verified`, `page`, `limit`
  - Query: `useGetClients(params)` providing `{ data, isLoading }`
- Details screen:
  - Param: `id` from route
  - Query: `useGetUserById(id)` (returns user with client role)
- Edit screen:
  - Param: `id`
  - Query: `useGetUserById(id)` for initial values
  - Mutations: `useUpdateUser()` and `useUpdateUserStatus()` (when status changes)
  - Local: `firstName`, `lastName`, `email (disabled)`, `phone`, `company`, `address`, `city`, `country`, `isActive`, `inlineStatus`
- Create screen:
  - Mutation: `useAdminCreateUser()` with `roleNames: ['client']`
  - Local: `firstName`, `lastName`, `email`, `password`, `phone`, `company`, `address`, `city`, `country`, `inlineStatus`

### Clients List UI
- RN-compatible table using `react-native-paper` DataTable:
  - Header columns: Client, Email, Company, Verified, Status, Created, Actions
  - Rows render initials or avatar + name, then metadata
  - Actions: View, Edit, Delete
- A top toolbar includes:
  - Search input with debounce
  - Filters: Status (active/inactive), Verification (verified/unverified)
  - Rows per page select
  - “Add Client” primary action
- Pagination:
  - Prev/Next with page window text
  - Shown only when total pages > 1

### Details UI
- Avatar or initials
- Name, email, pills for active and verification
- Contact panel (email, phone, company)
- Address panel (address, city, country)
- Account panel (active, verified, created/updated)
- Edit button navigates to `/(authenticated)/clients/[id]/edit`

### Edit Client UI
- Title: “Edit Client”
- Form fields:
  - `firstName` (required)
  - `lastName` (required)
  - `email` (read-only)
  - `phone` (optional)
  - `company`, `address`, `city`, `country`
  - `isActive` (toggle, saved via `PUT /api/clients/:id/status`)
- Save:
  - `useUpdateClient()` for profile fields
  - `useUpdateClientStatus()` when `isActive` changed
  - Inline success message then navigate back

### Create Client UI
- Title: “Create Client”
- Form fields:
  - `firstName`, `lastName`, `email`, `password` (required)
  - `phone`, `company`, `address`, `city`, `country` (optional)
- Submit:
  - `useAdminCreateUser()` with `roleNames: ['client']` to `POST /api/users/admin-create`
  - Automatically assigns "client" role to the new user
  - On success navigate to details
- **Note**: Clients are created as users with the client role automatically assigned.

### Filters, Search & Pagination
- Status filter options: `all | active | inactive`
- Verification filter options: `all | verified | unverified`
- Search: trims and debounces; passed as `search` param
- Pagination params: `page`, `limit`
- Rendering rule: pagination is hidden when total pages ≤ 1

### Mutation & Cache Behaviour
- `useUpdateUser()` invalidates:
  - `['users']` (includes clients)
  - `['user', userId]`
- `useUpdateUserStatus()` invalidates:
  - `['users']` (includes clients)
  - `['user', userId]`
- `useAdminCreateUser()` invalidates `['users']` (includes clients list)
- Success flows show success `Alert`, then navigate back or to details
- Errors display backend messages from `error.response?.data?.message`
- **Note**: Query keys now use `['users']` instead of `['clients']` since clients are users

### Navigation Flow
- Sidebar “Clients” → `/(authenticated)/clients/index.tsx`
- “View” action → `/(authenticated)/clients/[id]/index.tsx`
- “Edit” action → `/(authenticated)/clients/[id]/edit.tsx`
- “Add Client” → `/(authenticated)/clients/create.tsx`

### Error & Loading States
- List:
  - Loading: 5 skeleton rows (bg-gray-300, rounded, `animate-pulse`) in tbody; header persists
  - Error: full-width message row with inline `Alert`; header persists
  - Empty: full-width “No clients found” row with quick CTA; header persists
- Details: `Loading` for fetch; `Alert` for errors
- Edit/Create: disable buttons while submitting; inline success/error; safe retries

### Wireframes

Clients List (loading/error/empty render inside tbody, header persists):

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Client          Email          Company   Verified  Status   Created Actions│
├────────────────────────────────────────────────────────────────────────────┤
│ ◯ ▒▒▒▒▒▒▒▒      ▒▒▒▒▒▒▒▒▒▒▒▒   ▒▒▒▒      ▒▒▒▒      ▒▒▒▒▒▒  ▒ ▒ ▒         │ ← Skeleton row x5
│ …                                                                        … │
└────────────────────────────────────────────────────────────────────────────┘
```

Client Detail (centered edit button below avatar):

```text
[ Avatar ]
Name               [Verified][Active]

[ Edit Client ]
────────────────────────────────
Contact Information …
Address …
Account Details …
```

### Future Enhancements
- Bulk actions (activate/deactivate)
- Sort by columns (name, company, status, created)
- Server-side export (CSV)
- Advanced filters (date range, verification)


