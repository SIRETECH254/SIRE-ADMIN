# Add Quotation Screen Documentation

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
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { DatePickerModal } from 'react-native-paper-dates';

import { useGetProjects } from '@/tanstack/useProjects';
import { useCreateQuotation, useSendQuotation } from '@/tanstack/useQuotations';
```

## Context and State Management
- **TanStack Hooks:**
  - `useGetProjects({ limit: 200 })`: Fetches available projects to associate with the quotation.
  - `useCreateQuotation()`: Mutation for saving the quotation.
  - `useSendQuotation()`: Mutation for immediately emailing the client after creation (optional).
- **Complex Local State:**
  - `items`: An array of `ItemInput` objects, each with a unique key, description, quantity, and unitPrice.
  - `projectId`, `validUntilDate`, `taxRate`, `discount`, `notes`, `autoSend`: Various form field states.
- **Memoized Calculations:**
  - `subtotal`: Sum of `quantity * unitPrice` for all items.
  - `taxAmount`, `discountAmount`: Calculated percentages based on subtotal.
  - `grandTotal`: The final payable amount (`subtotal + tax - discount`).
  - `selectedProject`: Finds the project object to derive client details (name, company, email).

## UI Structure
- **Root:** `ThemedView` with `ScrollView` for long forms.
- **Project Selection:** Picker that triggers a derived "Client Info" preview card.
- **Validity Date:** A non-editable `TextInput` that opens a `DatePickerModal` on press.
- **Line Items List:** A dynamic section where rows can be added or removed.
- **Financial Summary:** A card showing subtotal, tax, discount, and the grand total in real-time.
- **Settings Toggle:** A `Switch` for the "Auto-send after creation" feature.

## Planned Layout
```
┌───────────────────────────────┐
│      Create Quotation (H1)    │
├───────────────────────────────┤
│  Project: [ Select Project ▼ ]│
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Client Preview (Derived)│  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  Valid Until: [ DatePicker ]  │
├───────────────────────────────┤
│  Line Items Section           │
│  - Item 1 [Desc][Qty][Price][X│
│  - [ + Add Item Button ]      │
├───────────────────────────────┤
│  [Tax %] [Discount %]         │
├───────────────────────────────┤
│  Totals Summary Card          │
├───────────────────────────────┤
│  Auto-send Toggle: [ ON/OFF ] │
├───────────────────────────────┤
│  [ Cancel ]  [ Save Quote ]   │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Back      │     New Quotation                           │
│  └──────────────┘                                             │
│                                                               │
│  Project Details                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Select Project...                                   ▼  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Line Items                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  1. Mobile App Dev                                     │   │
│  │  Qty: [ 1 ]   Price: [ 5000 ]   Total: $5000     [x]   │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌──────────────────┐                                         │
│  │  + Add Item      │                                         │
│  └──────────────────┘                                         │
│                                                               │
│  Summary                                                      │
│  Subtotal: $5000 | Tax: $0 | Disc: $0 | Total: $5000          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  [ ] Auto-send email to client after saving            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────┐      ┌────────────────────────┐       │
│  │      Cancel        │      │    Save Quotation      │       │
│  └────────────────────┘      └────────────────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Dynamic Item Row**
  ```tsx
  <View className="flex-row gap-3">
    <TextInput
      value={item.quantity}
      onChangeText={(v) => handleItemChange(item.key, 'quantity', v)}
      keyboardType="numeric"
      className="form-input"
    />
    <TextInput
      value={item.unitPrice}
      onChangeText={(v) => handleItemChange(item.key, 'unitPrice', v)}
      keyboardType="numeric"
      className="form-input"
    />
  </View>
  ```

- **Date Picker Trigger**
  ```tsx
  <Pressable onPress={() => setValidPickerOpen(true)}>
    <TextInput value={validUntilDisplay} editable={false} pointerEvents="none" />
  </Pressable>
  ```

## API Integration
- **Endpoints:**
  - `GET /api/projects`: To populate the project picker.
  - `POST /api/quotations`: Primary save action.
  - `POST /api/quotations/:id/send`: Triggered if `autoSend` is true.
- **Payload:**
  ```tsx
  {
    project: string,
    validUntil: string (ISO),
    tax: number,
    discount: number,
    items: [{ description, quantity, unitPrice }],
    notes?: string
  }
  ```

## Components Used
- `DatePickerModal` (react-native-paper-dates): For localized date selection.
- `Picker` (@react-native-picker/picker): For project selection.
- `Switch`: For boolean settings.
- `Alert`: For validation and error display.

## Error Handling
- **Pre-flight Validation:**
  - Ensures a project is selected.
  - Ensures a validity date is chosen.
  - Ensures at least one item has a description and quantity > 0.
- **Backend Errors:** Caught via `try/catch` and displayed using `setInlineStatus`.

## Navigation Flow
- Route: `/(authenticated)/quotations/create`.
- **Success:** Redirects to the detail page of the new quotation or the list page after a 700ms delay.

## Functions Involved
- **`handleSave`** — Orchestrates validation, saving, and optional immediate sending.
  ```tsx
  const handleSave = useCallback(async () => {
    // ... validation logic ...
    try {
      const payload = { ... };
      const result = await createQuotationAsync(payload);
      const newId = result?.data?.quotation?._id;

      if (autoSend && newId) {
        await sendQuotationAsync(newId);
      }
      setInlineStatus({ type: 'success', text: 'Quotation created!' });
      setTimeout(() => router.replace(`/(authenticated)/quotations/${newId}`), 700);
    } catch (err: any) {
      setInlineStatus({ type: 'error', text: err.message });
    }
  }, [...deps]);
  ```
- **`handleItemChange`**: Updates a specific field in the items array while maintaining immutability.
- **`handleRemoveItem`**: Filters out an item by key but prevents the list from being completely empty.

## Future Enhancements
- Save as Draft: Backend support for a partial save.
- Service Picker: Instead of typing descriptions, select from the `services` module.
- Tax/Discount presets: Manage common tax rates in settings.
