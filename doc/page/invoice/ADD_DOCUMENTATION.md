# Add Invoice Screen Documentation

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
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { useCreateInvoice } from '@/tanstack/useInvoices';
import { useGetQuotations } from '@/tanstack/useQuotations';
```

## Context and State Management
- **TanStack Mutation:** `useCreateInvoice()` provides `mutateAsync` for submission and `isPending` for UI busy states.
- **TanStack Query:** `useGetQuotations({ limit: 200 })` fetches available quotations to populate the picker.
- **Local State:**
  - `quotationId`: Stores the ID of the selected quotation.
  - `inlineStatus`: Manages local success/error feedback (`{ type: 'success' | 'error', text: string }`).
- **Memoized Values:**
  - `quotations`: Processes the API response to provide a flat array of quotation objects.

## UI Structure
- **Screen Shell:** `ThemedView` with a background color that adjusts for light/dark modes.
- **Form Layout:** `ScrollView` containing a vertical stack of form elements and informational boxes.
- **Information Panel:** An amber-styled callout explaining the relationship between quotations and invoices.
- **Action Bar:** A row of buttons (Cancel, Create) fixed at the bottom of the form area.

## Planned Layout
```
┌───────────────────────────────┐
│      Create Invoice (H1)      │
├───────────────────────────────┤
│  Label: Quotation *           │
│  [ Picker / Dropdown Selection]│
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Info Box:               │  │
│  │ Invoices are generated  │  │
│  │ from quotations...      │  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  [ Cancel ]  [ Create Inv ]   │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Back      │     Create Invoice                          │
│  └──────────────┘                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Quotation *                                           │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  QTN-2023-001 • Acme Corp                    ▼   │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ⚠️ Invoices are created directly from quotations.      │   │
│  │  Selecting a quotation automatically carries over      │   │
│  │  client, project, items, and totals.                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────┐      ┌────────────────────────┐       │
│  │      Cancel        │      │    Create Invoice      │       │
│  └────────────────────┘      └────────────────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Quotation Picker**
  ```tsx
  <Picker
    selectedValue={quotationId}
    onValueChange={(value: string) => {
      setQuotationId(value);
      setInlineStatus(null);
    }}
    style={{ height: 44 }}>
    <Picker.Item label="Select quotation" value="" />
    {quotations.map((quotation: any) => {
      const id = quotation._id || quotation.id;
      const label = `${quotation.quotationNumber ?? 'Quotation'} • ${quotation.client?.company ?? 'Client'}`;
      return <Picker.Item key={id} label={label} value={id} />;
    })}
  </Picker>
  ```

- **Submit Button**
  ```tsx
  <Pressable
    onPress={handleSave}
    className="btn btn-primary min-w-[150px]"
    disabled={isBusy}>
    {isBusy ? (
      <ActivityIndicator color="#ffffff" />
    ) : (
      <Text className="btn-text btn-text-primary">Create Invoice</Text>
    )}
  </Pressable>
  ```

## API Integration
- **HTTP client:** `axios` (via TanStack Mutation).
- **Endpoint:** `POST /api/invoices`.
- **Payload:** `{ quotation: string }` (The ID of the source quotation).
- **Response contract:** Returns the newly created invoice object.

## Components Used
- `ThemedView`, `ThemedText`: Base UI.
- `Picker` (@react-native-picker/picker): For data selection.
- `Alert`: For semantic feedback messages.
- `ActivityIndicator`: For submission state.

## Error Handling
- **Pre-submission validation:** Checks if `quotationId` is present.
- **Catch block:** Handles network failures or backend validation errors (e.g., "Quotation already converted").
- **Visual Feedback:** Uses the `Alert` component variant "error" to display messages directly above the actions.

## Navigation Flow
- Route: `/(authenticated)/invoices/create`.
- **On Success:** Redirects to the Detail screen of the new invoice: `router.replace(/(authenticated)/invoices/${id})`.
- **On Cancel:** Returns to the previous screen via `router.back()`.

## Functions Involved
- **`handleSave`** — Validates the selection and executes the mutation.
  ```tsx
  const handleSave = useCallback(async () => {
    if (!quotationId) {
      setInlineStatus({ type: 'error', text: 'Select a quotation to create the invoice.' });
      return;
    }

    setInlineStatus(null);
    try {
      const result = await mutateAsync({ quotation: quotationId });
      const createdInvoice = result?.data?.invoice ?? result?.invoice;
      setInlineStatus({ type: 'success', text: 'Invoice created successfully.' });
      
      setTimeout(() => {
        const id = createdInvoice._id || createdInvoice.id;
        router.replace(`/(authenticated)/invoices/${id}`);
      }, 600);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Unable to create invoice.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [mutateAsync, quotationId, router]);
  ```

## Future Enhancements
- Live preview of quotation totals before clicking "Create".
- Searchable user selector if multiple clients share similar quotations.
- Option to create a "Blank Invoice" (manual entry) bypassing the quotation requirement.
