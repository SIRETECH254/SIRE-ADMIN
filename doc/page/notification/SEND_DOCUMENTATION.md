# Send Notification Screen Documentation

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
import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { useSendNotification, useSendBulkNotification } from '@/tanstack/useNotifications';
```

## Context and State Management
- **Mutations:** `useSendNotification`, `useSendBulkNotification`.
- **State:** `recipientId` (or 'all'), `title`, `message`, `category`.

## UI Structure
- Admin form to broadcast or direct-message notifications.

## Planned Layout
```
┌───────────────────────────────┐
│      Send Notification        │
├───────────────────────────────┤
│  To: [ User Search / All ]    │
├───────────────────────────────┤
│  Title: [ Input ]             │
├───────────────────────────────┤
│  Message: [ Multiline ]       │
├───────────────────────────────┤
│  Category: [ System/Promo ]   │
├───────────────────────────────┤
│        [ Send Now ]           │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Back      │     Broadcast                               │
│  └──────────────┘                                             │
│                                                               │
│  Recipients                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Select Users... (or All)                           ▼  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Notification Content                                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Title: Maintenance Update                             │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Message: We will be offline for...                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Send Notification                                     │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- `TextInput`, `Picker` (for Category).
- `UserSelector` (Multi-select or Search).

## API Integration
- `POST /api/notifications` (direct).
- `POST /api/notifications/bulk` (super admin).

## Components Used
- `TextInput`, `Picker`.

## Error Handling
- Permission denied (if not admin).
- Empty title/message validation.

## Navigation Flow
- Success ➞ Back to List.

## Functions Involved
- **`handleSend`**.

## Future Enhancements
- Schedule notification for later.
- Push notification preview.
