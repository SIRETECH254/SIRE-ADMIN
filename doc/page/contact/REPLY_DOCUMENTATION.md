# Reply Contact Screen Documentation

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
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useGetMessage, useReplyToMessage } from '@/tanstack/useContact';
import { ThemedText, ThemedView } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
```

## Context and State Management
- **TanStack Query:** `useGetMessage(messageId)` fetches the original inquiry to provide context for the reply.
- **TanStack Mutation:** `useReplyToMessage()` handles the submission of the response.
- **Local State:**
  - `reply`: The draft response text.
  - `inlineStatus`: Manages screen-wide success or API error alerts.
  - `validationError`: Screen-specific validation feedback (e.g., character limits).
- **Derived Logic:**
  - `replyLength`: Real-time tracking of the response size.
  - `isReplyValid`: Boolean determining the state of the "Submit" button.

## UI Structure
- **Root:** `ThemedView` with standard white/dark responsive background.
- **Context Card:** A read-only preview of the original inquiry (Sender, Subject, Message) to guide the administrator's response.
- **Reply Input:** A multiline `TextInput` acting as a rich-text area for the response.
- **Feedback Layer:** Character counter and validation messages placed directly below the input.
- **Action Bar:** Footer-aligned buttons for "Cancel" and "Submit Reply".

## Planned Layout
```
┌───────────────────────────────┐
│      Reply to Message (H1)    │
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Original Inquiry Preview│  │
│  │ From: John Doe          │  │
│  │ "I need help with..."   │  │
│  └─────────────────────────┘  │
├───────────────────────────────┤
│  Label: Your Reply *          │
│  ┌─────────────────────────┐  │
│  │ [ Multiline Input Area ]│  │
│  │                         │  │
│  └─────────────────────────┘  │
│  Char count: 45 / 2000        │
├───────────────────────────────┤
│  [ Cancel ]  [ Submit Reply ] │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐                                             │
│  │  < Cancel    │     Send Response                           │
│  └──────────────┘                                             │
│                                                               │
│  Original Message Context                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  To: John Doe <john@example.com>                       │   │
│  │  Subject: Billing Question                             │   │
│  │  ────────────────────────────────────────────────────  │   │
│  │  Message: Hello, I noticed an extra charge...         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Your Response *                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Hi John,                                              │   │
│  │                                                        │   │
│  │  Thank you for bringing this to our attention.         │   │
│  │  We have reviewed your account and found...            │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│  [Validation Error Message]             Chars: 156 / 2000     │
│                                                               │
│  ┌────────────────────┐      ┌────────────────────────┐       │
│  │      Cancel        │      │    Submit Reply        │       │
│  └────────────────────┘      └────────────────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Multiline Response Area**
  ```tsx
  <TextInput
    multiline
    numberOfLines={8}
    placeholder="Enter your reply..."
    value={reply}
    onChangeText={setReply}
    className="min-h-[120px] text-base"
    textAlignVertical="top"
  />
  ```

- **Validation Check**
  ```tsx
  const isReplyValid = replyLength >= 10 && replyLength <= 2000;
  ```

## API Integration
- **HTTP client:** `axios` (TanStack Mutation wrapper).
- **Endpoint:** `POST /api/contact/:id/reply`.
- **Payload:** `{ reply: string }`.
- **Side Effects:** On success, the backend typically updates the inquiry status to 'replied'.

## Components Used
- `TextInput`: Configured for multiline, top-aligned text entry.
- `Loading`: To prevent interaction before the context message is loaded.
- `Alert`: For both form validation errors and API success/failure.

## Error Handling
- **Character Limits:** Displays an inline warning if the reply is too short (<10) or too long (>2000).
- **API Errors:** Displays backend messages (e.g., "Message already replied to") in a global alert.
- **Navigation Safety:** Redirects to the list if the `id` param is missing.

## Navigation Flow
- Route: `/(authenticated)/contact/[id]/reply`.
- **Success:** Navigates back to the Detail view of the message via `router.replace()` to ensure the updated status is shown.
- **Cancel:** Direct `router.back()` to the Detail view.

## Functions Involved
- **`handleSubmit`** — Validates the local state and executes the reply mutation.
  ```tsx
  const handleSubmit = useCallback(async () => {
    if (!validateReply()) return;
    try {
      await replyToMessageAsync({
        messageId,
        replyData: { reply: reply.trim() },
      });
      setInlineStatus({ type: 'success', text: 'Reply sent.' });
      setTimeout(() => router.replace(`/(authenticated)/contact/${messageId}`), 1000);
    } catch (err: any) {
      setInlineStatus({ type: 'error', text: err.message });
    }
  }, [...deps]);
  ```
- **`validateReply`**: Helper logic for character count enforcement.

## Future Enhancements
- Email Templates: Selection of pre-written responses for common inquiries.
- Rich Text Editor: Support for bold, italics, and links in the reply.
- BCC Support: Copy the reply to an internal support email.
