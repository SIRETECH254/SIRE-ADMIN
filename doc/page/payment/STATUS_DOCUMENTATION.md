# Payment Status Screen Documentation

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
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useQueryMpesaStatus } from '@/tanstack/usePayments';
```

## Context and State Management
- **Query:** `useQueryMpesaStatus` (polls every 5-10s).
- **State:** `checkoutRequestId` (from route).

## UI Structure
- Polling/Loading indicator.
- Success/Failure result.

## Planned Layout
```
┌───────────────────────────────┐
│       Checking...             │
├───────────────────────────────┤
│    ( Spinning Icon )          │
├───────────────────────────────┤
│  Waiting for M-Pesa           │
│  confirmation on your         │
│  phone...                     │
├───────────────────────────────┤
│       [ Cancel ]              │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Processing Payment                                           │
│                                                               │
│         ┌──────────┐                                          │
│         │    🔄    │                                          │
│         └──────────┘                                          │
│                                                               │
│  Please wait while we confirm                                 │
│  your transaction...                                          │
│                                                               │
│  Checking with M-Pesa                                         │
│  Ref: b823-456...                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Back to Dashboard                                     │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Polling status messages.

## API Integration
- `GET /api/payments/mpesa-status/:checkoutRequestId`.

## Components Used
- `ActivityIndicator`.

## Error Handling
- Timeout after 60s.
- User cancellation of STK push.

## Navigation Flow
- Success ➞ `/(authenticated)/payments/[id]`.
- Failure ➞ Redirect back to initiate with error.

## Functions Involved
- **`pollStatus`**.

## Future Enhancements
- Push notification on completion so user can leave the screen.
