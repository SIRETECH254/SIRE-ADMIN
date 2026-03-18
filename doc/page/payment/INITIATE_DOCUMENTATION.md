# Initiate Payment Screen Documentation

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
import { View, Text, Pressable, TextInput } from 'react-native';
import { useInitiatePayment } from '@/tanstack/usePayments';
```

## Context and State Management
- **Mutation:** `useInitiatePayment`.
- **State:** `amount`, `invoiceId`, `method` (M-Pesa/Paystack), `phoneNumber`.

## UI Structure
- Payment method selector.
- Amount/Phone entry.

## Planned Layout
```
┌───────────────────────────────┐
│      Make Payment             │
├───────────────────────────────┤
│  Amount: $ 150.00             │
├───────────────────────────────┤
│  Select Method:               │
│  (o) M-Pesa  ( ) Paystack     │
├───────────────────────────────┤
│  Phone: [ 254... ]            │
├───────────────────────────────┤
│        [ Pay Now ]            │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Back      │     Payment                                 │
│  └──────────────┘                                             │
│                                                               │
│  Amount Due                                                   │
│  $ 150.00                                                     │
│                                                               │
│  Payment Method                                               │
│  ┌───────────────┐  ┌───────────────┐                         │
│  │    M-Pesa     │  │   Paystack    │                         │
│  └───────────────┘  └───────────────┘                         │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  M-Pesa Phone Number                                   │   │
│  │  254 7XX XXX XXX                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Proceed to Pay                                        │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- `TextInput` for phone/amount.
- `RadioGroup` for method.

## API Integration
- `POST /api/payments/initiate`.

## Components Used
- `TextInput`.

## Error Handling
- Invalid phone format.
- Gateway timeout.

## Navigation Flow
- Success (M-Pesa) ➞ `/(authenticated)/payments/status` (Polling).
- Success (Paystack) ➞ Webview/Redirect.

## Functions Involved
- **`handleInitiate`**.

## Future Enhancements
- Save card/phone for later.
