## Contact Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Contact List UI](#contact-list-ui)
- [Contact Detail UI](#contact-detail-ui)
- [Reply UI](#reply-ui)
- [Filters](#filters)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Wireframes](#wireframes)
- [Future Enhancements](#future-enhancements)

### Imports
The Contact screens reuse shared layout, themed helpers, and TanStack Query hooks:

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

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDate } from '@/utils';
import {
  useGetAllMessages,
  useGetMessage,
  useMarkMessageAsRead,
  useReplyToMessage,
  useArchiveMessage,
  useDeleteMessage,
} from '@/tanstack/useContact';
```

### Data Sources
- Primary API (see server docs `SIRE-API/doc/CONTACT_DOCUMENTATION.md`):
  - `GET /api/contact` (list with filters: status, search, page, limit, startDate, endDate)
  - `GET /api/contact/:messageId` (details)
  - `PATCH /api/contact/:messageId/read` (mark as read)
  - `POST /api/contact/:messageId/reply` (reply to message)
  - `DELETE /api/contact/:messageId` (delete)
  - `PATCH /api/contact/:messageId/archive` (archive)
- TanStack Query hooks:
  - `useGetAllMessages(params)` for list
  - `useGetMessage(messageId)` for details
  - `useMarkMessageAsRead()` for marking single message
  - `useReplyToMessage()` for replying to message
  - `useArchiveMessage()` for archiving message
  - `useDeleteMessage()` for deleting message

### Hooks & State
- List screen:
  - Local: `filterStatus` (all | unread | read | replied | archived), `searchQuery`, `startDate`, `endDate`
  - Query: `useGetAllMessages(params)` providing `{ data, isLoading }`
  - Mutations: `useMarkMessageAsRead()`, `useReplyToMessage()`, `useArchiveMessage()`, `useDeleteMessage()`
- Detail screen:
  - Param: `id` from route
  - Query: `useGetMessage(messageId)`
  - Mutations: `useMarkMessageAsRead()`, `useReplyToMessage()`, `useArchiveMessage()`, `useDeleteMessage()`
- Reply screen:
  - Param: `id` from route
  - Query: `useGetMessage(messageId)` for original message
  - Mutation: `useReplyToMessage()`
  - Local: `reply`, `inlineStatus`

### Contact List UI
- Scrollable list/card view (NO table structure):
  - Each message as a card/row showing: Status badge, Sender name, Email, Subject, Message preview, Created date
  - Filters toolbar: Status filter (all | unread | read | replied | archived), Search input (name, email, subject, message)
  - Optional date range filters (startDate, endDate)
  - Actions per message: Mark as Read, View, Reply, Archive, Delete
  - Pagination support (if backend provides)
  - Display all messages with pagination
  - Unread count indicator (if available)

### Contact Detail UI
- Message header: Status badge, Sender name, Email, Phone (if available), Subject, Created date
- Full message display
- Status indicator (unread, read, replied, archived)
- Reply section:
  - If not replied: "Reply" button linking to reply page
  - If replied: Display reply text, repliedBy (admin name), repliedAt (timestamp)
- Action buttons: Mark as Read (if unread), Reply (if not replied), Archive, Delete
- View related resource link (if metadata available)

### Reply UI
- Original message display (read-only):
  - Sender name, email, subject, message, created date
- Reply form:
  - Reply message: TextInput multiline (required, 10-2000 characters)
  - Validation: Required field, minimum 10 characters, maximum 2000 characters
- Submit button with loading state
- Cancel button (navigate back)
- Inline success/error messages
- On success: Show success Alert, navigate back to detail page

### Filters
- Status filter: all | unread | read | replied | archived
- Search filter: Search by name, email, subject, or message content
- Date range filters (optional): startDate, endDate
- Pagination: page, limit (if backend supports)
- Filtering happens via API params

### Mutation & Cache Behaviour
- `useMarkMessageAsRead()` invalidates:
  - `['contact', 'messages']`
  - `['contact', 'message', messageId]`
- `useReplyToMessage()` invalidates:
  - `['contact', 'messages']`
  - `['contact', 'message', messageId]`
- `useArchiveMessage()` invalidates:
  - `['contact', 'messages']`
  - `['contact', 'message', messageId]`
- `useDeleteMessage()` invalidates:
  - `['contact', 'messages']`
- Success flows show success `Alert`, then navigate back or to details
- Errors display backend messages from `error.response?.data?.message`

### Navigation Flow
- Sidebar "Contact" → `/(authenticated)/contact/index.tsx`
- "View" action → `/(authenticated)/contact/[id].tsx`
- "Reply" action → `/(authenticated)/contact/[id]/reply.tsx`
- After reply: Navigate back to detail page

### Error & Loading States
- List:
  - Loading: 5 skeleton rows (bg-gray-300, rounded, `animate-pulse`)
  - Error: full-width message with inline `Alert`
  - Empty: full-width "No contact messages found" message
- Detail: `Loading` for fetch; `Alert` for errors
- Reply: Disabled submit while sending; inline success/error; safe retries

### Wireframes

Contact List (scrollable list, NO table):

```text
┌────────────────────────────────────────────────────────────┐
│ [Filters: Status ▼] [Search...] [Date Range]              │
├────────────────────────────────────────────────────────────┤
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │ ← Skeleton row x5
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│ …                                                          … │
├────────────────────────────────────────────────────────────┤
│ [Message Card]                                             │
│ [Status Badge] Sender Name (email@example.com)            │
│ Subject                                                     │
│ Message preview...                                          │
│ [Mark as Read] [View] [Reply] [Archive] [Delete]           │
├────────────────────────────────────────────────────────────┤
│ [Message Card]                                             │
│ …                                                           │
└────────────────────────────────────────────────────────────┘
```

Contact Detail:

```text
[ Contact Message ID ]
Subject               [Status Badge]

[ Mark as Read ] [ Reply ] [ Archive ] [ Delete ]
────────────────────────────────
Sender: Name
Email: email@example.com
Phone: +254712345678 (if available)
Created: Date

Message:
Full message content here...

Reply Section:
[If not replied]
[ Reply Button → Reply Page ]

[If replied]
Reply:
Reply message content here...
Replied by: Admin Name
Replied at: Date
```

Reply Page:

```text
Original Message
────────────────────────────────
From: Name (email@example.com)
Subject: Subject
Date: Date

Message:
Original message content here...

Reply Form
────────────────────────────────
Reply Message: *
[Multiline TextInput - 10-2000 chars]

[ Cancel ] [ Submit Reply ]
```

### Future Enhancements
- Bulk actions (mark multiple as read, archive multiple)
- Email integration (send reply via email)
- Message templates for common replies
- Advanced filtering (priority, tags)
- Export messages (CSV)
- Message assignment to team members
- Internal notes on messages
- Message forwarding
- Rich text editor for replies
- Attachment support

