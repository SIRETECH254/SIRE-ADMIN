# Dashboard Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { useGetAdminDashboard, useGetClientDashboard } from '@/tanstack/useDashboard';
import { formatCurrency, formatDate } from '@/utils';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the app and exposes the `useAuth` hook.
- **User role detection:** `const { user } = useAuth();` provides the current user's role to determine which dashboard to display.
- **Role-based rendering:** Admin roles (`'super_admin' | 'admin' | 'finance' | 'project_manager' | 'staff'`) see the admin dashboard; `'client'` role sees the client dashboard.
- **TanStack Query hooks:** `useGetAdminDashboard()` and `useGetClientDashboard()` handle data fetching with automatic caching and refetching.

**Hook usage:**
```tsx
const { user } = useAuth();
const isClient = user?.role === 'client';

// Admin dashboard hook
const { data: adminData, isLoading: adminLoading, error: adminError } = useGetAdminDashboard();

// Client dashboard hook
const { data: clientData, isLoading: clientLoading, error: clientError } = useGetClientDashboard();
```

## UI Structure
- **Screen shell:** `ThemedView` with Tailwind classes for background and layout.
- **Scrollable content:** `ScrollView` wraps all dashboard content for vertical scrolling.
- **Statistics cards:** Individual `View` components with Tailwind styling for each metric card.
- **Recent activity sections:** Lists of recent projects, invoices, and payments displayed in card format.
- **Typography:** `ThemedText` for titles and headings; plain `Text` for data values with Tailwind classes.
- **Icons:** `MaterialIcons` for visual indicators on cards and activity items.

## Planned Layout
```
┌─────────────────────────────────────────┐
│         Dashboard Header                │
│   "Welcome, [Name]" (H1 style)          │
├─────────────────────────────────────────┤
│         Statistics Cards Grid            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ Proj │ │ Inv  │ │ Pay  │ │ Quot │  │
│  │ ects │ │ oice │ │ ment │ │ ation│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│  ┌──────┐ ┌──────┐                     │
│  │ Clie │ │ Serv │                     │
│  │ nts  │ │ ices │                     │
│  └──────┘ └──────┘                     │
├─────────────────────────────────────────┤
│      Recent Activity Sections            │
│  ┌───────────────────────────────────┐ │
│  │ Recent Projects                    │ │
│  │ • Project 1                        │ │
│  │ • Project 2                        │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ Recent Invoices                    │ │
│  │ • Invoice 1                         │ │
│  │ • Invoice 2                         │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ Recent Payments                     │ │
│  │ • Payment 1                         │ │
│  │ • Payment 2                         │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts`.
- **Admin endpoint:** `GET /api/dashboard/admin` (accessed via `dashboardAPI.getAdminDashboard()`).
- **Client endpoint:** `GET /api/dashboard/client` (accessed via `dashboardAPI.getClientDashboard()`).
- **Response structure:**
  - Admin: `data.data.overview` contains statistics; `data.data.recentActivity` contains recent items.
  - Client: Similar structure but filtered to client's own data.
- **Data access pattern:**
  ```tsx
  const overview = data?.data?.overview ?? {};
  const recentActivity = data?.data?.recentActivity ?? {};
  ```

**Admin Dashboard Response Structure:**
```typescript
{
  data: {
    overview: {
      projects: { total: number, byStatus: {...} },
      invoices: { total: number, byStatus: {...} },
      payments: { total: number, totalAmount: number, completed: number },
      quotations: { total: number, byStatus: {...} },
      clients: { total: number, active: number, verified: number },
      services: { total: number, active: number },
      revenue: { total: number, fromPayments: number }
    },
    recentActivity: {
      projects: [...],
      invoices: [...],
      payments: [...]
    }
  }
}
```

**Client Dashboard Response Structure:**
```typescript
{
  data: {
    overview: {
      projects: { total: number, byStatus: {...} },
      invoices: { total: number, byStatus: {...}, outstanding: number },
      payments: { total: number, totalAmount: number },
      quotations: { total: number, byStatus: {...} },
      financial: { totalSpent: number, outstandingBalance: number }
    },
    recentActivity: {
      projects: [...],
      invoices: [...],
      payments: [...]
    }
  }
}
```

## Components Used
- `ThemedView`, `ThemedText` for theming support.
- `View`, `ScrollView` for layout structure.
- `Badge` for status indicators on activity items.
- `Alert` for error messages.
- `Loading` for loading states.
- `MaterialIcons` for icons on cards and activity items.
- Tailwind (NativeWind) classes for all styling (no StyleSheet).

## Error Handling
- TanStack Query automatically handles errors and exposes them via the `error` property.
- Error messages extracted from `error?.response?.data?.message ?? error?.message`.
- `Alert` component displays error messages with `variant="error"`.
- Loading states handled with `Loading` component when `isLoading` is true.
- Empty states handled gracefully when data arrays are empty.

## Navigation Flow
- Route: `/(authenticated)/index.tsx` (main authenticated landing page).
- On authentication, users are redirected to `/(authenticated)` which serves the dashboard.
- Role-based routing:
  - Admin roles see admin dashboard with full statistics.
  - Client role sees client dashboard with personalized data.
- Navigation to detail pages:
  - Clicking on recent activity items navigates to respective detail pages.
  - Example: Clicking a project navigates to `/(authenticated)/projects/[id]`.

## Functions Involved
- **Role detection:** Determines which dashboard to display based on `user?.role`.
  ```tsx
  const isClient = user?.role === 'client';
  ```

- **Data extraction:** Safely extracts dashboard data from API response.
  ```tsx
  const overview = useMemo(() => {
    const root = data?.data ?? {};
    return root?.overview ?? {};
  }, [data]);
  
  const recentActivity = useMemo(() => {
    const root = data?.data ?? {};
    return root?.recentActivity ?? {};
  }, [data]);
  ```

- **Navigation handlers:** Navigate to detail pages when activity items are clicked.
  ```tsx
  const handleViewProject = (projectId: string) => {
    router.push(`/(authenticated)/projects/${projectId}`);
  };
  ```

- **Status badge mapping:** Maps status values to badge variants for visual consistency.
  ```tsx
  const getStatusVariant = (status: string) => {
    const statusMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
      pending: 'info',
      in_progress: 'info',
      completed: 'success',
      paid: 'success',
      overdue: 'error',
      // ... more mappings
    };
    return statusMap[status] ?? 'default';
  };
  ```

## Future Enhancements
- Add date range filters for statistics (last 7 days, 30 days, etc.).
- Implement real-time updates using WebSockets or polling.
- Add chart visualizations for revenue trends and project progress.
- Add export functionality for dashboard data (PDF, CSV).
- Implement dashboard customization (drag-and-drop widgets).
- Add comparison views (this month vs last month).
- Add drill-down capabilities (clicking a stat card shows detailed list).
- Implement dashboard refresh button with manual refetch.
- Add loading skeletons instead of full-screen loading for better UX.
- Add empty state illustrations when no data is available.

