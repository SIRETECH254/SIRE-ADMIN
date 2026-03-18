# Client List Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Data Display](#data-display)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';

import { useGetClients, useDeleteUser } from '@/tanstack/useUsers';
```

## Context and State Management
- **TanStack Query Hooks:**
  - `useGetClients(params)`: Primary hook for fetching paginated, searchable, and filtered client data.
- **TanStack Mutation Hooks:**
  - `useDeleteUser()`: Handles the asynchronous deletion of client accounts.
- **Local State:**
  - `searchTerm`, `debouncedSearch`: Manages text-based search with a 300ms debounce.
  - `filterStatus`, `filterVerification`: Tracks dropdown selection for account status and email verification.
  - `currentPage`, `itemsPerPage`: Controls table pagination.
  - `confirmDelete`: Stores the client object (ID, Name, Email) for the confirmation modal.
  - `deleteError`: Specifically captures feedback from failed delete attempts.

## UI Structure
- **Screen Shell:** `ThemedView` providing theme-responsive backgrounds.
- **Header Section:** Dynamic title and "Add Client" CTA.
- **Filter Toolbar:** Integrated search input and multi-option pickers for Status, Verification, and Rows-per-page.
- **Data Table:** A horizontal-scrolling `DataTable` from `react-native-paper` for structured display.
- **Identity Display:** Avatar-based cells using either remote images or initials.
- **Confirmation Flow:** Overlay `Modal` for destructive delete actions.

## Planned Layout
```
┌───────────────────────────────┐
│         Clients (H1)          │
│ [Add Client Button]           │
├───────────────────────────────┤
│ [Search Bar]                  │
│ [Status] [Verify] [Rows] [Clr]│
├───────────────────────────────┤
│  DataTable (Scrollable)       │
│  ┌─────────────────────────┐  │
│  │ Client | Email | Status  │  │
│  │--------|-------|---------│  │
│  │ (👤) JD| jd@   | ACTIVE  │  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  Pagination: < 1 2 3 ... >    │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  Clients     │           [🔍 Search]                       │
│  └──────────────┘                                             │
│                                                               │
│  [Status: All ▼]  [Verify: All ▼]  [Rows: 10 ▼]  [Clear]      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  (👤) John Doe                   jd@example.com        │   │
│  │  Acme Corp                       [ ACTIVE ] [ VERIFIED]│   │
│  │  Created: Oct 20, 2023           Actions: [👁][✎][🗑]│   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  (👤) Jane Smith                 js@example.com        │   │
│  │  Globex Inc                      [ ACTIVE ] [ UNVERIF] │   │
│  │  Created: Oct 18, 2023           Actions: [👁][✎][🗑]│   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  < Prev  [1]  2  3  ...  Next >                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Client Cell:** Combines user avatar (or initials) with their full name.
- **Contact Info:** Displays primary email and company name in dedicated columns.
- **Status Badges:** Uses `StatusBadge` component for both account activity (Active/Inactive) and security (Verified/Unverified).
- **Date:** Formatted creation date via `formatDate` utility.

## API Integration
- **Endpoints:**
  - `GET /api/users/clients`: List clients with query parameters.
  - `DELETE /api/users/:id`: Remove a user account.
- **Query Parameters:**
  ```tsx
  {
    page: number,
    limit: number,
    search?: string,
    status?: string // Maps to both active/inactive and verified/unverified
  }
  ```

## Components Used
- `ThemedView`, `ThemedText`: Base UI.
- `DataTable` (react-native-paper): For structured data grid.
- `StatusBadge`: For state visualization.
- `Modal`: For confirm dialogs.
- `Pagination`: Custom table footer.

## Error Handling
- **API Errors:** Displays a full-width `Alert` component above the table if the fetch fails.
- **Empty States:** Shows a "No clients found" message with a CTA to add one.
- **Delete Feedback:** Displays error messages *inside* the modal to prevent loss of context.

## Navigation Flow
- Route: `/(authenticated)/clients`.
- **View Detail:** `router.push(/(authenticated)/clients/[id])`.
- **Edit:** `router.push(/(authenticated)/clients/[id]/edit)`.
- **Add:** `Link` component to `/(authenticated)/clients/create`.

## Functions Involved
- **`params` (useMemo):** Orchestrates the query object based on UI state.
  ```tsx
  const params = useMemo(() => {
    const p: any = { page: currentPage, limit: itemsPerPage };
    if (debouncedSearch) p.search = debouncedSearch;
    if (filterVerification !== 'all') {
      p.status = filterVerification;
    } else if (filterStatus !== 'all') {
      p.status = filterStatus;
    }
    return p;
  }, [currentPage, itemsPerPage, debouncedSearch, filterStatus, filterVerification]);
  ```
- **`handleConfirmDelete`**: Executes the delete mutation and refetches the list.

## Future Enhancements
- Bulk messaging: Select multiple clients to send a broadcast notification.
- Client account locking: Direct "Suspend Account" action from the list.
- Usage stats: Show total project count or billing volume in the table.
