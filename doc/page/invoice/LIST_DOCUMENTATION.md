# Invoice List Screen Documentation

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
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';

import { useGetInvoices } from '@/tanstack/useInvoices';
import { useGetClients } from '@/tanstack/useUsers';
```

## Context and State Management
- **TanStack Query:**
  - `useGetInvoices(params)`: Primary hook for fetching paginated and filtered invoice data.
  - `useGetClients({ limit: 200 })`: Used to populate the client filter dropdown.
- **Local State:**
  - `searchTerm`, `debouncedSearch`: Manages text-based search with a 300ms debounce.
  - `statusFilter`, `clientFilter`: Tracks dropdown selection for status and client filtering.
  - `currentPage`, `itemsPerPage`: Controls pagination logic.
- **Memoized Values:**
  - `params`: Combines all filters and pagination into a single object for the query key.
  - `invoices`: Flattens the API response structure for easier rendering.
  - `pagination`: Extracts metadata (total items, pages) for the footer component.

## UI Structure
- **Root Container:** `ThemedView` with a light/dark mode responsive background.
- **Header Section:** Dynamic title and "Create Invoice" CTA.
- **Filter Bar:** Contains search input, status picker, client picker, and rows-per-page selector.
- **Data Table:** A horizontal-scrolling `DataTable` from `react-native-paper` for structured display.
- **Pagination:** Custom `Pagination` footer for page switching.

## Planned Layout
```
┌───────────────────────────────┐
│         Header (Invoices)     │
│ [Search Bar] [Filters...]     │
├───────────────────────────────┤
│  DataTable (Scrollable)       │
│  ┌─────────────────────────┐  │
│  │ Invoice | Client | Status│  │
│  │---------|--------|-------│  │
│  │ INV-001 | Acme   | PAID  │  │
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
│  │  Invoices    │           [🔍 Search]   [Filters]           │
│  └──────────────┘                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  DataTable (Horizontal Scroll)                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Invoice # | Client | Status | Total | Due Date   │  │   │
│  │  │-----------|--------|--------|-------|------------│  │   │
│  │  │ INV-001   | Acme   | [PAID] | $500  | 2023-10-15 │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Pagination: Page 1 of 10 | [10] Rows Per Page         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Invoice Number:** Displays primary ID and linked project title.
- **Client Name:** Memoized formatting logic to handle first/last names or company names.
- **Status Badge:** Uses `StatusBadge` component with custom variants (info, success, warning, error).
- **Amounts:** Formatted via `formatCurrency` utility.
- **Dates:** Formatted via `formatDate` utility.

## API Integration
- **Endpoint:** `GET /api/invoices`.
- **Query Params:**
  ```tsx
  {
    page: number,
    limit: number,
    search?: string,
    status?: string,
    client?: string
  }
  ```
- **Response Shape:**
  ```json
  {
    "success": true,
    "data": {
      "invoices": [...],
      "pagination": { "totalInvoices": 100, "totalPages": 10, "page": 1 }
    }
  }
  ```

## Components Used
- `ThemedView`, `ThemedText`: Theme-aware base components.
- `DataTable` (react-native-paper): For the responsive data grid.
- `Picker` (@react-native-picker/picker): For filter selections.
- `Alert`: For inline error feedback.
- `Pagination`: Custom component for page navigation.
- `StatusBadge`: For semantic status visualization.

## Error Handling
- **API Errors:** Displays a full-width `Alert` component inside the table body if the fetch fails.
- **Empty States:** Shows a "No invoices found" message with a creation button.
- **Loading States:** Uses skeleton-style placeholders (gray pulses) during data fetching.

## Navigation Flow
- Route: `/(authenticated)/invoices`.
- **Action - View:** `router.push(/(authenticated)/invoices/[id])`.
- **Action - Edit:** `router.push(/(authenticated)/invoices/[id]/edit)`.
- **Action - Create:** `Link` component to `/(authenticated)/invoices/create`.
- **Action - Pay:** Redirects to `/(authenticated)/payments/initiate` with invoice ID as a param.

## Functions Involved
- **`params` (useMemo):** Orchestrates the query object based on all UI state.
- **`formatClientName` (useCallback):** Fallback logic for client display.
  ```tsx
  const formatClientName = useCallback((invoice: any) => {
    const client = invoice?.client ?? invoice?.clientId;
    if (!client) return '—';
    const fullName = `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
    return fullName || client.company || client.email || 'Client';
  }, []);
  ```
- **`clearFilters`:** Resets all local filter state to defaults.

## Future Enhancements
- Bulk invoice actions (e.g., mark multiple as paid).
- Export to PDF/CSV directly from the list.
- Advanced date range filtering.
