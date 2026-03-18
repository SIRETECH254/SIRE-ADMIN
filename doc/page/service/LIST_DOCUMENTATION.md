# Service List Screen Documentation

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
import { useGetServices } from '@/tanstack/useServices';
```

## Context and State Management
- **Query:** `useGetServices`.

## UI Structure
- Grid or List of services.

## Planned Layout
```
┌───────────────────────────────┐
│        Services               │
├───────────────────────────────┤
│  [ Icon ] Web Dev    $1000    │
│  [ Active ]                   │
├───────────────────────────────┤
│  [ Icon ] SEO        $500     │
│  [ Inactive ]                 │
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
│  │  Services    │           [🔍 Search]                       │
│  └──────────────┘                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ┌──────┐                                              │   │
│  │  │ 🌐   │  Web Development                             │   │
│  │  └──────┘  Base Price: $1,000                          │   │
│  │            [ ACTIVE ]                                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ┌──────┐                                              │   │
│  │  │ 📱   │  Mobile App Dev                              │   │
│  │  └──────┘  Base Price: $5,000                          │   │
│  │            [ ACTIVE ]                                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│                                             ┌──────────┐      │
│                                             │    +     │      │
│                                             │   FAB    │      │
│                                             └──────────┘      │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Icon, Name, Price, Status.

## API Integration
- `GET /api/services`.

## Components Used
- `FlatList`.

## Error Handling
- List error.

## Navigation Flow
- Tap ➞ `/(authenticated)/services/[id]`.
- FAB ➞ `/(authenticated)/services/create`.

## Functions Involved
- **`renderItem`**.

## Future Enhancements
- Reorder services.
