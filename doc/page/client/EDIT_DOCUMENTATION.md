# Edit Client Screen Documentation

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
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useGetUserById, useUpdateUser, useUpdateUserStatus } from '@/tanstack/useUsers';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
```

## Context and State Management
- **TanStack Query:** `useGetUserById(id)` fetches the existing client data to hydrate the form.
- **TanStack Mutations:**
  - `useUpdateUser()`: Mutation for updating profile fields (names, phone, company, address).
  - `useUpdateUserStatus()`: Mutation specifically for toggling the `isActive` boolean.
- **Local State Hydration:**
  - Uses a `useEffect` hook to map backend values to standard `useState` fields when the query returns.
  - Keeps a reference to the `originalActive` state to determine if a status-only mutation is required on save.
- **Form State:** Manages `firstName`, `lastName`, `email` (read-only), `phone`, `company`, `address`, `city`, `country`, and `isActive`.

## UI Structure
- **Screen Shell:** `ThemedView` with a light/dark responsive background.
- **Hydration State:** Displays a full-screen `Loading` component while `existing` data is null.
- **Form Grouping:** Vertical stack of labeled `TextInput` components.
- **Account Control:** A special row containing a `Switch` component for toggling account access (Active/Inactive).
- **Footer Actions:** Fixed row for "Cancel" and "Save changes".

## Planned Layout
```
┌───────────────────────────────┐
│       Edit Client (H1)        │
├───────────────────────────────┤
│  First Name: [ Jane ]         │
│  Last Name:  [ Doe ]          │
├───────────────────────────────┤
│  Email: [ client@ex... (🔒)]  │
├───────────────────────────────┤
│  Company: [ Acme Corp ]       │
├───────────────────────────────┤
│  Address Fields...            │
├───────────────────────────────┤
│  Account Status: [ Switch ● ] │
├───────────────────────────────┤
│  [ Cancel ]  [ Save Changes ] │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Cancel    │     Edit Client                             │
│  └──────────────┘                                             │
│                                                               │
│  Account Identity                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐       │
│  │ Jane                   │  │ Doe                    │       │
│  └────────────────────────┘  └────────────────────────┘       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  client@example.com (Read Only)                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Settings                                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Active Status                                  ( ● )  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────┐      ┌────────────────────────┐       │
│  │      Cancel        │      │    Save Changes        │       │
│  └────────────────────┘      └────────────────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Read-Only Email**
  ```tsx
  <TextInput value={email} editable={false} className="form-input-disabled" />
  ```

- **Account Status Toggle**
  ```tsx
  <View className="flex-row items-center gap-3">
    <Switch value={isActive} onValueChange={setIsActive} />
    <Text>{isActive ? 'Active' : 'Inactive'}</Text>
  </View>
  ```

## API Integration
- **HTTP client:** `axios` (TanStack Mutation wrapper).
- **Endpoints:**
  - `PUT /api/users/:id`: For profile data.
  - `PATCH /api/users/:id/status`: Specifically for the `isActive` flag.
- **Conditional Logic:** The status mutation is only triggered if `isActive !== originalActive` to minimize unnecessary API calls.

## Components Used
- `Switch`: For managing binary account states.
- `TextInput`: Standard and disabled variants.
- `Loading`: To prevent UI flickering during data fetch.
- `Alert`: For semantic feedback messages.

## Error Handling
- **Submission Validation:** Prevents update if required fields (`firstName`, `lastName`) are cleared by the user.
- **Mutation Errors:** Catch block updates `inlineStatus` with backend error messages (e.g., "Phone number format invalid").
- **ID Validation:** Handles cases where the client ID is missing in the route.

## Navigation Flow
- Route: `/(authenticated)/clients/[id]/edit`.
- **Success:** Navigates back via `router.back()` after a short delay to allow the success alert to be seen.
- **Cancel:** Direct `router.back()` call.

## Functions Involved
- **`handleSave`** — Orchestrates the sequential or parallel mutations for profile and status.
  ```tsx
  const handleSave = useCallback(async () => {
    // ... validation ...
    try {
      await updateUserAsync({ userId: id, userData: profileData });
      if (isActive !== originalActive) {
        await updateStatusAsync({ userId: id, statusData: { isActive } });
      }
      setInlineStatus({ type: 'success', text: 'Client updated.' });
      setTimeout(() => router.back(), 600);
    } catch (err: any) {
      setInlineStatus({ type: 'error', text: err.message });
    }
  }, [...deps]);
  ```

## Future Enhancements
- Password Reset Trigger: Add a button to send a reset link to the client from this screen.
- Profile Picture Upload: Integrated image picker for the client's avatar.
- Permission Management: If clients have granular permissions, manage them via checkboxes.
