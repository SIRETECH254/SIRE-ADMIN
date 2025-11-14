## Quotations Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Quotations List UI](#quotations-list-ui)
- [Details UI](#details-ui)
- [Create Quotation UI](#create-quotation-ui)
- [Edit Quotation UI](#edit-quotation-ui)
- [Convert to Invoice UI](#convert-to-invoice-ui)
- [Filters, Search & Pagination](#filters-search--pagination)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Wireframes](#wireframes)
- [Future Enhancements](#future-enhancements)

### Imports
Quotation screens reuse the shared layout, themed helpers, table components, NativeWind utilities, TanStack Query hooks, and shared utilities:

```tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Pagination from '@/components/table/Pagination';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/utils';
import {
  useGetQuotations,
  useGetQuotation,
  useCreateQuotation,
  useUpdateQuotation,
  useDeleteQuotation,
  useSendQuotation,
  useConvertToInvoice,
} from '@/tanstack/useQuotations';
import { useGetProjects } from '@/tanstack/useProjects';
import { DatePickerModal } from 'react-native-paper-dates';
```

### Data Sources
- Primary API (see backend `SIRE-API/doc/QUOTATION_DOCUMENTATION.md`):
  - `GET /api/quotations` (list with pagination, filters, search)
  - `GET /api/quotations/:quotationId` (details)
  - `POST /api/quotations` (create)
  - `PUT /api/quotations/:quotationId` (update header, items, totals, status)
  - `DELETE /api/quotations/:quotationId` (delete)
  - `POST /api/quotations/:quotationId/send` (send via email)
  - `POST /api/quotations/:quotationId/convert-to-invoice` (convert)
  - `POST /api/quotations/:quotationId/accept` & `/reject` (client actions)
  - `GET /api/quotations/:quotationId/pdf` (generate PDF download)
- TanStack Query hooks:
  - `useGetQuotations(params)` for the list
  - `useGetQuotation(quotationId)` for details/edit/convert
  - `useCreateQuotation()` for create
  - `useUpdateQuotation()` for edits
  - `useDeleteQuotation()` for destructive actions
  - `useSendQuotation()` for email delivery
  - `useConvertToInvoice()` for conversion
  - `useGetProjects()` powers selection lists (project carries the linked client)
- All financial displays are rendered in **Kenyan Shillings (KES)** to match backend calculations and finance reporting

### Hooks & State
- **List screen**:
  - Local: `searchTerm`, `debouncedSearch`, `statusFilter`, `clientFilter`, `validUntilFilter`, `currentPage`, `itemsPerPage`, `selectedRows`, `confirmDeleteId`
  - Derived: `params` memo with `search`, `status`, `clientId`, `validUntil`, `page`, `limit`, `sort`
  - Query: `useGetQuotations(params)` returns `{ data, isLoading, isError, refetch }`
  - Helpers:
    - `useMemo` for computed totals and formatted rows
    - `useCallback` for pagination handlers and bulk actions
- **Details screen**:
  - Param: `id` from `useLocalSearchParams`
  - Query: `useGetQuotation(id)`
  - Mutations: `useDeleteQuotation()`, `useSendQuotation()`, `useConvertToInvoice()`
  - Local: `showActions`, `showSendToast`, `isConverting`
- **Create screen**:
  - Queries: `useGetProjects` (project selection auto-derives the client)
  ️- Local form state focuses on: `projectId`, `validUntil`, `taxRate`, `discount`, `items`, `notes`, `autoSend`
  - Date pickers reuse the shared `DatePickerModal` component (consistent with project forms)
  - Currency is fixed to Kenyan Shillings (KES) and totals rely on `formatCurrency` utility
- **Edit screen**:
  - Query: `useGetQuotation(id)` for initial values
  - Mutations: `useUpdateQuotation()` plus optional `useSendQuotation()` trigger
  - Editable fields align with backend rules: `items`, `tax`, `discount`, `validUntil`, `notes`
  - Non-editable metadata (project, client, quotation number, status) is shown as read-only context
- **Convert screen**:
  - Param: `id`
  - Query: `useGetQuotation(id)` for preview
  - Mutation: `useConvertToInvoice()`
  - Local: `confirmConvert`, `conversionNotes`, `redirectOnSuccess`

### Quotations List UI
- **Header toolbar**:
  - Title + description
  - Primary CTA `Create Quotation`
  - Quick actions: refresh, export (future)
- **Filters row**:
  - Search input with debounced updates
  - Status select (`all | draft | pending | sent | accepted | rejected | converted`)
  - Client select (derived from project/client associations)
  - Date picker for `validUntil`
  - Rows-per-page select (10/25/50)
- **Table columns**:
  - `Quotation #` (stacks quotation number + client summary)
  - `Project`
  - `Amount` (KES subtotal/total)
  - `Status` badge (with contextual iconography)
  - `Valid Until`
  - `Created`
  - `Actions` (view, edit, send, convert, delete)
- **Badges**:
  - Color-coded using `Badge` component with leading `MaterialIcons`
  - Icons reinforce state (e.g., `hourglass-empty` for pending, `send` for sent, `check-circle` for accepted)
- **Column spacing**:
  - Header/rows use shared column style map so cells never overlap; horizontal scrolling remains for small widths
- **Pagination**:
  - Same `Pagination` component as clients
  - Hidden when `totalPages ≤ 1`
- **Empty/Loading/Error**:
  - 5 skeleton rows for loading
  - Inline `Alert` row for error
  - Empty state with CTA to create

### Details UI
- **Hero header**:
  - Quotation number, client, status badges, quick amounts
  - Primary actions: `Edit`, `Send`, `Convert`, `Delete`
- **Info cards**:
  - `Client & Project`: contact info, project summary, links to related resources
  - `Quotation Meta`: issue date, valid until, created/updated timeline
  - `Financial Summary`: subtotal, tax, discount, total, currency
- **Items table**:
  - Description, quantity, unit price, line total
  - Summary rows for tax, discount, grand total
- **Notes & Activity**:
  - Optional notes block
  - Timeline of status changes (if provided by API)
- **Attachments/PDF**:
  - Button to generate/download PDF (calls `useGenerateQuotationPDF`)

### Create Quotation UI
- **Layout**:
  - Two-column on desktop (details + summary) and stacked on mobile
  - Wrapped in `ScrollView` with consistent spacing and global utility classes
- **Form sections**:
  - Project selection (`project` is the only relationship field required by the backend)
  - Derived client summary (read-only, inherited from the selected project)
  - Valid-until picker powered by `DatePickerModal` (consistent UX with projects module)
  - Items builder with add/remove controls
  - Financial controls: tax %, discount %, optional notes
  - Totals panel (subtotal, tax, discount, total) rendered in KES using `formatCurrency`
  - Optional “Send immediately” toggle triggers the send endpoint after successful creation
- **Validation**:
  - Required: project, valid until date, at least one line item
  - Inline errors and disabled CTA until requirements met
- **Submit**:
  - Payload matches backend contract (`project`, `items`, `tax`, `discount`, `validUntil`, `notes`)
  - Success path shows inline confirmation, optionally triggers send, then routes to details

### Edit Quotation UI
- Read-only metadata card (quotation number, status badge + icon, project title, client info)
- Editable sections mirror backend allowances:
  - Items builder (line descriptions/qty/unit price)
  - Tax %, discount %, valid-until date (DatePickerModal)
  - Notes textarea
  - Optional resend toggle (hit send endpoint after save)
- Converted quotations remain locked for editing; accepted quotations respect backend validation errors
- Save uses `useUpdateQuotation()` and refreshes caches before optional resend

### Convert to Invoice UI
- **Purpose**: Provide a confirmation workflow before turning a quotation into an invoice.
- **Sections**:
  - Quotation summary (client, project, amount, items)
  - Internal notes text area for ops teams (stored locally for reference)
  - Converted warning banner when status already converted
- **Action**:
  - Primary button triggers `useConvertToInvoice().mutate(id)`
  - On success: show toast + redirect to invoices list (detail route TBD)
  - Handles disabled state while converting

### Filters, Search & Pagination
- **Status filter options**: `all | draft | pending | sent | accepted | rejected | converted`
- **Search**: matches quotation number, client name/email, project title
- **Client filter**: optional dropdown (populated via clients list)
- **Project filter**: secondary dropdown (future)
- **Date filter**: valid-until date range (future enhancement)
- **Pagination params**: `page`, `limit`
- **Sorting**: default by `createdAt desc`; toggle by `quotationNumber`, `amount`, `validUntil`

### Mutation & Cache Behaviour
- `useCreateQuotation()` invalidates `['quotations']`
- `useUpdateQuotation()` invalidates `['quotations']` and `['quotation', id]`
- `useDeleteQuotation()` invalidates `['quotations']`
- `useSendQuotation()` keeps cache but triggers toast/log
- `useConvertToInvoice()` invalidates `['quotations']`, `['quotation', id]`, and `['invoices']`
- Hooks rely on axios interceptors for auth headers and refresh logic
- Error handling: show server message `error.response?.data?.message`

### Navigation Flow
- Sidebar “Quotations” → `/(authenticated)/quotations/index.tsx`
- “View” row action → `/(authenticated)/quotations/[id].tsx`
- “Create Quotation” CTA → `/(authenticated)/quotations/create.tsx`
- “Edit” action → `/(authenticated)/quotations/[id]/edit.tsx`
- “Convert to Invoice” action → `/(authenticated)/quotations/[id]/convert.tsx`
- Convert success reroutes to invoices detail

### Error & Loading States
- **List**:
  - Loading: skeleton rows + disabled filters
  - Error: inline table row with `Alert` and retry button
  - Empty: friendly message + CTA
- **Details**:
  - Loading spinner centered
  - Error `Alert` with navigation back
- **Create/Edit/Convert**:
  - Disable submit buttons while `isPending`
  - Inline success/error messaging
  - Safe retry after failure

### Wireframes

Quotations List:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ # / Client     Project     Amount     Status    Valid Until   Actions      │
├────────────────────────────────────────────────────────────────────────────┤
│ Q-00045        Website R.  $4,800.00  [Sent]    Mar 30, 2025  View Edit ...│
│ ...                                                                  ...   │
└────────────────────────────────────────────────────────────────────────────┘
```

Quotation Detail:

```text
[ Quotation #Q-00045 ]   [Sent][Valid]
Client • Project • Amount • Dates

[ Edit ] [ Send ] [ Convert ] [ Delete ]
────────────────────────────────────────────
Items Table
Totals
Notes
Activity
```

Convert to Invoice:

```text
Quotation Summary Card    Invoice Preview Card

[ Cancel ]         [ Convert to Invoice ]
```

### Future Enhancements
- Bulk actions (send, convert, delete)
- Bulk PDF export
- Inline commenting / approvals timeline
- Multi-currency support per quotation
- Reminder scheduler (auto send follow-up emails)
- Advanced filters (date range, amount range, tags)


