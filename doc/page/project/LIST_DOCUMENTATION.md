# Project List Screen Documentation

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

import { useGetProjects, useDeleteProject } from '@/tanstack/useProjects';
```

## Context and State Management
- **TanStack Query Hooks:**
  - `useGetProjects(params)`: Primary hook for fetching paginated, searchable, and filtered project data.
- **TanStack Mutation Hooks:**
  - `useDeleteProject()`: Handles the asynchronous deletion of project records.
- **Local State:**
  - `searchTerm`, `debouncedSearch`: Manages project name/number search with 300ms debounce.
  - `filterStatus`, `filterPriority`, `filterAssignee`: Tracks multi-dimensional filtering criteria.
  - `currentPage`, `itemsPerPage`: Controls table pagination.
  - `confirmDelete`: Stores the project object (ID and Title) for the delete confirmation modal.
  - `deleteError`: Specifically captures feedback from failed delete attempts.

## UI Structure
- **Screen Shell:** `ThemedView` providing theme-responsive backgrounds.
- **Toolbar Section:**
  - Search Input with clear action.
  - Multi-select pickers for Status and Priority.
  - Rows-per-page selector.
- **Data Table:** A horizontal-scrolling `DataTable` from `react-native-paper`.
- **Progress Tracking:** In-cell progress bars for visual project completion status.
- **Confirmation Flow:** Overlay `Modal` for destructive delete actions.

## Planned Layout
```
┌───────────────────────────────┐
│         Projects (H1)         │
│ [Add Project Button]          │
├───────────────────────────────┤
│ [Search Bar]                  │
│ [Status] [Priority] [Rows]    │
├───────────────────────────────┤
│  DataTable (Scrollable)       │
│  ┌─────────────────────────┐  │
│  │ Name | Client | Progress│  │
│  │------|--------|---------│  │
│  │ Web  | Acme   | [====-] │  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  Pagination: Page 1 of 10     │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  Projects    │           [🔍 Search]   [Filter]            │
│  └──────────────┘                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Website Redesign                [ ACTIVE ]            │   │
│  │  Acme Corp                       [ HIGH ]              │   │
│  │                                                        │   │
│  │  Progress: 75%                                         │   │
│  │  [██████████████████████░░░░░░]                        │   │
│  │                                     Actions: [👁][✎][🗑]│   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Mobile App MVP                  [ PLANNING ]          │   │
│  │  Startup Inc                     [ LOW ]               │   │
│  │                                                        │   │
│  │  Progress: 10%                                         │   │
│  │  [███░░░░░░░░░░░░░░░░░░░░░░░░░]                        │   │
│  │                                     Actions: [👁][✎][🗑]│   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  < Prev  [1]  2  3  ...  Next >                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Project Cell:** Displays project number and title with truncation.
- **Status/Priority:** Uses `StatusBadge` component with semantic variants (success, info, warning, error).
- **Progress Bar:** Custom visual indicator using full-width `View` components.
- **Team Size:** Summarizes `teamMembers` array length (e.g., "3 members").

## API Integration
- **Endpoints:**
  - `GET /api/projects`: List projects with filters.
  - `DELETE /api/projects/:id`: Remove project.
- **Query Parameters:**
  ```tsx
  {
    page: number,
    limit: number,
    search?: string,
    status?: string,
    priority?: string,
    assignee?: string
  }
  ```

## Components Used
- `ThemedView`, `ThemedText`: Base UI.
- `DataTable` (react-native-paper): For structured data grid.
- `StatusBadge`: For state visualization.
- `Modal`: For confirm dialogs.
- `Pagination`: Custom table footer.

## Error Handling
- **Query Error:** Displays full-width `Alert` above the list.
- **Empty State:** Shows a "No projects found" message with an "Add Project" button to encourage user engagement.
- **Delete Error:** Displays specific error messages *inside* the delete modal to keep user context.

## Navigation Flow
- Route: `/(authenticated)/projects`.
- **View Detail:** `router.push(/(authenticated)/projects/[id])`.
- **Edit:** `router.push(/(authenticated)/projects/[id]/edit)`.
- **Add:** `router.push(/(authenticated)/projects/create)`.

## Functions Involved
- **`handleConfirmDelete`** — Orchestrates the delete process and UI feedback.
  ```tsx
  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      await deleteProjectAsync(confirmDelete.id);
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteProjectAsync, refetch]);
  ```
- **`getStatusVariant` / `getPriorityVariant`:** Mappers for `StatusBadge` styling.

## Future Enhancements
- Project sorting (by deadline or created date).
- Kanban board toggle view.
- Bulk project archive feature.
