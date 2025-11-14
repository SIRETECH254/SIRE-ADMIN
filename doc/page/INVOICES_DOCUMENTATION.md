## Invoices Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Invoice List UI](#invoice-list-ui)
- [Invoice Detail UI](#invoice-detail-ui)
- [Create Invoice UI](#create-invoice-ui)
- [Edit Invoice UI](#edit-invoice-ui)
- [Actions & Notifications](#actions--notifications)
- [Filters, Search & Pagination](#filters-search--pagination)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Future Enhancements](#future-enhancements)

### Imports
Invoice screens reuse the shared layout, themed helpers, table components and TanStack Query hooks:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import Pagination from '@/components/table/Pagination';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  useGetInvoices,
  useGetInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useMarkAsPaid,
  useMarkAsOverdue,
  useCancelInvoice,
  useSendInvoice,
} from '@/tanstack/useInvoices';
import { useGetClients } from '@/tanstack/useClients';
import { useGetQuotations } from '@/tanstack/useQuotations';
import { useGetClientPayments } from '@/tanstack/usePayments';
import { formatCurrency, formatDate } from '@/utils';
```

### Data Sources
- Primary API (see backend `SIRE SERVER/SIRE-API/doc/INVOICE_DOCUMENTATION.md`):
  - `GET /api/invoices` (list with pagination, filters, search)
  - `GET /api/invoices/:invoiceId` (details with linked quotation)
  - `POST /api/invoices` (create from quotation or standalone)
  - `PUT /api/invoices/:invoiceId` (update allowed fields before payment)
  - `PATCH /api/invoices/:invoiceId/mark-paid`
  - `PATCH /api/invoices/:invoiceId/mark-overdue`
  - `PATCH /api/invoices/:invoiceId/cancel`
  - `POST /api/invoices/:invoiceId/send`
  - `GET /api/invoices/:invoiceId/pdf`
- TanStack Query hooks:
  - `useGetInvoices(params)` for list view
  - `useGetInvoice(invoiceId)` for detail/edit screens
  - `useCreateInvoice()` for new invoices
  - `useUpdateInvoice()` for editing
  - `useMarkAsPaid()` / `useMarkAsOverdue()` / `useCancelInvoice()` for state changes
  - `useSendInvoice()` for emailing
  - `useGetQuotations(params)` and `useGetClients(params)` for selectors
  - `useGetClientPayments(invoiceId)` for payment history

### Hooks & State
- List screen:
  - Local: `searchTerm`, `debouncedSearch`, `statusFilter`, `clientFilter`, `currentPage`, `itemsPerPage`, `confirmAction`.
  - Derived `params` memo with `search`, `status`, `client`, `page`, `limit`.
  - Query: `useGetInvoices(params)` returning `{ data, isLoading }`.
- Detail screen:
  - Param: `id` from route.
  - Queries: `useGetInvoice(invoiceId)`, `useGetClientPayments(invoiceId)`.
  - Local toggles for action modals (mark paid, cancel, send).
- Create screen:
  - Local form state: `clientId`, `quotationId`, `projectTitle`, dynamic `items`, `tax`, `discount`, `dueDate`, `notes`.
  - Derived totals using `formatCurrency`.
  - Supporting queries: `useGetClients`, `useGetQuotations`.
  - Mutation: `useCreateInvoice`.
- Edit screen:
  - Prefill from `useGetInvoice`.
  - Local form fields mirroring create screen but respecting backend constraints (disabled when paid).
  - Mutation: `useUpdateInvoice`.

### Invoice List UI
- Table-like layout using `react-native-paper` `DataTable`.
- Columns: Invoice #, Client, Status, Total, Due Date, Created, Actions.
- Top toolbar:
  - Search (debounced).
  - Filters: status (draft, sent, paid, partially_paid, overdue, cancelled), client dropdown.
  - Rows-per-page selector.
  - Primary action button "Create Invoice".
- Rows show:
  - Invoice number with badge for partial payments.
  - Client name/company.
  - Status badge using brand colors.
  - Total amount via `formatCurrency`.
  - Due date formatted with `formatDate`.
  - Action buttons: View, Edit, Mark Paid, Send, Cancel.
- Loading state: skeleton rows.
- Error state: inline `Alert`.
- Empty state: CTA to create first invoice.

### Invoice Detail UI
- Header: Invoice number, status badge, due date, quick action buttons (Send, Mark Paid, Generate PDF, Cancel).
- Cards:
  - Client info (name, email, company, phone).
  - Billing summary (project title, dates).
  - Items table: description, quantity, unit price, line total.
  - Pricing breakdown: subtotal, tax, discount, total, amount paid, remaining balance.
  - Payment history list from `useGetClientPayments`.
  - Notes section.
- Secondary actions via modals to confirm mark-paid, cancel etc.
- Utilizes `Badge`, `Alert`, `Loading`, `Themed` components for consistent look.

### Create Invoice UI
- Title: "Create Invoice".
- Form sections:
  - Select client (Picker from `useGetClients`), with fallback for empty state.
  - Optional quotation select (filters to non-converted quotes). Auto-fill items when chosen.
  - Project title input (required).
  - Items repeater:
    - Fields: description, quantity, unit price.
    - Buttons to add/remove rows.
    - Auto-calc line totals.
  - Tax, discount numeric inputs.
  - Due date picker (default +30 days).
  - Notes textarea.
- Inline validation messaging using `Alert`.
- Submit button disabled while `useCreateInvoice` pending.
- On success: toast + navigation to detail screen.

### Edit Invoice UI
- Prefills same form as Create.
- Top warning if invoice `status === 'paid'` (fields disabled, only notes allowed).
- Allows editing project title, items, tax, discount, due date, notes until fully paid.
- Buttons to mark as overdue/cancel accessible via detail actions.
- Uses `useUpdateInvoice` mutation and invalidates detail/list caches.

### Actions & Notifications
- Actions trigger TanStack mutations plus in-app notifications per backend doc:
  - Mark Paid → `useMarkAsPaid` → notification category `payment`.
  - Mark Overdue → `useMarkAsOverdue` → bidirectional notification with Pay/View CTA.
  - Cancel → `useCancelInvoice` → invoice notification with reason.
  - Send Invoice → `useSendInvoice` → email + in-app action buttons.
- UI displays confirmation modals, success/failure alerts, and disables buttons while pending.

### Filters, Search & Pagination
- Status filter options: `all | draft | sent | paid | partially_paid | overdue | cancelled`.
- Client filter: dropdown of clients (fallback to "All").
- Search matches invoice number or project title (backend `search` param).
- Pagination uses `Pagination` component with meta from API (`page`, `totalPages`, `totalInvoices`).
- Toolbar includes rows-per-page select (10/20/50). Pagination hidden when <=1 page.

### Mutation & Cache Behaviour
- `useCreateInvoice` invalidates `['invoices']`.
- `useUpdateInvoice`, `useMarkAsPaid`, `useMarkAsOverdue`, `useCancelInvoice`, `useSendInvoice` invalidate:
  - `['invoices']`
  - `['invoice', invoiceId]`
  - `['payments', invoiceId]` where relevant.
- Mutations show inline success `Alert` then navigate/close modals.
- Errors display backend messages from `error.response?.data?.message`.

### Navigation Flow
- Sidebar "Invoices" → `/(authenticated)/invoices/index.tsx`.
- Row "View" → `/(authenticated)/invoices/[id].tsx`.
- Row "Edit" → `/(authenticated)/invoices/[id]/edit.tsx`.
- "Create Invoice" button → `/(authenticated)/invoices/create.tsx`.
- Shortcut buttons from quotations detail (convert) navigate to invoice create when necessary.

### Error & Loading States
- List:
  - Loading: skeleton rows.
  - Error: inline `Alert`.
  - Empty: CTA to create invoice.
- Detail/Create/Edit:
  - Loading spinner via `Loading`.
  - Inline alerts for API errors.
  - Disabled buttons while pending to avoid duplicate calls.
- Action modals show spinner inside confirm button.

### Future Enhancements
- Bulk invoice actions (mark paid, send reminders).
- Advanced filters (date ranges, amount ranges).
- Invoice PDF preview within app.
- Inline payment recording forms for partial payments.
- Export to CSV/PDF for accounting.
- Saved invoice templates and recurring invoices support.

