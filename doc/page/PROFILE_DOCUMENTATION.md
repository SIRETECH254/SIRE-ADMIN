## Profile Screen Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Profile Overview UI](#profile-overview-ui)
- [Edit Profile UI](#edit-profile-ui)
- [Form Fields](#form-fields)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Future Enhancements](#future-enhancements)

### Imports
Both profile screens rely on shared layout, themed helpers and TanStack Query hooks:

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

import { useGetProfile, useUpdateProfile } from '@/tanstack/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/redux/slices/authSlice';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
```

### Data Sources
- **Primary API**: `GET /api/users/profile` & `PUT /api/users/profile` (see `USER_DOCUMENTATION.md`).
- **TanStack Query hooks**: `useGetProfile()` returns the latest profile payload; `useUpdateProfile()` wraps the update mutation.
- **Redux/Auth context**: `useAuth()` exposes the persisted auth user shape so the screen can show optimistic values while network requests resolve.

### Hooks & State
- `useGetProfile()` powers the read view. Response shape: `{ success, data: { user } }`.
- `useUpdateProfile()` handles form submission, invalidates the profile query and logs success.
- `useAuth()` supplies `user` (for initial values, initials fallback) and `logout()`.
- `useDispatch()` (Redux) lets the edit screen call `updateUser` once the mutation resolves.
- Local component state & helpers:
  - `inlineStatus`: success / error messaging for the edit form.
  - `firstName`, `lastName`, `phone`: controlled inputs, initialised via `useEffect` whenever `profile` changes.
  - `avatarUri`: string pointing at the preview image (server-hosted or locally picked).
  - `avatarFile`: `{ uri, name, type }` payload ready for `FormData` uploads (native only).
  - `avatarRemoved`: boolean flag that indicates the user cleared their avatar; drives `avatar: null` payloads.
  - `isBusy`: derived from the mutation’s `isPending` flag.
  - `initials`, `currentAvatar`: memoised fallbacks used across both overview and edit UIs.

### Profile Overview UI
- Overall layout: `ThemedView` → `ScrollView` so long bios fit comfortably.
- Header stack includes:
  - Circular avatar (image if `user.avatar`, otherwise initials badge).
  - Name + role pill + status text.
- Summary cards highlight:
  - Contact panel (email, phone).
  - Account panel (role, active flag, created/updated timestamps formatted with `Intl.DateTimeFormat`).
- Primary CTA: “Edit Profile” button navigates to `/(authenticated)/profile/edit` via `useRouter().push`.
- Loading overlay uses `<Loading fullScreen />`. Errors display `<Alert variant="error" />` inline to keep context on screen.

### Edit Profile UI
- Screen title: “Edit Profile”. Uses `KeyboardAvoidingView` + `ScrollView` for mobile ergonomics.
- Avatar picker block:
  - `Pressable` opens the system library via Expo `ImagePicker`.
  - Successful selection updates the preview immediately and stores the file metadata for submission.
  - A “Remove avatar” CTA appears when an avatar exists (either from the API or a newly picked file). Tapping it clears local state and sends `avatar: null` on save.
- Form inputs:
  - `TextInput` for `firstName`, `lastName`, `phone` (phone optional per backend schema).
  - Email shown but locked for editing (disabled field with grey styling).
  - Validation ensures required fields (`firstName`, `lastName`) and basic phone trimming.
- Action row:
  - “Cancel” → `router.back()`.
  - “Save changes” triggers `useUpdateProfile().mutateAsync`.
  - Loading state shows `ActivityIndicator` and disables buttons.

### Form Fields
| Field | API Key | Behaviour |
| --- | --- | --- |
| First Name | `firstName` | Required. Trimmed before submission. |
| Last Name | `lastName` | Required. Trimmed before submission. |
| Email | `email` | Read-only in UI to avoid accidental changes. |
| Phone | `phone` | Optional. Normalised by trimming whitespace. |
| Avatar | `avatar` | Tap to pick a new image; native builds send multipart `FormData`, web fetches the blob before append. Removing the avatar sends `avatar: null`. |

### Mutation & Cache Behaviour
- On success the mutation handler:
  - Invalidates `['user','profile']` query (handled inside hook).
  - Dispatches `updateUser(updatedUser)` to refresh Redux/auth state so headers reflect the new avatar and name without a relog.
  - Shows a success `Alert` and navigates back after a short delay.
- Payload logic:
  - When `avatarFile` is present the screen builds a `FormData` payload (`firstName`, `lastName`, optional `phone`, `avatar` file).
  - Web targets fetch the local URI first (to obtain a `Blob`) before appending.
  - When the user removes the avatar the mutation sends JSON `{ avatar: null, firstName, lastName, phone? }`.
- On error the inline status block renders the backend message from `error.response?.data?.message`.

### Navigation Flow
- `/(authenticated)/profile/index.tsx` loads on sidebar “Profile”.
- Pressing “Edit Profile” pushes to `/(authenticated)/profile/edit`.
- Successful save pops back to the overview. Cancel also calls `router.back()`.
- If an unauthenticated user is detected, the parent layout already redirects to login via the `AuthenticatedLayout` guard.

### Error & Loading States
- Read screen: `Loading` spinner during initial fetch; `Alert` if the API request fails.
- Edit screen: disables CTA while submitting; shows inline success/error messages above the buttons; safe to retry without leaving the screen.
- Network failures do not mutate stored profile — the UI keeps previous values until a successful response arrives.

### Future Enhancements
- Add proper phone number masking and validation.
- Display audit history (last login, last password change) once exposed by the API.
- Consider optimistic updates by writing directly to the profile query cache when backend latency is high.
- Support camera capture in addition to library selection for the avatar picker.
