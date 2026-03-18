# Edit Service Screen Documentation

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
import React, { useEffect } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { useGetService, useUpdateService } from '@/tanstack/useServices';
```

## Context and State Management
- **Query:** `useGetService`.
- **Mutation:** `useUpdateService`.

## UI Structure
- Edit form.

## Planned Layout
```
┌───────────────────────────────┐
│       Edit Service            │
├───────────────────────────────┤
│  Name: [ Web Dev ]            │
├───────────────────────────────┤
│  Price: [ 1000 ]              │
├───────────────────────────────┤
│        [ Update ]             │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Cancel    │     Edit Service                            │
│  └──────────────┘                                             │
│                                                               │
│  Service Details                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Service Name                                          │   │
│  │  Web Development                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Base Price ($)                                        │   │
│  │  1200.00                                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Description                                           │   │
│  │  Updated description text...                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Update Service                                        │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- `TextInput`.

## API Integration
- `PUT /api/services/:id`.

## Components Used
- `TextInput`.

## Error Handling
- Validation.

## Navigation Flow
- Save ➞ Back to Detail.

## Functions Involved
- **`handleUpdate`**.

## Future Enhancements
- Archive service.
