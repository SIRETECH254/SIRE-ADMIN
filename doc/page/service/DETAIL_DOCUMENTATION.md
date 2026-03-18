# Service Detail Screen Documentation

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
import { useGetService } from '@/tanstack/useServices';
```

## Context and State Management
- **Query:** `useGetService`.

## UI Structure
- Service info.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back      Web Dev          │
├───────────────────────────────┤
│  Price: $1000                 │
│  Status: Active               │
├───────────────────────────────┤
│  Description:                 │
│  Full stack development...    │
├───────────────────────────────┤
│        [ Edit ]               │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌──────┐                    │
│  │  < Services  │                 │ Edit │                    │
│  └──────────────┘                 └──────┘                    │
│                                                               │
│         ┌──────────┐                                          │
│         │    🌐    │                                          │
│         └──────────┘                                          │
│        Web Development                                        │
│        $1,000.00                                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Status: Active                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Description                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Complete web solutions including frontend, backend,   │   │
│  │  and database integration using modern frameworks.     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Statistics                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Used in 15 Quotations                                 │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Details.

## API Integration
- `GET /api/services/:id`.

## Components Used
- `Card`.

## Error Handling
- Not found.

## Navigation Flow
- Edit ➞ `/(authenticated)/services/[id]/edit`.

## Functions Involved
- **`handleDelete`**.

## Future Enhancements
- Usage stats graph.
