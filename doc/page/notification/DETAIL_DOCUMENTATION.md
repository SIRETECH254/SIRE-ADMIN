# Notification Detail Screen Documentation

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
import { View, Text } from 'react-native';
import { useGetNotification, useMarkAsRead } from '@/tanstack/useNotifications';
```

## Context and State Management
- **Query:** `useGetNotification`.
- **Effect:** Mark as read on mount.

## UI Structure
- Full notification message and deep-link action.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back      Notification     │
├───────────────────────────────┤
│  Title: New Invoice           │
│  Date: Oct 24, 2023           │
├───────────────────────────────┤
│  Message:                     │
│  A new invoice has been       │
│  generated for your recent    │
│  project...                   │
├───────────────────────────────┤
│       [ View Invoice ]        │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌──────┐                    │
│  │  < Back      │                 │ Delete│                    │
│  └──────────────┘                 └──────┘                    │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Invoice #INV-2023-001 Created                         │   │
│  │  Oct 24, 2023 11:00 AM                                 │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Hello,                                                │   │
│  │  A new invoice has been created for your project       │   │
│  │  'Website Redesign'. Please review and pay.            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  View Linked Invoice                                   │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Detailed text and actionable deep link.

## API Integration
- `GET /api/notifications/:id`.

## Components Used
- `Card`.

## Error Handling
- Not found.

## Navigation Flow
- Action Button ➞ Linked resource (Invoice/Project/Payment).

## Functions Involved
- **`handleMarkRead`**.

## Future Enhancements
- "Mark as Unread" toggle.
