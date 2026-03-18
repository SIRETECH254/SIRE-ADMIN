# Testimonial Detail Screen Documentation

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
import { useGetTestimonial, useApproveTestimonial } from '@/tanstack/useTestimonials';
```

## Context and State Management
- **Query:** `useGetTestimonial`.
- **Mutation:** `approveTestimonial`, `publishTestimonial`.

## UI Structure
- Full content, Actions.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back      Review           │
├───────────────────────────────┤
│  Client: John Doe             │
│  Role: CEO, Acme              │
├───────────────────────────────┤
│  Rating: 5 Stars              │
├───────────────────────────────┤
│  "The best service ever..."   │
├───────────────────────────────┤
│  [ Approve ] [ Publish ]      │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌──────┐                    │
│  │  < Reviews   │                 │ Del  │                    │
│  └──────────────┘                 └──────┘                    │
│                                                               │
│         ┌──────────┐                                          │
│         │    ⭐    │                                          │
│         └──────────┘                                          │
│        5.0 Stars                                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Client Details                                        │   │
│  │  John Doe                                              │   │
│  │  CEO, Acme Corp                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Review Content                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  "We hired Sire for a complete rebrand and were        │   │
│  │  blown away by the results. The attention to detail    │   │
│  │  was fantastic."                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Approve & Publish                                     │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Full text, metadata.

## API Integration
- `GET /api/testimonials/:id`.
- `POST .../approve`, `POST .../publish`.

## Components Used
- `Card`.

## Error Handling
- Not found.

## Navigation Flow
- Back ➞ List.

## Functions Involved
- **`handleApprove`**.

## Future Enhancements
- Edit testimonial content (typo fix).
