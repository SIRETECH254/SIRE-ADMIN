# Edit Project Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { MultiSelect } from 'react-native-element-dropdown';
import { DatePickerModal } from 'react-native-paper-dates';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetProject, useUpdateProject } from '@/tanstack/useProjects';
import { useGetClients, useGetServices, useGetAllUsers } from '@/tanstack/useUsers';
```

## Context and State Management
- **TanStack Query:** `useGetProject(id)` fetches the existing data used to hydrate the form.
- **TanStack Mutation:** `useUpdateProject()` provides the `mutateAsync` function for patching the record.
- **Local State Hydration:**
  - Uses an `useEffect` hook that listens to the `existing` project data.
  - When data is loaded, it maps backend objects (like services and team members) into simple ID arrays for the `MultiSelect` components.
  - Sanitizes date strings from the API into JavaScript `Date` objects for the picker.
- **Form State:** Tracks `title`, `description`, `clientId`, `serviceIds`, `status`, `priority`, `teamMemberIds`, `startDate`, `endDate`, `progress`, and `notes`.

## UI Structure
- **Screen Shell:** `ThemedView` with a theme-aware background.
- **Loading State:** Displays a full-screen `Loading` component while the initial data is being fetched.
- **Hydrated Form:** A scrollable list of form groups, identical in structure to the "Add Project" screen but pre-filled with existing values.
- **Action Bar:** "Cancel" and "Save changes" buttons.

## Planned Layout
```
┌───────────────────────────────┐
│       Edit Project (H1)       │
├───────────────────────────────┤
│  Title: [ Existing Title ]    │
├───────────────────────────────┤
│  Client: [ Pre-selected ▼ ]   │
├───────────────────────────────┤
│  Services: [ Selected Tags ]  │
├───────────────────────────────┤
│  Status: [ Current Enum ▼ ]   │
│  Priority: [ Current Enum ▼ ] │
├───────────────────────────────┤
│  Progress: [ 75 ]             │
├───────────────────────────────┤
│  [ Cancel ]  [ Save Changes ] │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Cancel    │     Edit Project                            │
│  └──────────────┘                                             │
│                                                               │
│  Project Title *                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Website Redesign                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Status                                                       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  In Progress                                        ▼  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Progress (%)                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  75                                                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────┐      ┌────────────────────────┐       │
│  │      Cancel        │      │    Save Changes        │       │
│  └────────────────────┘      └────────────────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Hydration Logic**
  ```tsx
  useEffect(() => {
    if (existing) {
      setTitle(existing.title ?? '');
      setClientId(existing.client?._id || existing.client?.id || '');
      setServiceIds((existing.services ?? []).map((s: any) => s._id || s.id));
      // ... other fields
    }
  }, [existing]);
  ```

- **Update Submit**
  ```tsx
  <Pressable
    onPress={handleSave}
    disabled={isBusy}
    className="btn btn-primary">
    {isBusy ? <ActivityIndicator /> : <Text>Save changes</Text>}
  </Pressable>
  ```

## API Integration
- **HTTP client:** `axios` (TanStack Mutation wrapper).
- **Endpoint:** `PUT /api/projects/:id`.
- **Payload:** Unified project object containing updated fields.
- **Mutation Signature:** `mutateAsync({ projectId: id, projectData })`.

## Components Used
- `MultiSelect`: For managing updated arrays of IDs.
- `DatePickerModal`: For updating timeline dates.
- `Loading`: To prevent users from seeing an empty form during hydration.
- `Alert`: For mutation error feedback.

## Error Handling
- **Pre-submission checks:** Prevents saving if the user clears the title or client.
- **API Errors:** Displays backend validation or permission errors in an inline `Alert`.
- **Hydration Safety:** Uses optional chaining (`existing?.title`) to prevent crashes if certain fields are null.

## Navigation Flow
- Route: `/(authenticated)/projects/[id]/edit`.
- **Success:** Returns to the previous screen using `router.back()` to maintain stack history.
- **Cancel:** Returns via `router.back()`.

## Functions Involved
- **`handleSave`** — Executes the update mutation.
  ```tsx
  const handleSave = useCallback(async () => {
    // ... validation ...
    try {
      await mutateAsync({ projectId: id, projectData });
      setInlineStatus({ type: 'success', text: 'Project updated.' });
      setTimeout(() => router.back(), 600);
    } catch (err: any) {
      setInlineStatus({ type: 'error', text: err.message });
    }
  }, [...deps]);
  ```
- **`handleCancel`**: Direct `router.back()` call.

## Future Enhancements
- Change tracking: Only send modified fields to the API (Patching).
- Conflict Resolution: Warn if the project was updated by another admin while editing.
- Revision Notes: Require a reason for significant status changes (e.g., Active -> Cancelled).
