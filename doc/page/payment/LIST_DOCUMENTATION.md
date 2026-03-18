# Payment List Screen Documentation

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
import { useGetPayments } from '@/tanstack/usePayments';
import { ThemedView } from '@/components/themed-view';
```

## Context and State Management
- **Query Hook:** `useGetPayments` fetches the transaction history.
- **Filters:** Payment method (M-Pesa, Paystack), Status (Success, Failed).

## UI Structure
- List of transaction cards.

## Planned Layout
```
┌───────────────────────────────┐
│         Payments              │
├───────────────────────────────┤
│  Ref: XYZ123       $150.00    │
│  M-Pesa            [Success]  │
├───────────────────────────────┤
│  Ref: ABC456       $300.00    │
│  Paystack          [Failed]   │
├───────────────────────────────┤
│          ...                  │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  Payments    │           [🔍 Search]                       │
│  └──────────────┘                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  TRX-990123                      $ 150.00              │   │
│  │  Method: M-Pesa                  [ SUCCESS ]           │   │
│  │  Date: Oct 24, 2023                                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  TRX-990456                      $ 2,000.00            │   │
│  │  Method: Paystack                [ PENDING ]           │   │
│  │  Date: Oct 22, 2023                                    │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- Transaction Reference
- Amount
- Payment Method
- Date
- Status Badge

## API Integration
- `GET /api/payments`

## Components Used
- `FlatList`, `StatusBadge`.

## Error Handling
- Standard list errors.

## Navigation Flow
- Tap ➞ `/(authenticated)/payments/[id]`.

## Functions Involved
- **`renderItem`**.

## Future Enhancements
- Export transactions to CSV.
