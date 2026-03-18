# Quotation Detail Screen Documentation

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
  useDeleteQuotation,
  useGetQuotation,
  useSendQuotation,
} from '@/tanstack/useQuotations';
```

## Context and State Management
- **TanStack Query Hooks:**
  - `useGetQuotation(quotationId)`: Primary hook for fetching the full quotation document.
- **TanStack Mutation Hooks:**
  - `useDeleteQuotation()`: Handles the asynchronous deletion of the record.
  - `useSendQuotation()`: Triggers the backend email dispatch process.
- **Local State:**
  - `inlineStatus`: Stores success/error feedback from administrative actions.
  - `confirmDelete`: Boolean to control the destructive action confirmation modal.
  - `sending`: Local UI busy state specifically for the "Send" button.
- **Derived Logic (useMemo):**
  - Consolidates pricing data from various backend response patterns (e.g., `totals.subTotal` vs `subtotal`).
  - Formats client and project names for UI consistency.

## UI Structure
- **Header:** Quotation Number, Date, and `StatusBadge`.
- **Action Strip:** Horizontal row of buttons (Edit, Send, Convert, Delete).
- **Detail Cards:** Grouped information for Client, Project, and Document Metadata (Issue Date, Valid Until).
- **Line Items Table:** Vertical list of services with descriptions, quantities, and line totals.
- **Financial Breakdown:** Summary card showing subtotal, tax, discount, and grand total.
- **Notes Section:** Displays optional internal/external notes if present.

## Planned Layout
```
┌───────────────────────────────┐
│  < Back      QTN-2023-001     │
│  [ Edit ] [ Send ] [ Convert ]│
├───────────────────────────────┤
│  Status: [ SENT ] (Badge)     │
├───────────────────────────────┤
│  Client Card                  │
│  Project Card                 │
│  Metadata Card (Dates)        │
├───────────────────────────────┤
│  Items List                   │
│  - Line Item 1 .... $100      │
│  - Line Item 2 .... $200      │
├───────────────────────────────┤
│  Totals Breakdown             │
│  - Subtotal: $300.00          │
│  - Total: $300.00             │
├───────────────────────────────┤
│  Notes Section (Optional)     │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                 ┌──────┐  ┌──────┐          │
│  │ QTN-2023-005 │                 │ Edit │  │ Send │          │
│  └──────────────┘                 └──────┘  └──────┘          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Client: Acme Corp                            [ SENT ] │   │
│  │  Contact: john@acme.com                                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Project: Web Redesign                                 │   │
│  │  Valid Until: Nov 20, 2023                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Items                                                 │   │
│  │  1. Mobile App Dev (Qty 1) ............... $5,000      │   │
│  │  2. Documentation (Qty 1) ................ $500        │   │
│  │                                                        │   │
│  │  Total: $5,500.00                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────┐  ┌───────────────┐                     │   │
│  │ Convert Inv   │  │ Delete Quote  │                     │   │
│  └───────────────┘  └───────────────┘                     │   │
└───────────────────────────────────────────────────────────────┘
```

## Data Display
- **Status Badges:** Uses `StatusBadge` component with variants matching the quotation state (success for accepted, error for rejected).
- **Pricing:** All values passed through `formatCurrency` utility.
- **Line Items:** Logic handles missing `lineTotal` by calculating `quantity * unitPrice` on the fly.

## API Integration
- **Endpoints:**
  - `GET /api/quotations/:id`
  - `DELETE /api/quotations/:id`
  - `POST /api/quotations/:id/send`
  - `POST /api/quotations/:id/convert-to-invoice` (Triggered via navigation to convert screen)

## Components Used
- `StatusBadge`: For state visualization.
- `Loading`: Centered full-screen fetch state.
- `Modal`: For delete confirmation.
- `Alert`: For action feedback.

## Error Handling
- **Query Errors:** Full-screen error alert with a "Retry" button.
- **Mutation Errors:** Catch block displays backend error message (e.g., "Cannot send draft quotation") in an inline `Alert`.
- **Validation:** Disables "Convert" button if the quotation is already converted.

## Navigation Flow
- Route: `/(authenticated)/quotations/[id]`.
- **Edit:** `router.push(/(authenticated)/quotations/[id]/edit)`.
- **Convert:** `router.push(/(authenticated)/quotations/[id]/convert)`.
- **Delete Success:** `router.replace(/(authenticated)/quotations)`.

## Functions Involved
- **`handleSend`** — Manages the email dispatch mutation and local busy state.
  ```tsx
  const handleSend = useCallback(async () => {
    if (!quotationId) return;
    try {
      setSending(true);
      setInlineStatus(null);
      await sendQuotationAsync(quotationId);
      setInlineStatus({ type: 'success', text: 'Quotation sent successfully.' });
    } catch (err: any) {
      setInlineStatus({ type: 'error', text: err.message });
    } finally {
      setSending(false);
    }
  }, [quotationId, sendQuotationAsync]);
  ```
- **`handleDelete`**: Executes the delete mutation and redirects on success.

## Future Enhancements
- Version History: Track changes between revisions.
- Client View: Preview exactly what the client sees in their portal.
- Attachment Support: Attach project briefs or design files to the quotation email.
