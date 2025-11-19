## Services Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Services List UI](#services-list-ui)
- [Details UI](#details-ui)
- [Edit Service UI](#edit-service-ui)
- [Create Service UI](#create-service-ui)
- [Filters, Search & Pagination](#filters-search--pagination)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Wireframes](#wireframes)
- [Future Enhancements](#future-enhancements)

### Imports
The Services screens reuse shared layout, themed helpers, table components and TanStack Query hooks:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Pagination from '@/components/table/Pagination';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDate } from '@/utils';
import {
  useGetServices,
  useGetService,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useToggleServiceStatus,
  useUploadServiceIcon,
} from '@/tanstack/useServices';
```

### Data Sources
- Primary API (see server docs `SIRE-API/doc/SERVICE_DOCUMENTATION.md`):
  - `GET /api/services` (list with pagination, filters, search)
  - `GET /api/services/:serviceId` (details)
  - `POST /api/services` (create)
  - `PUT /api/services/:serviceId` (update: title, description, features)
  - `DELETE /api/services/:serviceId` (delete)
  - `PATCH /api/services/:serviceId/toggle-status` (toggle active/inactive)
  - `POST /api/services/:serviceId/icon` (upload icon)
- TanStack Query hooks:
  - `useGetServices(params)` for list
  - `useGetService(serviceId)` for details
  - `useCreateService()` for create
  - `useUpdateService()` for edit
  - `useDeleteService()` for delete
  - `useToggleServiceStatus()` for status toggle
  - `useUploadServiceIcon()` for icon upload

### Hooks & State
- List screen:
  - Local: `searchTerm`, `debouncedSearch`, `filterStatus`, `currentPage`, `itemsPerPage`, `confirmDelete`
  - Derived: `params` memo with `search`, `status`, `page`, `limit`
  - Query: `useGetServices(params)` providing `{ data, isLoading }`
- Details screen:
  - Param: `id` from route
  - Query: `useGetService(serviceId)`
  - Mutations: `useToggleServiceStatus()`, `useDeleteService()`
  - Local: `confirmDelete`, `deleteError`
- Edit screen:
  - Param: `id`
  - Query: `useGetService(serviceId)` for initial values
  - Mutations: `useUpdateService()`, `useUploadServiceIcon()` (if icon changed)
  - Local: `title`, `description`, `features` (array), `iconFile`, `existingIcon`, `isActive`, `inlineStatus`
- Create screen:
  - Mutations: `useCreateService()`, `useUploadServiceIcon()` (if icon provided)
  - Local: `title`, `description`, `features` (array), `iconFile`, `isActive`, `inlineStatus`

### Services List UI
- RN-compatible table using `react-native-paper` DataTable:
  - Header columns: Service, Description, Features, Status, Created, Actions
  - Rows render service title, truncated description, features count badge, status badge, created date
  - Actions: View, Edit, Toggle Status, Delete
- A top toolbar includes:
  - Search input with debounce (300ms) for title/description
  - Status filter dropdown (all, active, inactive)
  - Rows per page selector (10, 20, 50)
  - "Add Service" primary action
- Pagination:
  - Prev/Next with page window text
  - Shown only when total pages > 1

### Details UI
- Service header: Title and status badge
- Icon display: Image component if icon exists, fallback MaterialIcon
- Description section
- Features list: Bullet points or badges showing all features
- Created/Updated dates
- Creator information (if populated)
- Action buttons: Edit, Toggle Status, Delete
- Edit button navigates to `/(authenticated)/services/[id]/edit`

### Edit Service UI
- Title: "Edit Service"
- Form fields:
  - `title` (required, TextInput)
  - `description` (required, multiline TextInput)
  - `features` (array management):
    - Dynamic add/remove feature inputs
    - "Add Feature" button
    - Remove button per feature
    - At least one feature required
  - Icon upload section:
    - Display existing icon if available
    - ImagePicker integration (expo-image-picker)
    - Display selected image preview
    - "Change Icon" button
    - Option to remove icon (set to null)
    - Handle both web (blob) and native (uri) uploads
  - Status toggle (Switch component)
- Save:
  - `useUpdateService()` for service fields
  - `useUploadServiceIcon()` if icon changed separately
  - Inline success message then navigate back

### Create Service UI
- Title: "Create Service"
- Form fields:
  - `title` (required, TextInput)
  - `description` (required, multiline TextInput)
  - `features` (array management):
    - Dynamic add/remove feature inputs
    - "Add Feature" button
    - Remove button per feature
    - At least one feature required
  - Icon upload section:
    - ImagePicker integration (expo-image-picker)
    - Display selected image preview
    - "Upload Icon" button
    - Handle both web (blob) and native (uri) uploads
  - Status toggle (Switch component, default: active)
- Submit:
  - `useCreateService()` to `POST /api/services`
  - `useUploadServiceIcon()` after create if icon provided
  - On success navigate to service details

### Filters, Search & Pagination
- Status filter options: `all | active | inactive`
- Search: trims and debounces (300ms); passed as `search` param (searches title and description)
- Pagination params: `page`, `limit`
- Rendering rule: pagination is hidden when total pages ≤ 1

### Mutation & Cache Behaviour
- `useUpdateService()` invalidates:
  - `['services']`
  - `['service', serviceId]`
- `useToggleServiceStatus()` invalidates:
  - `['services']`
  - `['service', serviceId]`
- `useCreateService()` invalidates `['services']`
- `useDeleteService()` invalidates `['services']`
- `useUploadServiceIcon()` invalidates:
  - `['services']`
  - `['service', serviceId]`
- Success flows show success `Alert`, then navigate back or to details
- Errors display backend messages from `error.response?.data?.message`

### Navigation Flow
- Sidebar "Services" → `/(authenticated)/services/index.tsx`
- "View" action → `/(authenticated)/services/[id].tsx`
- "Edit" action → `/(authenticated)/services/[id]/edit.tsx`
- "Add Service" → `/(authenticated)/services/create.tsx`
- Detail page "Edit" button → `/(authenticated)/services/[id]/edit.tsx`

### Error & Loading States
- List:
  - Loading: 5 skeleton rows (bg-gray-300, rounded, `animate-pulse`) in tbody; header persists
  - Error: full-width message row with inline `Alert`; header persists
  - Empty: full-width "No services found" row with quick CTA; header persists
- Details: `Loading` for fetch; `Alert` for errors
- Edit/Create: disable buttons while submitting; inline success/error; safe retries

### Wireframes

Services List (loading/error/empty render inside tbody, header persists):

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Service        Description     Features  Status    Created      Actions     │
├────────────────────────────────────────────────────────────────────────────┤
│ ▒▒▒▒▒▒▒▒      ▒▒▒▒▒▒▒▒▒      ▒▒▒▒      ▒▒▒▒      ▒▒▒▒▒▒      ▒▒▒▒        │ ← Skeleton row x5
│ …                                                                        … │
└────────────────────────────────────────────────────────────────────────────┘
```

Service Detail (centered edit button below header):

```text
[ Service Title ]                    [Status]
[ Icon Image ]

[ Edit Service ] [ Toggle Status ] [ Delete ]

────────────────────────────────
Description …
Features List …
Created …
Updated …
Creator …
```

### Future Enhancements
- Service packages (bundle multiple services)
- Service templates for quick creation
- Service analytics (usage in quotations/projects)
- Service categories/tags
- Service pricing management
- Service demand trends dashboard

