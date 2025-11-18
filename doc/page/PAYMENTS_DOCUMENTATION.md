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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import io, { Socket } from 'socket.io-client';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Pagination from '@/components/table/Pagination';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/utils';
import { API_BASE_URL } from '@/api/config';
import {
  useGetPayments,
  useGetPayment,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
  useInitiatePayment,
  useQueryMpesaStatus,
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
  - `useQueryMpesaStatus(checkoutRequestId)` for M-Pesa status polling (fallback only)
- Socket.IO:
  - Real-time payment status updates via Socket.IO connection
  - Connection established on status page mount for both M-Pesa and Paystack
  - Connection options: `transports: ['websocket']`, `forceNew: true`, `timeout: 20000`, `reconnection: true`, `reconnectionAttempts: 5`, `reconnectionDelay: 1000`
  - Subscription via `subscribe-to-payment` event with payment ID
  - M-Pesa events: `callback.received`, `payment.updated`
  - Paystack events: `payment.updated`
  - 60-second timeout for M-Pesa, then fallback to API polling via `useQueryMpesaStatus`
  - API refetch triggered on socket connection to ensure latest payment data

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
  - Queries: `useGetPayment(paymentId)` with `refetch`, `useQueryMpesaStatus(checkoutId)` (fallback only, enabled: false)
  - Socket.IO: Connection state, event listeners, timeout management, refs for socket and timers
  - Local state: `socketConnected`, `socketError`, `socketStatus`, `isFallbackActive`
  - Refs: `socketRef` (Socket instance), `timeoutRef` (fallback timeout), `pollingActiveRef`, `pollingIntervalRef`

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
- Connection status display showing Socket.IO connection state
- M-Pesa flow:
  - Socket.IO connection established on mount
  - Subscribe to payment updates via `subscribe-to-payment` event
  - Listen for `callback.received` event (M-Pesa callback from Safaricom)
  - Listen for `payment.updated` event (database updates)
  - Handle M-Pesa result codes (0 = success, 1 = insufficient balance, 1032 = cancelled, etc.)
  - If no response after 60 seconds: fallback to API polling using `useQueryMpesaStatus(checkoutId)`
  - Fallback queries Safaricom directly for payment status
- Paystack flow:
  - Socket.IO connection established on mount
  - Subscribe to payment updates via `subscribe-to-payment` event
  - Listen for `payment.updated` event (database updates)
  - Handle Paystack status values (`completed`, `PAID`, `failed`, `FAILED`)
- Socket.IO connection features:
  - Automatic reconnection (up to 5 attempts with 1 second delay)
  - Connection error handling with user feedback
  - API refetch on connection to ensure latest payment data
  - Clean disconnection on component unmount
- Action buttons:
  - View Details (navigate to payment detail page)
  - Retry (if failed, re-initiate payment)
- Status priority: Socket.IO status takes precedence over API status when available

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
- Status: Loading indicator during Socket.IO connection; error alerts; connection status display showing "Socket.IO Connected/Disconnected"; fallback status indicator when API polling is active

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

Connection Status:
Socket.IO: [Connected]
API Polling: [Active] (if fallback)

[ View Details ] [ Retry ]
```

### Socket.IO Implementation Details

#### Connection Setup
- Uses `socket.io-client` library
- Connects to `API_BASE_URL` from config
- Connection options:
  - `transports: ['websocket']` - Force WebSocket transport
  - `forceNew: true` - Create new connection each time
  - `timeout: 20000` - 20 second connection timeout
  - `reconnection: true` - Enable automatic reconnection
  - `reconnectionAttempts: 5` - Maximum reconnection attempts
  - `reconnectionDelay: 1000` - 1 second delay between attempts

#### Event Flow

**M-Pesa Events:**
1. `connect` - Socket.IO connection established
   - Emits `subscribe-to-payment` with payment ID
   - Should call `refetch()` from `useGetPayment` to get latest payment data via API (ensures API call is visible in network tab)
   - Sets `socketConnected` to `true` and clears `socketError`
2. `callback.received` - M-Pesa callback from Safaricom
   - Payload contains `CODE` (result code) and `message`
   - Handled by `handleMpesaResultCode()` function
   - Clears all timers when final status is received
3. `payment.updated` - Database payment update
   - Payload contains `paymentId` and `status`
   - Updates local `socketStatus` state if payment ID matches
   - Clears timers if status is `completed`, `failed`, or `cancelled`
4. `disconnect` - Socket.IO disconnected
   - Sets `socketConnected` to `false`
5. `connect_error` - Connection error occurred
   - Sets `socketError` to error message
   - Sets `socketConnected` to `false`

**Paystack Events:**
1. `connect` - Socket.IO connection established
   - Emits `subscribe-to-payment` with payment ID
   - Should call `refetch()` from `useGetPayment` to get latest payment data via API (ensures API call is visible in network tab)
   - Sets `socketConnected` to `true` and clears `socketError`
2. `payment.updated` - Database payment update
   - Payload contains `paymentId` and `status`
   - Handles status values: `completed`, `PAID`, `failed`, `FAILED`
   - Clears timers when payment reaches final state
3. `disconnect` - Socket.IO disconnected
   - Sets `socketConnected` to `false`
4. `connect_error` - Connection error occurred
   - Sets `socketError` to error message
   - Sets `socketConnected` to `false`

#### M-Pesa Result Codes
- `0` - Success (payment completed)
- `1` - Insufficient M-Pesa balance
- `1032` - Payment cancelled by user
- `1037` - Payment timeout (could not reach phone)
- `2001` - Wrong PIN entered
- `1001` - Unable to complete transaction
- `1019` - Transaction expired
- `1025` - Invalid phone number
- `1026` - System error occurred
- `1036` - Internal error occurred
- `1050` - Too many payment attempts
- `9999` - Keep waiting (processing)

#### Fallback Mechanism
- M-Pesa only: After 60 seconds (`FALLBACK_TIMEOUT`), if no Socket.IO update received
- Queries Safaricom directly via `useQueryMpesaStatus(checkoutId)`
- Parses result code and description from response
- Updates payment status based on result code
- Clears all timers and disconnects socket after fallback completes

#### Cleanup
- `clearPaymentTimers()` function:
  - Clears timeout refs
  - Clears polling interval refs
  - Disconnects Socket.IO connection
  - Called on component unmount and when payment completes/fails

#### Dependencies
- `startTracking` useCallback dependencies:
  - `paymentId`, `isMpesa`, `checkoutId`
  - `clearPaymentTimers`, `handleMpesaResultCode`, `refetchMpesaStatus`
  - Note: `refetch` from `useGetPayment` should be included if used in connect handler
- `useEffect` dependencies for initialization:
  - `paymentId`, `isMpesa`, `checkoutId`, `startTracking`, `clearPaymentTimers`

### Future Enhancements
- Bulk payment processing
- Payment reconciliation
- Export payment history (CSV)
- Advanced filters (date range, amount range)
- Payment analytics dashboard
- Recurring payment setup
- Payment reminders
- Multi-currency support
- Socket.IO room-based subscriptions for better scalability
- Payment status history timeline

