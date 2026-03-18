# Testimonial List Screen Documentation

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
import { useGetTestimonials } from '@/tanstack/useTestimonials';
```

## Context and State Management
- **Query:** `useGetTestimonials`.
- **Filters:** Approved/Unapproved.

## UI Structure
- List of cards.

## Planned Layout
```
┌───────────────────────────────┐
│       Testimonials            │
├───────────────────────────────┤
│  Client Name                  │
│  "Great service!"             │
│  [ Approved ]                 │
├───────────────────────────────┤
│  Another Client               │
│  "Amazing!"                   │
│  [ Pending ]                  │
├───────────────────────────────┤
│           ...                 │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  Testimonials│           [🔍 Search]                       │
│  └──────────────┘                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  "The team did an excellent job on our website..."     │   │
│  │  - John Doe (Acme Corp)                                │   │
│  │                                          [ APPROVED ]  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  "Very professional and timely delivery."              │   │
│  │  - Jane Smith (Globex)                                 │   │
│  │                                          [ PENDING ]   │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Content, Author, Company, Status.

## API Integration
- `GET /api/testimonials`.

## Components Used
- `FlatList`.

## Error Handling
- List error.

## Navigation Flow
- Tap ➞ `/(authenticated)/testimonials/[id]`.

## Functions Involved
- **`renderItem`**.

## Future Enhancements
- Filter by star rating.
