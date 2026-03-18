# Add Service Screen Documentation

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
import { useCreateService } from '@/tanstack/useServices';
```

## Context and State Management
- **Mutation:** `useCreateService`.
- **State:** `name`, `description`, `price`, `isActive`, `icon`.

## UI Structure
- Form fields.

## Planned Layout
```
┌───────────────────────────────┐
│       Add Service             │
├───────────────────────────────┤
│  Name: [ Input ]              │
├───────────────────────────────┤
│  Price: [ Input ]             │
├───────────────────────────────┤
│  Active: [ Switch ]           │
├───────────────────────────────┤
│  Desc: [ Multiline ]          │
├───────────────────────────────┤
│        [ Create ]             │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Back      │     Add Service                             │
│  └──────────────┘                                             │
│                                                               │
│  Service Details                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Service Name                                          │   │
│  │  e.g., SEO Optimization                                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Base Price ($)                                        │   │
│  │  500.00                                                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Description                                           │   │
│  │  Improves search engine ranking...                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Active Status                                      🟢 │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Create Service                                        │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- `TextInput`.
- `Switch`.

## API Integration
- `POST /api/services`.

## Components Used
- `TextInput`, `Switch`.

## Error Handling
- Validation.

## Navigation Flow
- Success ➞ `/(authenticated)/services/[id]`.

## Functions Involved
- **`handleSubmit`**.

## Future Enhancements
- Icon picker library.
