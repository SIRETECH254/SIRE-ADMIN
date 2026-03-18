# Notification List Screen Documentation

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
import React from 'react';
import { FlatList } from 'react-native';
import { useGetUserNotifications, useMarkAllAsRead } from '@/tanstack/useNotifications';
```

## Context and State Management
- **Query Hook:** `useGetUserNotifications` fetches the user's notification feed.
- **Mutation:** `useMarkAllAsRead` for clearing the unread badge.
- **Local State:** Tab filter (All, Unread, System).

## UI Structure
- List of notifications with unread indicators.

## Planned Layout
```
┌───────────────────────────────┐
│       Notifications           │
├───────────────────────────────┤
│  ● New Invoice Created        │
│    INV-001 has been...        │
├───────────────────────────────┤
│    Payment Successful         │
│    Your payment of $150...    │
├───────────────────────────────┤
│          ...                  │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌─────────────┐             │
│  │ Notifications│                 │ Mark All Read│             │
│  └──────────────┘                 └─────────────┘             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ● New Project Assigned                                │   │
│  │  You have been assigned to 'Website Redesign'.         │   │
│  │  10 mins ago                                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │    Invoice Overdue                                     │   │
│  │    Invoice #INV-2023-005 is past due.                  │   │
│  │  Yesterday                                             │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Title, Body, Timestamp, Unread Dot.

## API Integration
- `GET /api/notifications`.
- `PATCH /api/notifications/read-all`.

## Components Used
- `FlatList`, `IconSymbol`.

## Error Handling
- Fetch errors.

## Navigation Flow
- Tap ➞ `/(authenticated)/notifications/[id]`.
- Settings ➞ `/(authenticated)/notifications/settings`.

## Functions Involved
- **`onPressNotification`**: Marks as read and navigates to relevant target (e.g., Invoice).

## Future Enhancements
- Group by date.
