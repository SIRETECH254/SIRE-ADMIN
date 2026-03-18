# Contact Detail Screen Documentation

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
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useGetMessage, useMarkMessageAsRead, useArchiveMessage, useDeleteMessage } from '@/tanstack/useContact';
import StatusBadge from '@/components/ui/StatusBadge';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
```

## Context and State Management
- **TanStack Query:** `useGetMessage(id)` fetches the full inquiry document, including the original message and any existing reply data (repliedBy, repliedAt, reply text).
- **TanStack Mutations:**
  - `useMarkMessageAsRead()`: For unread-to-read transition.
  - `useArchiveMessage()`: For status updates.
  - `useDeleteMessage()`: For record removal.
- **Local State:**
  - `activeAction`: Tracks whether the 'archive' or 'delete' modal is currently open.
  - `inlineStatus`: Manages success alerts after status changes.
  - `actionError`: Specifically captures feedback for failed modal actions.
- **Derived Logic:** Boolean flags like `isUnread` and `isReplied` determine button visibility and styling.

## UI Structure
- **Screen Shell:** `ThemedView` with standard responsive padding.
- **Status Header:** Combined row showing Inquiry Title, creation date, and current `StatusBadge`.
- **Action Toolbar:** Row of buttons (Mark as Read, Reply, Archive, Delete) that adapt based on message status.
- **Information Grid:**
  - **Sender Card:** Grouped metadata for Name, Email, and Phone.
  - **Message Card:** Full inquiry subject and multiline body content.
  - **Reply History Card:** (Conditional) Displays the reply text, responder's name, and timestamp if already addressed.
- **Confirmation Modals:** Context-aware modals for destructive actions.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back      Message Detail   │
├───────────────────────────────┤
│  Subject: Project Inquiry     │
│  [ SENT ]  (Status Badge)     │
├───────────────────────────────┤
│  [ Read ] [ Reply ] [ Archive ]│
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Sender: John Doe        │  │
│  │ Email: john@example.com │  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  Message Body:                │
│  "Hello, I would like to..."  │
├───────────────────────────────┤
│  [ Reply Section / History ]  │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌──────┐  ┌──────┐          │
│  │  < Messages  │                 │ Del  │  │ Arch │          │
│  └──────────────┘                 └──────┘  └──────┘          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Project Inquiry                              [ READ ]  │   │
│  │  Received: Oct 24, 2023 10:30 AM                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Sender Details                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  👤 Alice Wonderland                                   │   │
│  │  📧 alice@example.com                                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Message Content                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  I came across your portfolio and I would like to      │   │
│  │  discuss a potential collaboration...                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Send Reply                                            │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Reply Status:** If `status === 'replied'`, the "Reply" button is hidden, and the "Reply History" section is shown.
- **Formatted Dates:** All timestamps passed through `formatDate` utility.
- **Icons:** Uses MaterialIcons for semantic categorization (person, email, subject, event).

## API Integration
- **Endpoints:**
  - `GET /api/contact/:id`: Fetch single record.
  - `PATCH /api/contact/:id/read`: Status update.
  - `PATCH /api/contact/:id/archive`: Status update.
  - `DELETE /api/contact/:id`: Record removal.

## Components Used
- `StatusBadge`: For inquiry state visualization.
- `Loading`: Centered full-screen fetch state.
- `Modal`: For confirming archive/delete.
- `Alert`: For action feedback.
- `InfoRow`: Custom metadata layout.

## Error Handling
- **Route Error:** Displays error if `id` is missing.
- **Fetch Error:** Descriptive full-screen alert with a manual retry action.
- **Mutation Errors:** Captured in `actionError` and displayed *inside* the active modal to allow retry without closure.

## Navigation Flow
- Route: `/(authenticated)/contact/[id]`.
- **Reply Action:** Navigates to `/(authenticated)/contact/[id]/reply`.
- **Delete Success:** `router.replace(/(authenticated)/contact)` to clear history.

## Functions Involved
- **`performAction`** — Executes the currently active modal mutation.
  ```tsx
  const performAction = useCallback(async () => {
    if (!messageId || !activeAction) return;
    try {
      if (activeAction === 'delete') {
        await deleteMessageAsync(messageId);
        router.replace('/(authenticated)/contact');
      } else if (activeAction === 'archive') {
        await archiveMessageAsync(messageId);
        await refetch();
      }
      setActiveAction(null);
    } catch (err: any) {
      setActionError(err.message);
    }
  }, [...deps]);
  ```
- **`handleMarkAsRead`**: Direct mutation for unread items.

## Future Enhancements
- Email Threading: View all previous messages from the same sender.
- Internal Notes: Add comments for other admins that are not sent to the user.
- Spam Filter: Direct "Mark as Spam" action.
