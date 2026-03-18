# Project Detail Screen Documentation

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
import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetProject } from '@/tanstack/useProjects';
import StatusBadge from '@/components/ui/StatusBadge';
```

## Context and State Management
- **TanStack Query:** `useGetProject(id)` fetches the unified project object containing nested relationships (Client, Services, Team Members, Milestones, Attachments).
- **Route Params:** `id` is extracted from the URL via `useLocalSearchParams`.
- **Derived Logic:** Uses `useMemo` and standard object destructuring to safely extract arrays for milestones, team members, and services, providing defaults to prevent UI crashes.

## UI Structure
- **Screen Shell:** `ThemedView` with a vertical `ScrollView`.
- **Hero Section:** Displays Project Title, Number, and dual status badges (Project Status, Priority).
- **Quick Action Bar:** Fixed-position buttons for primary tasks (Edit, Milestones, Attachments).
- **Information Grid:**
  - **Description Card:** Full-width multiline text.
  - **Client Card:** Metadata row with a "View Client" deep-link.
  - **Services included:** Tag-based visualization.
  - **Team Section:** Avatar-based list of assigned staff.
- **Progress Visualizer:** Large-scale progress bar with percentage indicator.
- **Timeline Preview:** Start and End date comparisons.
- **Lists (Milestones/Attachments):** Truncated previews with "View All" navigation links.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back    Project #1001      │
├───────────────────────────────┤
│  Project Title (H1)           │
│  [ ACTIVE ]  [ HIGH ] (Badges)│
├───────────────────────────────┤
│  [ Edit ] [ Milestones ] [Att]│
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Description Text Area   │  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  Client Card                  │
├───────────────────────────────┤
│  Team Members (Avatars)       │
├───────────────────────────────┤
│  Progress: 75%                │
│  [███████████████████░░░░░]   │
├───────────────────────────────┤
│  Milestones Preview (Top 5)   │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌──────┐                    │
│  │  < Projects  │                 │ Edit │                    │
│  └──────────────┘                 └──────┘                    │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Website Redesign                                      │   │
│  │  Project #1024                  [ ACTIVE ]  [ HIGH ]   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Milestones │  │ Attachments  │  │ Financials   │           │
│  └────────────┘  └──────────────┘  └──────────────┘           │
│                                                               │
│  Progress: 75%                                                │
│  [██████████████████████░░░░░░]                               │
│                                                               │
│  Client: Acme Corp                                            │
│  Manager: Alice Admin                                         │
│                                                               │
│  Team                                                         │
│  (👤) John (👤) Jane (👤) Bob                                 │
│                                                               │
│  Timeline                                                     │
│  Start: Oct 10, 2023  -->  End: Dec 31, 2023                  │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Status Mapping:** Utilizes `statusVariantMap` logic to translate backend enums into semantic colors.
- **Avatars:** Renders remote images or falls back to initials using `getInitials` utility.
- **Milestones:** Filters and displays completion status with checkmark icons.
- **Attachments:** Summarizes total file count.

## API Integration
- **Endpoint:** `GET /api/projects/:id`.
- **Response Shape:**
  ```json
  {
    "data": {
      "project": {
        "title": "...",
        "client": { "firstName": "...", "company": "..." },
        "teamMembers": [...],
        "milestones": [...],
        "progress": 75
      }
    }
  }
  ```

## Components Used
- `StatusBadge`: For Project and Milestone status.
- `Loading`: Full-screen fetch state.
- `Alert`: For API error display.
- `InfoRow`: Custom layout for key-value pair display.

## Error Handling
- **Query Error:** Displays a descriptive `Alert` with the backend message.
- **Missing Data:** Handles null `project` objects by showing the loading state or a "Not Found" message.
- **Missing Avatar:** Fallback UI for members without profile pictures.

## Navigation Flow
- Route: `/(authenticated)/projects/[id]`.
- **Action - Edit:** `/(authenticated)/projects/[id]/edit`.
- **Action - Milestones:** `/(authenticated)/projects/[id]/milestones`.
- **Action - Client:** `/(authenticated)/clients/[clientId]`.

## Functions Involved
- **`formatDate`**: Utility wrapper for standardized date strings.
- **`getStatusVariant` / `getPriorityVariant`**: UI helper logic.
- **`getInitials`**: String processing for avatar fallbacks.

## Future Enhancements
- Interactive Progress: Update percentage directly from the detail screen.
- Timeline Gantt: Visual horizontal timeline.
- Resource Usage: Summary of billable hours logged against the project.
