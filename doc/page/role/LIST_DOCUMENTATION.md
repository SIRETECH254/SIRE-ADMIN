# Role List Screen Documentation

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
import { useGetAllRoles } from '@/tanstack/useRoles';
```

## Context and State Management
- **Query:** `useGetAllRoles`.

## UI Structure
- List of roles.

## Planned Layout
```
┌───────────────────────────────┐
│        Roles                  │
├───────────────────────────────┤
│  Super Admin                  │
│  Users: 2                     │
├───────────────────────────────┤
│  Client                       │
│  Users: 50                    │
├───────────────────────────────┤
│           ...                 │
│                       [ + ]   │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  Roles       │           [🔍 Search]                       │
│  └──────────────┘                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Super Admin                                           │   │
│  │  Full access to all system features.                   │   │
│  │  Users: 2                                              │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Project Manager                                       │   │
│  │  Can manage projects and invoices.                     │   │
│  │  Users: 5                                              │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│                                             ┌──────────┐      │
│                                             │    +     │      │
│                                             │   FAB    │      │
│                                             └──────────┘      │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Role Name, Description, User Count.

## API Integration
- `GET /api/roles`.

## Components Used
- `FlatList`.

## Error Handling
- List error.

## Navigation Flow
- Tap ➞ `/(authenticated)/roles/[id]`.
- FAB ➞ `/(authenticated)/roles/create`.

## Functions Involved
- **`renderItem`**.

## Future Enhancements
- Role permissions matrix view.
