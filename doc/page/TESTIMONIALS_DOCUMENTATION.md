## Testimonials Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Testimonials List UI](#testimonials-list-ui)
- [Testimonial Detail UI](#testimonial-detail-ui)
- [Filters](#filters)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Wireframes](#wireframes)
- [Future Enhancements](#future-enhancements)

### Imports
The Testimonials screens reuse shared layout, themed helpers, and TanStack Query hooks:

```tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDate, getInitials } from '@/utils';
import {
  useGetTestimonials,
  useGetTestimonial,
  useApproveTestimonial,
  usePublishTestimonial,
  useUnpublishTestimonial,
  useDeleteTestimonial,
} from '@/tanstack/useTestimonials';
import { useAuth } from '@/contexts/AuthContext';
```

### Data Sources
- Primary API (see server docs `SIRE-API/doc/TESTIMONIAL_DOCUMENTATION.md`):
  - `GET /api/testimonials` (list with filters - admin)
  - `GET /api/testimonials/published` (published testimonials - public)
  - `GET /api/testimonials/:testimonialId` (details)
  - `POST /api/testimonials` (create - client)
  - `PUT /api/testimonials/:testimonialId` (update)
  - `DELETE /api/testimonials/:testimonialId` (delete)
  - `POST /api/testimonials/:testimonialId/approve` (approve - admin)
  - `POST /api/testimonials/:testimonialId/publish` (publish - admin)
  - `POST /api/testimonials/:testimonialId/unpublish` (unpublish - admin)
- TanStack Query hooks:
  - `useGetTestimonials(params)` for list
  - `useGetTestimonial(testimonialId)` for details
  - `useApproveTestimonial()` for approving testimonials
  - `usePublishTestimonial()` for publishing testimonials
  - `useUnpublishTestimonial()` for unpublishing testimonials
  - `useDeleteTestimonial()` for delete

### Hooks & State
- List screen:
  - Local: `filterApproval`, `filterPublish`, `filterRating`, `searchTerm`
  - Query: `useGetTestimonials(params)` providing `{ data, isLoading }`
  - Mutations: `useApproveTestimonial()`, `usePublishTestimonial()`, `useUnpublishTestimonial()`, `useDeleteTestimonial()`
- Detail screen:
  - Param: `id` from route
  - Query: `useGetTestimonial(testimonialId)`
  - Mutations: `useApproveTestimonial()`, `usePublishTestimonial()`, `useUnpublishTestimonial()`, `useDeleteTestimonial()`
  - Local: `inlineStatus`, `activeAction`, `actionError`

### Testimonials List UI
- Scrollable list/card view (NO table structure):
  - Each testimonial as a card showing: Client name/avatar, Star rating (1-5), Message preview, Approval status badge, Publish status badge, Created date
  - Filters toolbar: Approval status (all | approved | pending), Publish status (all | published | unpublished), Rating (all | 1 | 2 | 3 | 4 | 5)
  - Search input for client name
  - Actions per testimonial: View, Approve (if pending), Publish (if approved), Delete
  - NO pagination, NO table structure
  - Display all testimonials (no pagination)

### Testimonial Detail UI
- Testimonial header: Client information (avatar/initials, name, company)
- Related project (if exists) with link to project detail
- Star rating display (1-5 stars visual)
- Full testimonial message
- Status badges: Approval status, Publish status
- Metadata: Created date, Approved date (if approved), Approved by (if approved)
- Action buttons:
  - Approve (if not approved, admin only)
  - Publish (if approved but not published, admin only)
  - Unpublish (if published, admin only)
  - Delete (with confirmation modal)
- Success/error inline status messages
- Navigation back to list on success

### Filters
- Approval status filter: all | approved | pending
- Publish status filter: all | published | unpublished
- Rating filter: all | 1 | 2 | 3 | 4 | 5
- Search by client name
- Display all testimonials (no pagination)
- Filtering happens via API params (isApproved, isPublished, rating, search)

### Mutation & Cache Behaviour
- `useApproveTestimonial()` invalidates:
  - `['testimonials']`
  - `['testimonial', testimonialId]`
- `usePublishTestimonial()` invalidates:
  - `['testimonials']`
  - `['testimonial', testimonialId]`
  - `['testimonials', 'published']`
- `useUnpublishTestimonial()` invalidates:
  - `['testimonials']`
  - `['testimonial', testimonialId]`
  - `['testimonials', 'published']`
- `useDeleteTestimonial()` invalidates:
  - `['testimonials']`
- Success flows show success `Alert`, then navigate back or refetch
- Errors display backend messages from `error.response?.data?.message`

### Navigation Flow
- Sidebar "Testimonials" → `/(authenticated)/testimonials/index.tsx`
- "View" action → `/(authenticated)/testimonials/[id].tsx`
- Related project link → `/(authenticated)/projects/[id].tsx`

### Error & Loading States
- List:
  - Loading: 5 skeleton rows (bg-gray-300, rounded, `animate-pulse`)
  - Error: full-width message with inline `Alert`
  - Empty: full-width "No testimonials found" message
- Detail: `Loading` for fetch; `Alert` for errors
- Inline success/error messages for mutations
- Safe retries on error

### Wireframes

Testimonials List (scrollable list, NO table):

```text
┌────────────────────────────────────────────────────────────┐
│ [Filters: Approval ▼] [Publish ▼] [Rating ▼] [Search...] │
├────────────────────────────────────────────────────────────┤
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │ ← Skeleton row x5
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│ …                                                          … │
├────────────────────────────────────────────────────────────┤
│ [Testimonial Card]                                        │
│ [Avatar] Client Name                    [Approved] [Pub]  │
│ ⭐⭐⭐⭐⭐ (5 stars)                                        │
│ Message preview...                                          │
│ [View] [Approve] [Publish] [Delete]                        │
├────────────────────────────────────────────────────────────┤
│ [Testimonial Card]                                         │
│ …                                                           │
└────────────────────────────────────────────────────────────┘
```

Testimonial Detail:

```text
[ Testimonial ID ]
[Avatar] Client Name
Company Name (if exists)

[Related Project Link] (if exists)

⭐⭐⭐⭐⭐ (5 stars)

[Approved] [Published] Status Badges

[ Approve ] [ Publish ] [ Unpublish ] [ Delete ]
────────────────────────────────
Created: Date
Approved: Date (if approved)
Approved by: Admin Name (if approved)

Message:
Full testimonial message content here...

[Action Buttons]
```

### Future Enhancements
- Testimonial editing (for unapproved testimonials)
- Bulk approve/publish actions
- Testimonial templates
- Advanced filtering (date range, client filter)
- Export testimonials (CSV)
- Testimonial analytics
- Rich testimonials with images
- Client testimonial submission form (for client portal)

