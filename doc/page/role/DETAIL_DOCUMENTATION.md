# Role Detail Screen Documentation

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
import { View, Text, ScrollView } from 'react-native';
import { useGetRole } from '@/tanstack/useRoles';
```

## Context and State Management
- **Query:** `useGetRole`.

## UI Structure
- Role info, Permissions list, Associated Users.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back      Admin            │
├───────────────────────────────┤
│  Permissions:                 │
│  - All Access                 │
├───────────────────────────────┤
│  Users (5):                   │
│  - User A                     │
│  - User B                     │
├───────────────────────────────┤
│        [ Edit ]               │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌──────┐                    │
│  │  < Roles     │                 │ Edit │                    │
│  └──────────────┘                 └──────┘                    │
│                                                               │
│         ┌──────────┐                                          │
│         │    🛡️    │                                          │
│         └──────────┘                                          │
│        Project Manager                                        │
│                                                               │
│  Permissions                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ✓ Create Projects                                     │   │
│  │  ✓ View Invoices                                       │   │
│  │  ✓ Edit Tasks                                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Assigned Users (3)                                           │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Alice Smith                                           │   │
│  │  Bob Jones                                             │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Details.

## API Integration
- `GET /api/roles/:id`.
- `GET /api/roles/:id/users`.

## Components Used
- `Card`.

## Error Handling
- Not found.

## Navigation Flow
- Edit ➞ `/(authenticated)/roles/[id]/edit`.

## Functions Involved
- **`handleDelete`**.

## Future Enhancements
- Assign users directly from here.
