# Edit Profile Screen Documentation

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
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';

import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile, useUpdateProfile } from '@/tanstack/useUsers';
import { updateUser } from '@/redux/slices/authSlice';
```

## Context and State Management
- **TanStack Query:** `useGetProfile()` fetches the existing profile data to hydrate the form.
- **TanStack Mutation:** `useUpdateProfile()` provides `mutateAsync` for submitting the updated data.
- **Redux Integration:** `useDispatch()` is used to call the `updateUser` action, ensuring the global auth state stays in sync with the updated profile.
- **Local State:**
  - `firstName`, `lastName`, `phone`: Core profile text fields.
  - `avatarUri`: Local URI for previewing the selected image.
  - `avatarFile`: Object containing `uri`, `name`, and `type` for the API payload.
  - `avatarRemoved`: Boolean flag to indicate if the current avatar should be deleted.
- **Hydration:** An `useEffect` hook populates the local state fields as soon as the `profile` data becomes available from the query.

## UI Structure
- **Root Container:** `ThemedView` combined with `KeyboardAvoidingView` for responsive form handling.
- **Identity Section:** Centered avatar display with dual actions ("Change avatar" and "Remove avatar").
- **Form Groups:** Vertical list of labeled `TextInput` components.
- **Read-Only email:** The user's primary email is displayed but disabled for security reasons.
- **Action Bar:** Footer row containing "Cancel" and "Save changes" buttons.

## Planned Layout
```
┌───────────────────────────────┐
│       Edit Profile (H1)       │
├───────────────────────────────┤
│           [ Avatar ]          │
│      [ Tap to change ]        │
│      [ Remove avatar ]        │
├───────────────────────────────┤
│  First Name: [ Input ]        │
│  Last Name:  [ Input ]        │
├───────────────────────────────┤
│  Email: [ email@... (🔒)]     │
├───────────────────────────────┤
│  Phone: [ Input ]             │
├───────────────────────────────┤
│  [ Cancel ]  [ Save Changes ] │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Cancel    │     Edit Profile                            │
│  └──────────────┘                                             │
│                                                               │
│         ┌──────────┐                                          │
│         │    👤    │                                          │
│         └──────────┘                                          │
│      [ Change Avatar ]                                        │
│      [ Remove Avatar ]                                        │
│                                                               │
│  Personal Details                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐       │
│  │ First Name             │  │ Last Name              │       │
│  └────────────────────────┘  └────────────────────────┘       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Email Address (Read Only)                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────┐      ┌────────────────────────┐       │
│  │      Cancel        │      │    Save Changes        │       │
│  └────────────────────┘      └────────────────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Avatar Picker Logic**
  ```tsx
  const handleChangeAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setAvatarFile(result.assets[0]);
    }
  };
  ```

- **Submit Button**
  ```tsx
  <Pressable onPress={handleSave} disabled={isBusy} className="btn btn-primary">
    {isBusy ? <ActivityIndicator color="#fff" /> : <Text>Save changes</Text>}
  </Pressable>
  ```

## API Integration
- **HTTP client:** `axios` (Mutation hook wrapper).
- **Endpoint:** `PUT /api/users/profile`.
- **Payload Management:**
  - If an image is selected, the payload is converted to `FormData`.
  - If `avatarRemoved` is true, `avatar: null` is sent.
  - Standard JSON is used for text-only updates.
- **Platform Handling:** Uses `fetch/blob` for web file uploads and local path objects for mobile.

## Components Used
- `ImagePicker` (expo-image-picker): For accessing the device's photo library.
- `KeyboardAvoidingView`: To keep inputs visible above the keyboard.
- `Loading`: To prevent empty form display during data fetch.
- `Alert`: For mutation feedback.

## Error Handling
- **Library Permissions:** Checks for media library access and shows a specific error if denied.
- **Required Fields:** Prevents saving if `firstName` or `lastName` are empty.
- **API Errors:** Displays backend validation or size-limit errors via `inlineStatus`.

## Navigation Flow
- Route: `/(authenticated)/profile/edit`.
- **Success:** Returns to the profile view via `router.back()`.
- **Cancel:** Direct `router.back()` call.

## Functions Involved
- **`handleSave`** — Manages payload construction, mutation execution, and Redux sync.
  ```tsx
  const handleSave = useCallback(async () => {
    // ... validation ...
    try {
      let payload = { firstName, lastName, phone };
      if (avatarFile) {
        const fd = new FormData();
        // ... append fields ...
        payload = fd;
      }
      const result = await mutateAsync(payload);
      dispatch(updateUser(result.data.user));
      router.back();
    } catch (err: any) {
      setInlineStatus({ type: 'error', text: err.message });
    }
  }, [...deps]);
  ```
- **`handleChangeAvatar`**: Triggers system photo gallery.
- **`handleRemoveAvatar`**: Resets image state to null.

## Future Enhancements
- Biometric verification before sensitive profile changes.
- Email change flow (requires verification of the new address).
- In-app image cropping and compression.
