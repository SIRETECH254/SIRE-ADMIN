# Notification Settings Screen Documentation

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
import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useGetProfile, useUpdateProfile } from '@/tanstack/useUsers';
```

## Context and State Management
- **Query:** `useGetProfile` (contains notification preferences).
- **Mutation:** `useUpdateProfile` (updates preferences).
- **State:** Toggles for different notification types.

## UI Structure
- List of toggles for Email, Push, SMS.

## Planned Layout
```
┌───────────────────────────────┐
│     Notification Settings     │
├───────────────────────────────┤
│  Email Alerts:       [ ON ]   │
├───────────────────────────────┤
│  Push Notifications: [ ON ]   │
├───────────────────────────────┤
│  Invoices:           [ ON ]   │
│  Projects:           [ OFF ]  │
├───────────────────────────────┤
│        [ Save ]               │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Back      │     Notification Settings                   │
│  └──────────────┘                                             │
│                                                               │
│  Channels                                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Push Notifications                                 🟢 │   │
│  │  Email Notifications                                🟢 │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Categories                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Invoice Reminders                                  🟢 │   │
│  │  Project Updates                                    🟢 │   │
│  │  Marketing & Tips                                   ⚪ │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Save Preferences                                      │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- `Switch` for toggles.

## API Integration
- `PUT /api/users/profile` (specifically the `notificationPreferences` field).

## Components Used
- `Switch`, `ListItem`.

## Error Handling
- Save failure.

## Navigation Flow
- Save ➞ Back to Profile/List.

## Functions Involved
- **`handleToggle`**.

## Future Enhancements
- Quiet hours (DND) setting.
