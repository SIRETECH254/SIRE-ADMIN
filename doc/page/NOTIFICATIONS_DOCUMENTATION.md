## Notifications Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Notifications List UI](#notifications-list-ui)
- [Notification Detail UI](#notification-detail-ui)
- [Settings UI](#settings-ui)
- [Send Notification UI](#send-notification-ui)
- [Filters](#filters)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Wireframes](#wireframes)
- [Future Enhancements](#future-enhancements)

### Imports
The Notifications screens reuse shared layout, themed helpers, and TanStack Query hooks:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDate } from '@/utils';
import {
  useGetUserNotifications,
  useGetNotification,
  useGetUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useSendNotification,
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/tanstack/useNotifications';
import { useGetAllUsers } from '@/tanstack/useUsers';
import { useGetClients } from '@/tanstack/useClients';
```

### Data Sources
- Primary API (see server docs `SIRE-API/doc/NOTIFICATION_DOCUMENTATION.md`):
  - `GET /api/notifications` (list with filters)
  - `GET /api/notifications/:notificationId` (details)
  - `GET /api/notifications/unread-count` (unread count)
  - `GET /api/notifications/unread` (unread list)
  - `GET /api/notifications/category/:category` (by category)
  - `PATCH /api/notifications/:notificationId/read` (mark as read)
  - `PATCH /api/notifications/read-all` (mark all as read)
  - `DELETE /api/notifications/:notificationId` (delete)
  - `POST /api/notifications` (send notification - admin)
  - `POST /api/notifications/bulk` (bulk send - super admin)
  - `GET /api/users/notifications` (preferences)
  - `PUT /api/users/notifications` (update preferences)
- TanStack Query hooks:
  - `useGetUserNotifications(params)` for list
  - `useGetNotification(notificationId)` for details
  - `useGetUnreadCount()` for header badge
  - `useMarkAsRead()` for marking single notification
  - `useMarkAllAsRead()` for marking all as read
  - `useDeleteNotification()` for delete
  - `useSendNotification()` for sending notifications (admin)
  - `useGetNotificationPreferences()` for preferences
  - `useUpdateNotificationPreferences()` for updating preferences

### Hooks & State
- List screen:
  - Local: `filterCategory`, `filterStatus` (read/unread)
  - Query: `useGetUserNotifications(params)` providing `{ data, isLoading }`
  - Query: `useGetUnreadCount()` for header badge
  - Mutations: `useMarkAsRead()`, `useMarkAllAsRead()`, `useDeleteNotification()`
- Detail screen:
  - Param: `id` from route
  - Query: `useGetNotification(notificationId)`
  - Mutations: `useMarkAsRead()`, `useDeleteNotification()`
- Settings screen:
  - Query: `useGetNotificationPreferences()` for initial values
  - Mutation: `useUpdateNotificationPreferences()`
  - Local: `email`, `sms`, `inApp`, `categoryPreferences`, `inlineStatus`
- Send screen:
  - Mutation: `useSendNotification()`
  - Supporting queries: `useGetAllUsers()`, `useGetClients()` for recipient selection
  - Local: `recipient`, `recipientModel`, `type`, `category`, `subject`, `message`, `metadata`, `inlineStatus`
- Header:
  - Query: `useGetUnreadCount()` for badge display

### Notifications List UI
- Scrollable list/card view (NO table structure):
  - Each notification as a card/row showing: Category badge, Subject, Message preview, Type, Read status indicator, Created date
  - Filters toolbar: Category filter (all | general | project | invoice | payment | quotation), Read/Unread filter (all | read | unread)
  - "Mark All as Read" button at top
  - "Send Notification" button (admin only) in header/toolbar
  - Actions per notification: Mark as Read, View, Delete
  - NO search, NO pagination, NO table structure
  - Display all notifications (no pagination)

### Notification Detail UI
- Notification header: Category badge, Subject, Type, Status, Read status
- Full message display
- Metadata section (if exists)
- Created/Sent dates
- Action buttons: Mark as Read (if unread), Delete
- Bidirectional actions: Render action buttons if notification.actions exists
- Handle action clicks: API calls for 'api' type, navigation for 'navigate' type
- View related resource link (if metadata available)

### Settings UI
- Notification preferences form:
  - Email toggle
  - SMS toggle
  - In-app toggle
  - Category-specific preferences (invoice, payment, project, quotation, general)
- Save button with loading state
- Inline success/error messages

### Send Notification UI
- Form fields:
  - Recipient Model: Radio buttons (User/Client)
  - Recipient: Picker (populated based on recipientModel)
  - Type: Picker (email, sms, in_app, push)
  - Category: Picker (invoice, payment, project, quotation, general)
  - Subject: TextInput (required)
  - Message: TextInput multiline (required)
  - Metadata: Optional JSON input or key-value pairs
- Submit button with loading state
- Inline success/error messages
- On success: Show success message, navigate back or reset form

### Filters
- Category filter: all | general | project | invoice | payment | quotation
- Read/Unread filter: all | read | unread
- Display all notifications (no pagination)
- Filtering happens client-side or via API params (category, status)

### Mutation & Cache Behaviour
- `useMarkAsRead()` invalidates:
  - `['notifications']`
  - `['notification', notificationId]`
  - `['notifications', 'unread-count']`
  - `['notifications', 'unread']`
- `useMarkAllAsRead()` invalidates:
  - `['notifications']`
  - `['notifications', 'unread-count']`
  - `['notifications', 'unread']`
- `useDeleteNotification()` invalidates:
  - `['notifications']`
  - `['notifications', 'unread-count']`
- `useSendNotification()` invalidates `['notifications']`
- `useUpdateNotificationPreferences()` invalidates `['notifications', 'preferences']`
- Success flows show success `Alert`, then navigate back or to details
- Errors display backend messages from `error.response?.data?.message`

### Navigation Flow
- Sidebar "Notifications" → `/(authenticated)/notifications/index.tsx`
- "View" action → `/(authenticated)/notifications/[id].tsx`
- "Settings" link → `/(authenticated)/notifications/settings.tsx`
- "Send Notification" button → `/(authenticated)/notifications/send.tsx`
- Header notification icon → `/(authenticated)/notifications/index.tsx`

### Error & Loading States
- List:
  - Loading: 5 skeleton rows (bg-gray-300, rounded, `animate-pulse`)
  - Error: full-width message with inline `Alert`
  - Empty: full-width "No notifications found" message
- Detail: `Loading` for fetch; `Alert` for errors
- Settings: Loading state during fetch; inline success/error messages
- Send: Disabled submit while sending; inline success/error; safe retries
- Header: Unread count badge updates in real-time

### Wireframes

Notifications List (scrollable list, NO table):

```text
┌────────────────────────────────────────────────────────────┐
│ [Filters: Category ▼] [Read/Unread ▼] [Mark All as Read]  │
├────────────────────────────────────────────────────────────┤
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │ ← Skeleton row x5
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│ …                                                          … │
├────────────────────────────────────────────────────────────┤
│ [Notification Card]                                        │
│ [Category Badge] Subject                                    │
│ Message preview...                                          │
│ [Mark as Read] [View] [Delete]                             │
├────────────────────────────────────────────────────────────┤
│ [Notification Card]                                         │
│ …                                                           │
└────────────────────────────────────────────────────────────┘
```

Notification Detail:

```text
[ Notification ID ]
Subject               [Category Badge]

[ Mark as Read ] [ Delete ]
────────────────────────────────
Type: in_app
Status: sent
Read: Yes/No
Created: Date
Sent: Date

Message:
Full message content here...

Metadata:
{ ... }

[Action Buttons] (if actions exist)
```

### Future Enhancements
- Push notifications (Firebase Cloud Messaging)
- Real-time updates via Socket.io
- Notification templates
- Notification grouping
- Advanced filtering (date range, type filter)
- Export notifications (CSV)
- Notification scheduling
- Rich notifications with images

