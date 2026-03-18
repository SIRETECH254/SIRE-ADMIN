# Contact List Screen Documentation

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
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { useGetAllMessages, useMarkMessageAsRead, useArchiveMessage, useDeleteMessage } from '@/tanstack/useContact';
import { ThemedText, ThemedView } from '@/components/themed-text';
import StatusBadge from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
```

## Context and State Management
- **TanStack Query Hooks:**
  - `useGetAllMessages(params)`: Primary hook for fetching searchable and filtered contact inquiries.
- **TanStack Mutation Hooks:**
  - `useMarkMessageAsRead()`: Transitions a message from 'unread' to 'read' state.
  - `useArchiveMessage()`: Moves a message to the archive status.
  - `useDeleteMessage()`: Permanently removes a message record.
- **Local State:**
  - `filterStatus`: Selection for the status dropdown (Unread, Read, Replied, Archived).
  - `searchQuery`: Tracks the text-based filter for name, email, or subject.
  - `confirmDelete`, `confirmArchive`: Objects storing message IDs and metadata for the confirmation modals.
  - `actionError`: Specifically captures feedback from failed mutation attempts.

## UI Structure
- **Screen Shell:** `ThemedView` providing theme-responsive backgrounds.
- **Header Section:** Dynamic title and description summary.
- **Toolbar:** Integrated row containing a `Picker` for status filtering and a `TextInput` for text-based searching.
- **Message Feed:** A vertical `ScrollView` of custom cards. Unread messages feature a distinctive border and a primary-colored dot indicator.
- **Administrative Modals:** Separate `Modal` components for confirming archive and delete actions.

## Planned Layout
```
┌───────────────────────────────┐
│     Contact Messages (H1)     │
├───────────────────────────────┤
│ [Status ▼] [Search Bar       ]│
├───────────────────────────────┤
│  Message Card (Unread)        │
│  ┌─────────────────────────┐  │
│  │ ● Inquiry from John Doe │  │
│  │ Subject: Collaboration  │  │
│  │ [View] [Reply] [Archive]│  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  Message Card (Read)          │
│  ┌─────────────────────────┐  │
│  │ Inquiry from Jane Smith │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  Messages    │           [🔍 Search inquiries...]          │
│  └──────────────┘                                             │
│                                                               │
│  [Status: All ▼]                                  [Clear]     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ● Project Inquiry                 [ UNREAD ]          │   │
│  │  From: Alice Wonderland                                │   │
│  │  I would like to discuss...                            │   │
│  │  2 hours ago             Actions: [👁][✉][📥][🗑]       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │    Support Request                 [ REPLIED ]         │   │
│  │  From: Bob Builder                                     │   │
│  │  The app is crashing on...                             │   │
│  │  Yesterday               Actions: [👁][📥][🗑]          │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Status Badges:** Uses `StatusBadge` with a custom mapping (`unread` ➞ error, `replied` ➞ success, `archived` ➞ info).
- **Sender Info:** Displays both the full name and email address.
- **Message Preview:** Uses `numberOfLines={2}` to show a snippet of the inquiry without overwhelming the list.
- **Action Buttons:** Contextual buttons that change based on status (e.g., "Mark as Read" only appears for unread items).

## API Integration
- **Endpoints:**
  - `GET /api/contact`: List messages with filters.
  - `PATCH /api/contact/:id/read`: Update status.
  - `PATCH /api/contact/:id/archive`: Update status.
  - `DELETE /api/contact/:id`: Remove record.
- **Query Params:**
  ```tsx
  { status?: string, search?: string }
  ```

## Components Used
- `StatusBadge`: For state visualization.
- `Modal`: Custom confirm dialog with `showAccentStrip`.
- `Picker` (@react-native-picker/picker): For data filtering.
- `Alert`: For mutation feedback.

## Error Handling
- **API Errors:** Displays a full-width `Alert` variant "error" above the message list.
- **Empty States:** Shows a "No contact messages found" illustration using MaterialIcons.
- **Modal Feedback:** Displays specific error messages *inside* the modal to prevent user confusion during retries.

## Navigation Flow
- Route: `/(authenticated)/contact`.
- **View Detail:** `router.push(/(authenticated)/contact/[id])`.
- **Reply:** `router.push(/(authenticated)/contact/[id]/reply)`.

## Functions Involved
- **`handleMarkAsRead`** — Direct mutation call with a local busy state indicator.
  ```tsx
  const handleMarkAsRead = useCallback(async (messageId: string) => {
    try {
      await markAsReadAsync(messageId);
      await refetch();
    } catch (err) { /* silent fail, mutation handles UI */ }
  }, [markAsReadAsync, refetch]);
  ```
- **`handleConfirmArchive` / `handleConfirmDelete`:** Administrative workflows involving modals and sequential state updates.

## Future Enhancements
- Bulk archive: Select multiple messages to clear the inbox.
- Tagging system: Categorize inquiries (e.g., Sales, Support, Billing).
- Auto-responder: Toggle automated "received" messages for new unread items.
