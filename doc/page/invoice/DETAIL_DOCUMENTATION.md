# Invoice Detail Screen Documentation

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
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  useCancelInvoice,
  useGetInvoice,
  useMarkAsOverdue,
  useSendInvoice,
} from '@/tanstack/useInvoices';
import { useGetInvoicePayments } from '@/tanstack/usePayments';
```

## Context and State Management
- **TanStack Query Hooks:**
  - `useGetInvoice(invoiceId)`: Fetches the core invoice data.
  - `useGetInvoicePayments(invoiceId)`: Fetches all transaction history associated with this invoice.
- **TanStack Mutation Hooks:**
  - `useMarkAsOverdue()`, `useCancelInvoice()`, `useSendInvoice()`: Handles administrative status transitions.
- **Local State:**
  - `inlineStatus`: Manages success feedback for actions.
  - `activeAction`: Tracks which modal action is currently open (`'markOverdue'`, `'cancel'`, `'send'`).
  - `actionError`: Specific error message for failed modal actions.
- **Memoized Logic:**
  - Aggregates invoice subtotal, tax, discount, and balance due based on line items and recorded payments.

## UI Structure
- **Header:** Title (Invoice Number), Date, and `StatusBadge`.
- **Primary Actions:** Row of buttons for Edit, Send, Pay, Mark Overdue, and Cancel.
- **Summary Card:** Information rows for Client, Project, and Key Dates.
- **Line Items Table:** A detailed grid showing description, quantity, price, and totals for each service.
- **Financial Summary:** Vertical stack of totals (Subtotal, Tax, Paid Amount, Balance Due).
- **Payment History:** List of individual payment records with their own status badges.
- **Confirmation Modal:** Reusable system `Modal` for destructive or significant actions.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back      Invoice #001     │
│  [ Edit ] [ Send ] [ Pay ]    │
├───────────────────────────────┤
│  [ PAID ] (Status Badge)      │
├───────────────────────────────┤
│  Billing Summary Card         │
│  - Client: Acme Corp          │
│  - Due: 2023-10-15            │
├───────────────────────────────┤
│  Items Table                  │
│  - Item A ... $100            │
│  - Item B ... $200            │
├───────────────────────────────┤
│  Totals Section               │
│  - Balance: $0.00             │
├───────────────────────────────┤
│  Payment History List         │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌──────┐  ┌──────┐          │
│  │  INV-2023-001 │                 │ Edit │  │ Send │          │
│  └──────────────┘                 └──────┘  └──────┘          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Billing Summary                      [ OVERDUE ]      │   │
│  │                                                        │   │
│  │  Client: John Doe                                      │   │
│  │  Project: Web Redesign                                 │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Items                                                 │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Description | Qty | Price | Total                │  │   │
│  │  │-------------|-----|-------|-------               │  │   │
│  │  │ UI Design   | 1   | $500  | $500                 │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                        │   │
│  │  Balance Due: $500.00                                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Actions                                               │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐             │   │
│  │  │ Pay Now   │ │ Overdue   │ │ Cancel    │             │   │
│  │  └───────────┘ └───────────┘ └───────────┘             │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Billing Summary:** Uses `InfoRow` component with MaterialIcons.
- **Items Table:** Responsive line items with manual total calculation if backend subtotal is missing.
- **History:** Displays payment method (M-Pesa/Paystack) and precise date.
- **Dynamic Action Visibility:**
  - `Pay` button disabled if invoice is Paid or Cancelled.
  - `Send` button disabled if client lacks an email.

## API Integration
- **Endpoints:**
  - `GET /api/invoices/:id`
  - `GET /api/payments/invoice/:id`
  - `PATCH /api/invoices/:id/overdue`
  - `PATCH /api/invoices/:id/cancel`
  - `POST /api/invoices/:id/send`

## Components Used
- `StatusBadge`: Semantic status mapping.
- `Loading`: Full-screen fetch state.
- `Modal`: Custom action confirmation.
- `Alert`: Success/Error notifications.
- `InfoRow`: Reusable layout for metadata.

## Error Handling
- **Route Error:** Shows error alert if `id` is missing in params.
- **Fetch Error:** Renders a retry button if the primary query fails.
- **Action Error:** Displays error messages *inside* the modal to allow user correction or retry without losing context.

## Navigation Flow
- Route: `/(authenticated)/invoices/[id]`.
- **Back:** Returns to list.
- **Pay:** Navigates to `/(authenticated)/payments/initiate?invoiceId=[id]`.
- **Edit:** Navigates to `/(authenticated)/invoices/[id]/edit`.

## Functions Involved
- **`performAction`** — Executes the currently active administrative mutation.
  ```tsx
  const performAction = useCallback(async () => {
    if (!invoiceId || !activeAction) return;
    setActionError(null);
    try {
      if (activeAction === 'markOverdue') {
        await markAsOverdueAsync(invoiceId);
        setInlineStatus({ type: 'success', text: 'Invoice marked as overdue.' });
      } else if (activeAction === 'cancel') {
        await cancelInvoiceAsync(invoiceId);
        setInlineStatus({ type: 'success', text: 'Invoice cancelled.' });
      } else if (activeAction === 'send') {
        await sendInvoiceAsync(invoiceId);
        setInlineStatus({ type: 'success', text: 'Invoice sent to the client.' });
      }
      await refetch();
      setActiveAction(null);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Action failed.';
      setActionError(message);
    }
  }, [activeAction, invoiceId, markAsOverdueAsync, cancelInvoiceAsync, sendInvoiceAsync, refetch]);
  ```

## Future Enhancements
- Activity Log: View when the client opened the invoice email.
- Partial Payment: Allow manual recording of offline payments.
- PDF Preview: Direct in-app rendering of the invoice document.
