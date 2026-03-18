# Add Role Screen Documentation

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
import { ScrollView, TextInput, Switch } from 'react-native';
import { useCreateRole } from '@/tanstack/useRoles';
```

## Context and State Management
- **Mutation:** `useCreateRole`.
- **State:** `name`, `description`, `permissions` (array).

## UI Structure
- Form + Permissions toggle list.

## Planned Layout
```
┌───────────────────────────────┐
│       Add Role                │
├───────────────────────────────┤
│  Name: [ Input ]              │
├───────────────────────────────┤
│  Desc: [ Input ]              │
├───────────────────────────────┤
│  Permissions:                 │
│  [x] Manage Users             │
│  [ ] Manage Settings          │
├───────────────────────────────┤
│        [ Create ]             │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Back      │     Add Role                                │
│  └──────────────┘                                             │
│                                                               │
│  Role Details                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Role Name                                             │   │
│  │  e.g., Editor                                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Description                                           │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Permissions                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  View Dashboard                                     ☑️ │   │
│  │  Manage Users                                       ◻️ │   │
│  │  Manage Projects                                    ☑️ │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Create Role                                           │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- `TextInput`.
- `Checkbox` (custom).

## API Integration
- `POST /api/roles`.

## Components Used
- `TextInput`.

## Error Handling
- Validation.

## Navigation Flow
- Success ➞ `/(authenticated)/roles/[id]`.

## Functions Involved
- **`handleSubmit`**.

## Future Enhancements
- Duplicate existing role.
