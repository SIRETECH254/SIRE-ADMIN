# Edit Role Screen Documentation

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
import { useGetRole, useUpdateRole } from '@/tanstack/useRoles';
```

## Context and State Management
- **Query:** `useGetRole`.
- **Mutation:** `useUpdateRole`.

## UI Structure
- Edit form (Permissions).

## Planned Layout
```
┌───────────────────────────────┐
│       Edit Role               │
├───────────────────────────────┤
│  Name: [ Admin ]              │
├───────────────────────────────┤
│  Permissions:                 │
│  [x] Manage Users             │
│  [ ] ...                      │
├───────────────────────────────┤
│        [ Update ]             │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Cancel    │     Edit Role                               │
│  └──────────────┘                                             │
│                                                               │
│  Role Details                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Role Name                                             │   │
│  │  Project Manager                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Permissions                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  View Dashboard                                     ☑️ │   │
│  │  Manage Users                                       ☑️ │   │
│  │  Manage Projects                                    ☑️ │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Save Changes                                          │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- `TextInput`.

## API Integration
- `PUT /api/roles/:id`.

## Components Used
- `TextInput`.

## Error Handling
- Validation.

## Navigation Flow
- Save ➞ Back to Detail.

## Functions Involved
- **`handleUpdate`**.

## Future Enhancements
- Bulk permission update.
