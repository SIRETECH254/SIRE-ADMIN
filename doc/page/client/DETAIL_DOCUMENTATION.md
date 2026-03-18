# Client Detail Screen Documentation

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
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetUserById } from '@/tanstack/useUsers';
import { getInitials, formatDate } from '@/utils';
import StatusBadge from '@/components/ui/StatusBadge';
```

## Context and State Management
- **TanStack Query:** `useGetUserById(id)` fetches the complete user profile for the client role.
- **Route Params:** `id` is retrieved from the dynamic route `/(authenticated)/clients/[id]`.
- **Derived Logic:**
  - `initials`: Memoized string generated from first/last names or email for the avatar fallback.
  - `client`: Normalized data object extracted from the query response.

## UI Structure
- **Screen Shell:** `ThemedView` with a theme-aware background.
- **Hero Section:** Centered avatar (image or initials) with client name and status badges (Verification, Account Status).
- **Primary CTA:** Centered "Edit Client" button.
- **Information Blocks:**
  - **Contact Information Card:** Email, Phone, and Company metadata.
  - **Address Card:** Location details (Address, City, Country).
  - **Account Details Card:** System metadata including creation and last-update timestamps.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back      Client Profile   │
├───────────────────────────────┤
│           [ Avatar ]          │
│           John Doe            │
│    [ VERIFIED ] [ ACTIVE ]    │
├───────────────────────────────┤
│        [ Edit Client ]        │
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Contact Information     │  │
│  │ Email: john@example.com │  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Address                 │  │
│  │ Nairobi, Kenya          │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Clients   │                 Client Details              │
│  └──────────────┘                                             │
│                                                               │
│         ┌──────────┐                                          │
│         │    👤    │                                          │
│         └──────────┘                                          │
│        John Doe                                               │
│        [ Verified ] [ Active ]                                │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Edit Client                                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Contact Info                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  📧 john@example.com                                   │   │
│  │  📞 +254 712 345 678                                   │   │
│  │  🏢 Acme Corp                                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Address                                                      │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  📍 123 Main St, Nairobi, Kenya                        │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Identity Display:** Large avatar using `Image` if a URL exists, otherwise a styled `View` with initials.
- **Status Mapping:** Direct mapping of `emailVerified` and `isActive` booleans to semantic badges.
- **Metadata:** Formatted dates for "Created" and "Updated" timestamps using the `formatDate` utility.

## API Integration
- **Endpoint:** `GET /api/users/:id`.
- **Response Shape:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "firstName": "...",
        "lastName": "...",
        "email": "...",
        "isActive": true,
        "emailVerified": true,
        "address": "...",
        "createdAt": "..."
      }
    }
  }
  ```

## Components Used
- `StatusBadge`: For verifying account and activity states.
- `Loading`: Centered full-screen loading indicator.
- `Alert`: For handling invalid ID or fetch errors.
- `InfoRow`: Custom layout component for labeled metadata.

## Error Handling
- **Query Error:** Displays a full-width `Alert` with a "Retry" button.
- **ID Validation:** Checks if the `id` param is missing and shows a specific error message.
- **Data Fallbacks:** Uses "—" or "Not provided" strings for null fields like phone or address.

## Navigation Flow
- Route: `/(authenticated)/clients/[id]`.
- **Edit:** `router.push(/(authenticated)/clients/[id]/edit)`.
- **Back:** Standard `router.back()` behavior to return to the list.

## Functions Involved
- **`formatDate`**: Standardizes date presentation across the app.
- **`getInitials`**: Computes the 2-letter avatar string.
  ```tsx
  const initials = useMemo(() => getInitials(clientData), [clientData]);
  ```

## Future Enhancements
- Client Activity Log: Timeline of invoices and payments.
- Project Quick-Link: List of active projects associated with this client.
- Notes Section: Private admin notes about the client relationship.
