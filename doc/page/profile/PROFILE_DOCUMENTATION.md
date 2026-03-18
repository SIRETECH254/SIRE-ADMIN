# Profile Screen Documentation

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
import React, { useMemo } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
import { getInitials, formatDate, getRoleNames } from '@/utils';
import StatusBadge from '@/components/ui/StatusBadge';
```

## Context and State Management
- **TanStack Query:** `useGetProfile()` fetches the authenticated user's current profile data.
- **Context Provider:** `useAuth()` provides the base `user` object as a fallback during loading or offline states.
- **Theme Logic:** `useThemeToggle()` is used to adjust icon colors dynamically based on the current color scheme.
- **Derived State:**
  - `profile`: Combines TanStack data with Context data for a resilient profile object.
  - `rolesDisplay`: Formats the roles array into a comma-separated string for display.
  - `initials`: Memoized string for the avatar fallback.

## UI Structure
- **Screen Shell:** `ThemedView` providing theme-responsive backgrounds.
- **Hero Section:** Centered profile display with avatar (remote or initials), full name, and primary status badges.
- **Edit CTA:** Primary action button to navigate to the edit flow.
- **Contact Information Card:** Labeled metadata for Email and Phone.
- **Account Details Card:** Detailed system information including roles, verification status, and timestamps.
- **Interaction:** `RefreshControl` integrated into the `ScrollView` for manual data syncing.

## Planned Layout
```
┌───────────────────────────────┐
│        Profile (H1)           │
├───────────────────────────────┤
│           [ Avatar ]          │
│           Admin User          │
│    [ Admin ]  [ Active ]      │
├───────────────────────────────┤
│        [ Edit Profile ]       │
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Contact Information     │  │
│  │ Email: admin@sire.com   │  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Account Details         │  │
│  │ Verified: [ YES ]       │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │   Profile    │                 [ 🔄 Pull to Refresh ]      │
│  └──────────────┘                                             │
│                                                               │
│         ┌──────────┐                                          │
│         │    👤    │                                          │
│         └──────────┘                                          │
│        Super Admin                                            │
│        [ Active ]                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Edit Profile                                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Account Summary                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  📧 admin@sire.com                                     │   │
│  │  📞 +254 700 000 000                                   │   │
│  │  🛡️ Roles: Super Admin, Manager                        │   │
│  │  ✅ Verified: [ Verified ]                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  System Info                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  📅 Created: Oct 10, 2023                              │   │
│  │  🕒 Updated: Oct 24, 2023                              │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Avatar:** Large circular display using `Image` with remote URI or a colored `View` with initials.
- **Status Badges:** Uses `StatusBadge` for "user-role", "user-status", and "verification-status" types.
- **Metadata Rows:** Key-value pairs rendered via the `ProfileRow` helper function, including MaterialIcons.

## API Integration
- **Endpoint:** `GET /api/users/profile`.
- **Response Shape:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "firstName": "...",
        "roles": [{ "name": "..." }],
        "emailVerified": true,
        "createdAt": "..."
      }
    }
  }
  ```

## Components Used
- `StatusBadge`: For semantic role and status visualization.
- `Loading`: Centered full-screen fetch state.
- `RefreshControl`: Standard React Native pull-to-refresh.
- `ThemedView`: Theme-aware root component.

## Error Handling
- **Fetch Error:** Displays an `Alert` component with the backend error message at the top of the content.
- **Missing Data:** Uses the `user` object from `AuthContext` as a reliable fallback if the API call is in progress or fails.
- **Data Fallbacks:** Strings like "Not provided" or "—" are used for empty profile fields.

## Navigation Flow
- Route: `/(authenticated)/profile/index`.
- **Edit:** `router.push(/(authenticated)/profile/edit)`.
- **Back:** Standard Tab or Sidebar navigation.

## Functions Involved
- **`getRoleNames`**: Extracts and flattens roles from the user object.
- **`formatDate`**: Sanitizes ISO strings for display.
- **`ProfileRow`**: Reusable functional component for row-based metadata.
  ```tsx
  function ProfileRow({ label, value, icon, iconColor, badgeContent }) {
    return (
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialIcons name={icon} />
          <Text>{label}</Text>
        </View>
        {badgeContent || <Text>{value}</Text>}
      </View>
    );
  }
  ```

## Future Enhancements
- Password Change Trigger: Direct link to the change password flow.
- Login Activity: List of recent sessions and devices.
- Account Deletion: Secure flow for self-service account removal.
