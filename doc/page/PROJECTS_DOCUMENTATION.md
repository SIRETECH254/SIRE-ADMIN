## Projects Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Projects List UI](#projects-list-ui)
- [Details UI](#details-ui)
- [Edit Project UI](#edit-project-ui)
- [Create Project UI](#create-project-ui)
- [Milestones Management UI](#milestones-management-ui)
- [Attachments Management UI](#attachments-management-ui)
- [Filters, Search & Pagination](#filters-search--pagination)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Wireframes](#wireframes)
- [Future Enhancements](#future-enhancements)

### Imports
The Projects screens reuse shared layout, themed helpers, table components and TanStack Query hooks:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { DataTable } from 'react-native-paper';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Pagination from '@/components/table/Pagination';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getInitials, formatDate } from '@/utils';
import {
  useGetProjects,
  useGetProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useUpdateProjectStatus,
  useUpdateProgress,
  useAddMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useUploadAttachment,
  useDeleteAttachment,
} from '@/tanstack/useProjects';
import { useGetClients } from '@/tanstack/useClients';
import { useGetAllUsers } from '@/tanstack/useUsers';
import { useGetServices } from '@/tanstack/useServices';
```

### Data Sources
- Primary API (see server docs `SIRE-API/doc/PROJECT_DOCUMENTATION.md`):
  - `GET /api/projects` (list with pagination, filters, search)
  - `GET /api/projects/:projectId` (details)
  - `POST /api/projects` (create)
  - `PUT /api/projects/:projectId` (update: title, description, client, services, status, priority, team, dates, progress, notes)
  - `PATCH /api/projects/:projectId/status` (update status)
  - `PATCH /api/projects/:projectId/progress` (update progress)
  - `DELETE /api/projects/:projectId` (delete)
  - `POST /api/projects/:projectId/milestones` (add milestone)
  - `PATCH /api/projects/:projectId/milestones/:milestoneId` (update milestone)
  - `DELETE /api/projects/:projectId/milestones/:milestoneId` (delete milestone)
  - `POST /api/projects/:projectId/attachments` (upload attachment)
  - `DELETE /api/projects/:projectId/attachments/:attachmentId` (delete attachment)
- TanStack Query hooks:
  - `useGetProjects(params)` for list
  - `useGetProject(projectId)` for details
  - `useCreateProject()` for create
  - `useUpdateProject()` for edit
  - `useDeleteProject()` for delete
  - `useUpdateProjectStatus()` for status update
  - `useUpdateProgress()` for progress update
  - `useAddMilestone()` for adding milestones
  - `useUpdateMilestone()` for updating milestones
  - `useDeleteMilestone()` for deleting milestones
  - `useUploadAttachment()` for uploading attachments
  - `useDeleteAttachment()` for deleting attachments

### Hooks & State
- List screen:
  - Local: `searchTerm`, `debouncedSearch`, `filterStatus`, `filterPriority`, `filterAssignee`, `currentPage`, `itemsPerPage`, `confirmDelete`
  - Derived: `params` memo with `search`, `status`, `priority`, `assignee`, `page`, `limit`
  - Query: `useGetProjects(params)` providing `{ data, isLoading }`
- Details screen:
  - Param: `id` from route
  - Query: `useGetProject(projectId)`
- Edit screen:
  - Param: `id`
  - Query: `useGetProject(projectId)` for initial values
  - Mutations: `useUpdateProject()`, `useUpdateProjectStatus()` (when status changes)
  - Local: `title`, `description`, `clientId`, `serviceIds`, `status`, `priority`, `teamMemberIds`, `startDate`, `endDate`, `progress`, `notes`, `inlineStatus`
- Create screen:
  - Mutations: `useCreateProject()`
  - Local: `title`, `description`, `clientId`, `serviceIds`, `status`, `priority`, `teamMemberIds`, `startDate`, `endDate`, `progress`, `notes`, `milestones`, `inlineStatus`
  - Supporting queries: `useGetClients()` for client selection, `useGetServices()` for service selection, `useGetAllUsers()` for team member selection
- Milestones screen:
  - Param: `id`
  - Query: `useGetProject(projectId)` to get milestones array
  - Mutations: `useAddMilestone()`, `useUpdateMilestone()`, `useDeleteMilestone()`
  - Local: `newMilestoneTitle`, `newMilestoneDescription`, `newMilestoneDueDate`, `editingMilestoneId`
- Attachments screen:
  - Param: `id`
  - Query: `useGetProject(projectId)` to get attachments array
  - Mutations: `useUploadAttachment()`, `useDeleteAttachment()`
  - Local: `uploading`, `deletingId`

### Projects List UI
- RN-compatible table using `react-native-paper` DataTable:
  - Header columns: Project, Client, Status, Priority, Progress, Assigned, Created, Actions
  - Rows render project number/title, client name, status badge, priority badge, progress bar, assigned team count, created date
  - Actions: View, Edit, Delete
- A top toolbar includes:
  - Search input with debounce
  - Filters: Status (pending, in_progress, on_hold, completed, cancelled), Priority (low, medium, high, urgent), Assignee (all users)
  - Rows per page select
  - "Add Project" primary action
- Pagination:
  - Prev/Next with page window text
  - Shown only when total pages > 1

### Details UI
- Project header: Project number, title, status badge, priority badge
- Description section
- Client information card (with link to client detail page)
- Related quotation and invoice (if available, with links)
- Services included (badge list)
- Assigned team members (avatar/initials + names)
- Timeline card: Start date, end date, completion date
- Progress bar with percentage display
- Milestones preview (first 3-5 milestones, link to full milestones page)
- Attachments preview (count and link to attachments page)
- Notes section
- Action buttons: Edit, Update Status, Update Progress, Add Milestone
- Edit button navigates to `/(authenticated)/projects/[id]/edit`

### Edit Project UI
- Title: "Edit Project"
- Form fields:
  - `title` (required)
  - `description` (optional, multiline)
  - `clientId` (Picker/dropdown, required)
  - `serviceIds` (multi-select, optional)
  - `status` (Picker: pending, in_progress, on_hold, completed, cancelled)
  - `priority` (Picker: low, medium, high, urgent)
  - `teamMemberIds` (multi-select from users, optional)
  - `startDate` (DatePicker)
  - `endDate` (DatePicker)
  - `progress` (0-100, slider or input)
  - `notes` (optional, multiline)
- Save:
  - `useUpdateProject()` for profile fields
  - `useUpdateProjectStatus()` when status changed separately
  - Inline success message then navigate back

### Create Project UI
- Title: "Create Project"
- Form fields:
  - `title` (required)
  - `description` (optional, multiline)
  - `clientId` (Picker/dropdown, required)
  - `serviceIds` (multi-select, optional)
  - `status` (Picker: pending, in_progress, on_hold, completed, cancelled)
  - `priority` (Picker: low, medium, high, urgent)
  - `teamMemberIds` (multi-select from users, optional)
  - `startDate` (DatePicker)
  - `endDate` (DatePicker)
  - `progress` (0-100, slider or input)
  - `notes` (optional, multiline)
- Initial milestones section (add/remove milestone items before submit)
- Submit:
  - `useCreateProject()` to `POST /api/projects`
  - On success navigate to project details

### Milestones Management UI
- Display all milestones in a list/card view
- Each milestone shows: Title, description, due date, status (pending/completed)
- Add milestone form (title, description, due date)
- Actions per milestone: Mark as completed, Edit, Delete
- Empty state when no milestones

### Attachments Management UI
- Display attachments list with: Name, size, upload date, download link
- Upload new attachment button (file picker, FormData upload)
- Delete attachment action per item
- Empty state when no attachments

### Filters, Search & Pagination
- Status filter options: `all | pending | in_progress | on_hold | completed | cancelled`
- Priority filter options: `all | low | medium | high | urgent`
- Assignee filter: All users (admin, finance, project_manager, staff)
- Search: trims and debounces; passed as `search` param
- Pagination params: `page`, `limit`
- Rendering rule: pagination is hidden when total pages ≤ 1

### Mutation & Cache Behaviour
- `useUpdateProject()` invalidates:
  - `['projects']`
  - `['project', projectId]`
- `useUpdateProjectStatus()` invalidates:
  - `['projects']`
  - `['project', projectId]`
- `useUpdateProgress()` invalidates:
  - `['projects']`
  - `['project', projectId]`
- `useCreateProject()` invalidates `['projects']`
- `useDeleteProject()` invalidates `['projects']`
- `useAddMilestone()` invalidates `['project', projectId]`
- `useUpdateMilestone()` invalidates `['project', projectId]`
- `useDeleteMilestone()` invalidates `['project', projectId]`
- `useUploadAttachment()` invalidates `['project', projectId]`
- `useDeleteAttachment()` invalidates `['project', projectId]`
- Success flows show success `Alert`, then navigate back or to details
- Errors display backend messages from `error.response?.data?.message`

### Navigation Flow
- Sidebar "Projects" → `/(authenticated)/projects/index.tsx`
- "View" action → `/(authenticated)/projects/[id]/index.tsx`
- "Edit" action → `/(authenticated)/projects/[id]/edit.tsx`
- "Add Project" → `/(authenticated)/projects/create.tsx`
- "Milestones" link → `/(authenticated)/projects/[id]/milestones.tsx`
- "Attachments" link → `/(authenticated)/projects/[id]/attachments.tsx`

### Error & Loading States
- List:
  - Loading: 5 skeleton rows (bg-gray-300, rounded, `animate-pulse`) in tbody; header persists
  - Error: full-width message row with inline `Alert`; header persists
  - Empty: full-width "No projects found" row with quick CTA; header persists
- Details: `Loading` for fetch; `Alert` for errors
- Edit/Create: disable buttons while submitting; inline success/error; safe retries
- Milestones/Attachments: Loading states during operations; error alerts

### Wireframes

Projects List (loading/error/empty render inside tbody, header persists):

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Project        Client      Status    Priority  Progress  Assigned Created  │
├────────────────────────────────────────────────────────────────────────────┤
│ ▒▒▒▒▒▒▒▒      ▒▒▒▒▒▒      ▒▒▒▒      ▒▒▒▒      ▒▒▒▒      ▒▒▒▒    ▒▒▒▒▒▒  │ ← Skeleton row x5
│ …                                                                        … │
└────────────────────────────────────────────────────────────────────────────┘
```

Project Detail (centered edit button below header):

```text
[ Project Number ]
Title               [Status][Priority]

[ Edit Project ] [ Update Status ] [ Update Progress ] [ Add Milestone ]
────────────────────────────────
Client Information …
Services …
Team Members …
Timeline …
Progress Bar …
Milestones Preview …
Attachments Preview …
Notes …
```

### Future Enhancements
- Bulk actions (update status, assign team members)
- Sort by columns (title, client, status, priority, progress, created)
- Server-side export (CSV)
- Advanced filters (date range, client multi-select, service multi-select)
- Gantt chart view
- Project templates
- Time tracking integration

