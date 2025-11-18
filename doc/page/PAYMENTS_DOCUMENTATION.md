## Payments Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Payment List UI](#payment-list-ui)
- [Payment Detail UI](#payment-detail-ui)
- [Initiate Payment UI](#initiate-payment-ui)
- [Payment Status UI](#payment-status-ui)
- [Filters, Search & Pagination](#filters-search--pagination)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Wireframes](#wireframes)
- [Future Enhancements](#future-enhancements)

### Imports
The Payments screens reuse shared layout, themed helpers, table components and TanStack Query hooks:

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
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Pagination from '@/components/table/Pagination';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/utils';
import {
  useGetPayments,
  useGetPayment,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
  useInitiatePayment,
  useQueryMpesaStatus,
  useGetPaymentStatus,
} from '@/tanstack/usePayments';
import { useGetInvoices } from '@/tanstack/useInvoices';
import { useGetClients } from '@/tanstack/useClients';
```

### Data Sources
- Primary API (see server docs `SIRE-API/doc/PAYMENT_DOCUMENTATION.md`):
  - `GET /api/payments` (list with pagination, filters, search)
  - `GET /api/payments/:paymentId` (details)
  - `POST /api/payments` (create payment manually - admin)
  - `PUT /api/payments/:paymentId` (update payment)
  - `DELETE /api/payments/:paymentId` (delete payment)
  - `POST /api/payments/initiate` (initiate payment - M-Pesa or Paystack)
  - `GET /api/payments/mpesa-status/:checkoutRequestId` (query M-Pesa status)
  - `GET /api/payments/client/:clientId` (get client payments)
  - `GET /api/payments/invoice/:invoiceId` (get invoice payments)
- TanStack Query hooks:
  - `useGetPayments(params)` for list
  - `useGetPayment(paymentId)` for details
  - `useCreatePayment()` for manual payment creation
  - `useUpdatePayment()` for update
  - `useDeletePayment()` for delete
  - `useInitiatePayment()` for initiating M-Pesa/Paystack payments
  - `useQueryMpesaStatus(checkoutRequestId)` for M-Pesa status polling
  - `useGetPaymentStatus(paymentId)` for unified status checking
- WebSocket:
  - Real-time M-Pesa payment status updates via WebSocket connection
  - Connection established on status page mount
  - 45-second timeout, then fallback to API polling

### Hooks & State
- List screen:
  - Local: `searchTerm`, `debouncedSearch`, `filterStatus`, `filterMethod`, `currentPage`, `itemsPerPage`, `confirmDelete`
  - Derived: `params` memo with `search`, `status`, `method`, `page`, `limit`
  - Query: `useGetPayments(params)` providing `{ data, isLoading }`
- Details screen:
  - Param: `id` from route
  - Query: `useGetPayment(paymentId)`
- Initiate screen:
  - Mutations: `useInitiatePayment()`
  - Local: `paymentMethod`, `phoneNumber`, `email`, `amount`, `invoiceId`, `inlineStatus`
  - Supporting queries: `useGetInvoices()` for invoice selection
- Status screen:
  - Query params: `paymentId` (primary), `checkoutId` (optional, for M-Pesa)
  - Queries: `useGetPayment(paymentId)`, `useQueryMpesaStatus(checkoutId)` (fallback)
  - WebSocket: Connection state, message handler, timeout management
  - Local: `paymentStatus`, `wsConnected`, `wsError`, `pollingActive`

### Payment List UI
- RN-compatible table using `react-native-paper` DataTable:
  - Header columns: Payment Number, Invoice, Client, Amount, Method, Status, Date, Actions
  - Rows render payment number, invoice reference, client name, amount, payment method badge, status badge, payment date
  - Actions: View, Delete
- A top toolbar includes:
  - Search input with debounce
  - Filters: Status (pending, completed, failed), Payment Method (M-Pesa, Paystack, all)
  - Rows per page select
- Pagination:
  - Prev/Next with page window text
  - Shown only when total pages > 1

### Payment Detail UI
- Payment header: Payment number, amount, status badge, payment method badge
- Transaction details section
- Invoice reference (with link to invoice detail page)
- Client information card (with link to client detail page)
- Payment method specific metadata:
  - M-Pesa: Phone number, checkout request ID, transaction reference
  - Paystack: Email, transaction reference, authorization code
- Status timeline/history
- Action buttons: Update Status (admin), Delete

### Initiate Payment UI
- Title: "Initiate Payment"
- Form fields:
  - `paymentMethod` (Picker: M-Pesa or Paystack, required)
  - `phoneNumber` (TextInput, required if M-Pesa, phone-pad keyboard)
  - `email` (TextInput, required if Paystack, email keyboard)
  - `amount` (TextInput, numeric, required)
  - `invoiceId` (Picker/dropdown from invoices list, required)
- Submit:
  - `useInitiatePayment()` to `POST /api/payments/initiate`
  - On success navigate to status page with `paymentId` and `checkoutId` (if M-Pesa)

### Payment Status UI
- Unified UI for both M-Pesa and Paystack
- Payment method badge (M-Pesa or Paystack)
- Current status display with loading indicator
- Amount and invoice reference
- Status timeline/progress indicator
- M-Pesa flow:
  - WebSocket connection established on mount
  - Listen for payment status updates for 45 seconds
  - If websocket fails or no response: fallback to API polling using `useQueryMpesaStatus(checkoutId)`
  - Polling interval: 3-5 seconds
- Paystack flow:
  - Use `useGetPayment(paymentId)` to poll status
  - Polling interval: 3-5 seconds
- Action buttons:
  - View Details (navigate to payment detail page)
  - Retry (if failed, re-initiate payment)
- Auto-navigation: When payment status becomes "completed", navigate to payment detail page

### Filters, Search & Pagination
- Status filter options: `all | pending | completed | failed`
- Payment method filter options: `all | mpesa | paystack`
- Search: trims and debounces; searches payment number, invoice number, client name
- Pagination params: `page`, `limit`
- Rendering rule: pagination is hidden when total pages ≤ 1

### Mutation & Cache Behaviour
- `useInitiatePayment()` invalidates:
  - `['payments']`
- `useCreatePayment()` invalidates:
  - `['payments']`
- `useUpdatePayment()` invalidates:
  - `['payments']`
  - `['payment', paymentId]`
- `useDeletePayment()` invalidates:
  - `['payments']`
- Payment completion triggers refetch of related invoice
- Success flows show success `Alert`, then navigate to status or detail page
- Errors display backend messages from `error.response?.data?.message`

### Navigation Flow
- Sidebar "Payments" → `/(authenticated)/payments/index.tsx`
- Invoice detail "Pay" button → `/(authenticated)/payments/initiate?invoiceId=...`
- "View" action → `/(authenticated)/payments/[id].tsx`
- Initiate payment success → `/(authenticated)/payments/status?paymentId=...&checkoutId=...` (checkoutId only if M-Pesa)
- Status page completion → `/(authenticated)/payments/[paymentId]`

### Error & Loading States
- List:
  - Loading: 5 skeleton rows (bg-gray-300, rounded, `animate-pulse`) in tbody; header persists
  - Error: full-width message row with inline `Alert`; header persists
  - Empty: full-width "No payments found" row with quick CTA; header persists
- Details: `Loading` for fetch; `Alert` for errors
- Initiate: disable buttons while submitting; inline success/error; safe retries
- Status: Loading indicator during websocket connection and polling; error alerts; connection status display

### Wireframes

Payment List (loading/error/empty render inside tbody, header persists):

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Payment      Invoice    Client    Amount    Method    Status    Date  Actions│
├────────────────────────────────────────────────────────────────────────────┤
│ ▒▒▒▒▒▒▒▒    ▒▒▒▒▒▒    ▒▒▒▒      ▒▒▒▒      ▒▒▒▒      ▒▒▒▒    ▒▒▒▒  ▒▒▒▒  │ ← Skeleton row x5
│ …                                                                        … │
└────────────────────────────────────────────────────────────────────────────┘
```

Payment Detail:

```text
[ Payment Number ]
Amount: KES 10,000    [Status][Method]

[ Update Status ] [ Delete ]
────────────────────────────────
Transaction Details …
Invoice Reference …
Client Information …
Payment Method Metadata …
Status Timeline …
```

Initiate Payment:

```text
Initiate Payment
────────────────────────────────
Payment Method: [M-Pesa ▼]
Phone Number: [___________]
Amount: [___________]
Invoice: [Select invoice ▼]

[ Cancel ] [ Initiate Payment ]
```

Payment Status:

```text
Payment Status
────────────────────────────────
[M-Pesa] [Pending]

Amount: KES 10,000
Invoice: INV-001

Status: Processing...
[Connecting via WebSocket...]

[ View Details ] [ Retry ]
```

### Future Enhancements
- Bulk payment processing
- Payment reconciliation
- Export payment history (CSV)
- Advanced filters (date range, amount range)
- Payment analytics dashboard
- Recurring payment setup
- Payment reminders
- Multi-currency support

