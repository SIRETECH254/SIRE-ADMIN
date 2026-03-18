# Payment Detail Screen Documentation

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
import { useGetPayment } from '@/tanstack/usePayments';
```

## Context and State Management
- **Query:** `useGetPayment`.

## UI Structure
- Transaction details card.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back      Payment Info     │
├───────────────────────────────┤
│  Amount: $150.00              │
│  Status: [ Success ]          │
├───────────────────────────────┤
│  Method: M-Pesa               │
│  Phone: 254712...             │
│  Reference: XYZ123            │
├───────────────────────────────┤
│  Invoice: #INV-001            │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌──────┐                    │
│  │  < Payments  │                 │ Share│                    │
│  └──────────────┘                 └──────┘                    │
│                                                               │
│         ┌──────────┐                                          │
│         │    💳    │                                          │
│         └──────────┘                                          │
│        $ 150.00                                               │
│        Successful Payment                                     │
│                                                               │
│  Transaction Details                                          │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Reference: TRX-990123                                 │   │
│  │  Gateway: M-Pesa                                       │   │
│  │  Date: Oct 24, 2023 14:30                              │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Linked Invoice                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Invoice #INV-2023-001            View >               │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Comprehensive transaction metadata.

## API Integration
- `GET /api/payments/:id`.

## Components Used
- `Card`.

## Error Handling
- Transaction not found.

## Navigation Flow
- Back ➞ List.

## Functions Involved
- **`handleShare`**.

## Future Enhancements
- Refund action (if supported by gateway).
