# Add Project Screen Documentation

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
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { MultiSelect } from 'react-native-element-dropdown';
import { DatePickerModal } from 'react-native-paper-dates';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useCreateProject } from '@/tanstack/useProjects';
import { useGetClients, useGetAllUsers } from '@/tanstack/useUsers';
import { useGetServices } from '@/tanstack/useServices';
```

## Context and State Management
- **TanStack Mutation:** `useCreateProject()` provides `mutateAsync` for asynchronous record creation.
- **TanStack Query (Fetch):**
  - `useGetClients()`: Populates the project owner selection.
  - `useGetServices()`: Populates the project service tags.
  - `useGetAllUsers()`: Populates the team member selection.
- **Local State:**
  - `title`, `description`, `clientId`: Required core fields.
  - `serviceIds`, `teamMemberIds`: Array-based many-to-many relationship IDs.
  - `status`, `priority`: Enums for project classification.
  - `startDate`, `endDate`: Date objects for timeline management.
  - `progress`: String-wrapped numeric state (0-100).
- **Memoized Values:** Processes raw API responses from multiple hooks into flattened arrays for UI dropdowns.

## UI Structure
- **Root:** `ThemedView` with a theme-aware background.
- **Form Groups:** Vertical stack of labeled `TextInput` and `Picker` components.
- **Multi-Select Inputs:** Uses `react-native-element-dropdown` for managing complex relationships (services, team members).
- **Date Inputs:** Integrated `Pressable` fields that trigger the localized `DatePickerModal`.
- **Progress Field:** Explicit numeric input for completion percentage.

## Planned Layout
```
┌───────────────────────────────┐
│       Create Project (H1)     │
├───────────────────────────────┤
│  Title: [ Project Name ]      │
├───────────────────────────────┤
│  Client: [ Select Client ▼ ]  │
├───────────────────────────────┤
│  Services: [ Tags / Badges ]  │
├───────────────────────────────┤
│  Status: [ Enum Select ▼ ]    │
│  Priority: [ Enum Select ▼ ]  │
├───────────────────────────────┤
│  Team: [ Member Search ]      │
├───────────────────────────────┤
│  Start: [📅] | End: [📅]      │
├───────────────────────────────┤
│  Progress: [ 0-100 ]          │
├───────────────────────────────┤
│  [ Cancel ]  [ Create Proj ]  │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Back      │     New Project                             │
│  └──────────────┘                                             │
│                                                               │
│  Project Title *                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  e.g., Q4 Marketing Campaign                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Client *                                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Select Client...                                   ▼  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Team Members                                                 │
│  ┌───────────────────┐  ┌───────────────────┐                 │
│  │  John Doe [x]     │  │  Jane Smith [x]   │                 │
│  └───────────────────┘  └───────────────────┘                 │
│                                                               │
│  Dates                                                        │
│  ┌───────────────┐  ┌───────────────┐                         │
│  │ Start: 10/10  │  │ End: 12/12    │                         │
│  └───────────────┘  └───────────────┘                         │
│                                                               │
│  ┌────────────────────┐      ┌────────────────────────┐       │
│  │      Cancel        │      │    Create Project      │       │
│  └────────────────────┘      └────────────────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Multi-Select Input**
  ```tsx
  <MultiSelect
    data={services}
    labelField="label"
    valueField="value"
    value={serviceIds}
    onChange={setServiceIds}
    renderSelectedItem={(item, unSelect) => (
      <View className="badge">
        <Text>{item.label}</Text>
      </View>
    )}
  />
  ```

- **Date Picker Trigger**
  ```tsx
  <Pressable onPress={() => setStartPickerOpen(true)}>
    <Text>{startDate ? startDate.toLocaleDateString() : 'Select'}</Text>
  </Pressable>
  ```

## API Integration
- **HTTP client:** `axios` (TanStack Mutation wrapper).
- **Endpoint:** `POST /api/projects`.
- **Payload:**
  ```tsx
  {
    title: string,
    client: string (ID),
    services: string[] (IDs),
    status: 'pending' | 'in_progress' | ...,
    teamMembers: string[] (IDs),
    startDate?: string (ISO),
    progress: number
  }
  ```

## Components Used
- `MultiSelect` (react-native-element-dropdown): For selecting multiple services and team members.
- `DatePickerModal` (react-native-paper-dates): For platform-agnostic date selection.
- `Picker` (@react-native-picker/picker): For single-choice enums.
- `Alert`: For inline validation error display.

## Error Handling
- **Required Fields:** Prevents submission if `title` or `clientId` is missing.
- **Progress Validation:** Ensures the progress value is an integer between 0 and 100.
- **Mutation Errors:** Catch block updates `inlineStatus` with backend error messages (e.g., "Client not found").

## Navigation Flow
- Route: `/(authenticated)/projects/create`.
- **Success:** Navigates to the Detail view of the newly created project: `router.replace(/(authenticated)/projects/${id})`.
- **Cancel:** Navigates back one level in the stack.

## Functions Involved
- **`handleSave`** — Orchestrates the entire submission workflow.
  ```tsx
  const handleSave = useCallback(async () => {
    if (!title || !clientId) {
      setInlineStatus({ type: 'error', text: 'Title and client are required.' });
      return;
    }
    // ... validation ...
    try {
      const result = await mutateAsync(projectData);
      setInlineStatus({ type: 'success', text: 'Project created.' });
      setTimeout(() => router.replace(`/(authenticated)/projects/${newId}`), 600);
    } catch (err: any) {
      setInlineStatus({ type: 'error', text: err.message });
    }
  }, [...deps]);
  ```

## Future Enhancements
- Project color-coding for visual categorization.
- Template support: Pre-fill project details from a library of common service packages.
- Client quick-add: Add a new client directly from the project creation form.
