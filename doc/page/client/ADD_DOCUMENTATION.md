# Add Client Screen Documentation

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
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAdminCreateUser } from '@/tanstack/useUsers';
```

## Context and State Management
- **TanStack Mutation:** `useAdminCreateUser()` provides `mutateAsync` for backend submission and `isPending` for handling UI loading states.
- **Local State:**
  - `firstName`, `lastName`, `email`, `password`: Required core account fields.
  - `phone`, `company`, `address`, `city`, `country`: Optional profile and billing fields.
  - `isPasswordVisible`: Boolean toggle for secure text entry.
  - `inlineStatus`: Manages local error and success feedback (`{ type: 'success' | 'error', text: string }`).

## UI Structure
- **Screen Shell:** `ThemedView` with standard white/dark-mode background.
- **Form Groups:** Unified vertical list of form inputs, each wrapped in a label container.
- **Password Input:** Relative container with an absolute-positioned visibility toggle icon.
- **Responsive Layout:** `ScrollView` with padding to ensure usability across all device sizes.

## Planned Layout
```
┌───────────────────────────────┐
│       Create Client (H1)      │
├───────────────────────────────┤
│  First Name: [ Input ]        │
│  Last Name:  [ Input ]        │
├───────────────────────────────┤
│  Email:      [ Input ]        │
│  Password:   [ Input + 👁 ]   │
├───────────────────────────────┤
│  Company:    [ Input ]        │
│  Phone:      [ Input ]        │
├───────────────────────────────┤
│  Address:    [ Input ]        │
│  City:       [ Input ]        │
│  Country:    [ Input ]        │
├───────────────────────────────┤
│  [ Cancel ]  [ Create Client ]│
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Back      │     New Client                              │
│  └──────────────┘                                             │
│                                                               │
│  Account Identity                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐       │
│  │ First Name             │  │ Last Name              │       │
│  └────────────────────────┘  └────────────────────────┘       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Email Address                                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Password                                         [👁]  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Business Information                                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Company Name (Optional)                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────┐      ┌────────────────────────┐       │
│  │      Cancel        │      │    Create Client       │       │
│  └────────────────────┘      └────────────────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Required Identity Fields**
  ```tsx
  <TextInput
    value={firstName}
    onChangeText={setFirstName}
    placeholder="Jane"
    className="form-input"
  />
  ```

- **Email Field (Validated)**
  ```tsx
  <TextInput
    value={email}
    onChangeText={setEmail}
    autoCapitalize="none"
    keyboardType="email-address"
    className="form-input"
  />
  ```

- **Password Field with Visibility Toggle**
  ```tsx
  <View className="relative">
    <TextInput
      value={password}
      secureTextEntry={!isPasswordVisible}
      className="form-input pr-10"
    />
    <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
      <MaterialIcons name={isPasswordVisible ? 'visibility-off' : 'visibility'} />
    </Pressable>
  </View>
  ```

## API Integration
- **HTTP client:** `axios` (Mutation hook wrapper).
- **Endpoint:** `POST /api/users/admin-create`.
- **Payload:**
  ```tsx
  {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string,
    company?: string,
    address?: string,
    roleNames: ['client'] // Hardcoded for this screen
  }
  ```

## Components Used
- `ThemedView`, `ThemedText`: Base theme components.
- `TextInput`: Standard React Native text input.
- `Alert`: For semantic feedback messages.
- `ActivityIndicator`: For submission state.

## Error Handling
- **Client-side Validation:** Prevents submission if `firstName`, `lastName`, `email`, or `password` are missing.
- **API Errors:** Displays backend feedback (e.g., "Email already registered") using the `Alert` component.
- **Auto-Clear:** Local state changes clear existing error messages to improve UX.

## Navigation Flow
- Route: `/(authenticated)/clients/create`.
- **Success:** Navigates to the Detail view of the new client: `router.replace(/(authenticated)/clients/${id})`.
- **Cancel:** Standard `router.back()` behavior.

## Functions Involved
- **`handleSave`** — Orchestrates the record creation and redirection.
  ```tsx
  const handleSave = useCallback(async () => {
    if (!firstName || !lastName || !email || !password) {
      setInlineStatus({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }
    setInlineStatus(null);
    try {
      const result = await mutateAsync({ ...formData, roleNames: ['client'] });
      setInlineStatus({ type: 'success', text: 'Client created.' });
      setTimeout(() => router.replace(`/(authenticated)/clients/${newId}`), 600);
    } catch (err: any) {
      setInlineStatus({ type: 'error', text: err.message });
    }
  }, [...deps]);
  ```

## Future Enhancements
- Password generator: Automatically generate a secure random password for the new client.
- Invitation toggle: Choose whether to send an onboarding email immediately.
- Client Tags: Categorize clients by industry or region during creation.
