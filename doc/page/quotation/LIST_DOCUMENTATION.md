# Quotation List Screen Documentation

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
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';

import { useGetClients } from '@/tanstack/useUsers';
import {
  useDeleteQuotation,
  useGetQuotations,
  useSendQuotation,
} from '@/tanstack/useQuotations';
```

## Context and State Management
- **TanStack Query Hooks:**
  - `useGetQuotations(params)`: Primary hook for fetching paginated, searchable, and filtered quotations.
  - `useGetClients({ limit: 200 })`: Fetches client list for the filter dropdown.
- **TanStack Mutation Hooks:**
  - `useDeleteQuotation()`, `useSendQuotation()`: Handles row-level actions.
- **Local State:**
  - `searchTerm`, `debouncedSearch`: Manages text filtering with 300ms delay.
  - `statusFilter`, `clientFilter`: Tracks dropdown selection states.
  - `currentPage`, `itemsPerPage`: Controls pagination.
  - `confirmDelete`: Object containing ID and label for the delete confirmation modal.
  - `inlineStatus`: Stores success/error feedback from mutations.

## UI Structure
- **Container:** `ThemedView` with responsive background.
- **Header:** Title and "Create Quotation" button.
- **Toolbar:** Integrated row containing search input and three functional pickers (Status, Client, Rows).
- **Data Table:** Horizontal scrollable `DataTable` showing key quotation metadata.
- **Modals:** System `Modal` used for confirming destructive delete actions.

## Planned Layout
```
┌───────────────────────────────┐
│       Quotations (H1)         │
│ [Create Quotation Button]     │
├───────────────────────────────┤
│ [Search Bar]                  │
│ [Status] [Client] [Rows] [Clr]│
├───────────────────────────────┤
│  DataTable (Scrollable)       │
│  ┌─────────────────────────┐  │
│  │ Q# | Client | Status| Act│  │
│  │----|--------|-------|----│  │
│  │ Q01| Acme   | SENT  | [V]│  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  Pagination: Page 1 of 5      │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  Quotations  │           [🔍 Search]                       │
│  └──────────────┘                                             │
│                                                               │
│  [Status: All ▼]  [Client: All ▼]  [Rows: 10 ▼]  [Clear]      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  QTN-2023-005                    $ 450.00              │   │
│  │  Tech Solutions                  [ SENT ]              │   │
│  │  Valid: Oct 20, 2023             Actions: [👁][✎][✉][🗑]│   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  QTN-2023-004                    $ 1,200.00            │   │
│  │  Creative Agency                 [ ACCEPTED ]          │   │
│  │  Valid: Oct 18, 2023             Actions: [👁][✎][✉][🗑]│   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  < Prev  [1]  2  3  ...  Next >                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Quotation/Client:** Combined cell showing the Q-number and the client name/company.
- **Project:** Displays the linked project title.
- **Amount:** Formatted KES currency.
- **Status:** Color-coded `StatusBadge` (Draft, Pending, Sent, Accepted, Rejected, Converted).
- **Actions:** Quick-action icons for View, Edit, Send Email, Convert to Invoice, and Delete.

## API Integration
- **Endpoints:**
  - `GET /api/quotations`: Fetch list with query params.
  - `DELETE /api/quotations/:id`: Remove a record.
  - `POST /api/quotations/:id/send`: Dispatch email to client.
- **Query Structure:**
  ```tsx
  { page, limit, search, status, clientId }
  ```

## Components Used
- `DataTable` (react-native-paper): For structured list rendering.
- `Modal`: For delete confirmation.
- `StatusBadge`: For semantic status visualization.
- `Pagination`: For navigable results.
- `Alert`: For mutation feedback.

## Error Handling
- **Fetch Error:** Displays backend error message in an `Alert` within the table area.
- **Mutation Error:** Shows a transient error `Alert` at the top of the screen if a delete or send action fails.
- **Empty State:** Distinct "No quotations found" UI with a CTA to create the first one.

## Navigation Flow
- Route: `/(authenticated)/quotations`.
- **View Detail:** `router.push(/(authenticated)/quotations/[id])`.
- **Edit:** `router.push(/(authenticated)/quotations/[id]/edit)`.
- **Convert:** `router.push(/(authenticated)/quotations/[id]/convert)`.
- **Create:** `Link` to `/(authenticated)/quotations/create`.

## Functions Involved
- **`handleConfirmDelete`** — Handles the asynchronous deletion and refetches data.
  ```tsx
  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      await deleteQuotationAsync(confirmDelete.id);
      setInlineStatus({ type: 'success', text: 'Quotation deleted successfully.' });
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Unable to delete.';
      setInlineStatus({ type: 'error', text: message });
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteQuotationAsync, refetch]);
  ```
- **`handleSendQuotation`** — Triggers the email dispatch mutation.
- **`params` (useMemo):** Consolidates all filtering and pagination into the query key.

## Future Enhancements
- Multi-select for bulk email sending.
- Advanced filtering by amount range or validity date.
- Inline status editing (Draft -> Pending).
