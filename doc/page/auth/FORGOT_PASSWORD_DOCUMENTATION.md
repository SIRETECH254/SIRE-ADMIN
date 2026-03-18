# Forgot Password Screen Documentation

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
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` manages the global `error` and `isLoading` states.
- **Hook usage on screen:** `const { forgotPassword, isLoading, error, clearError } = useAuth();`
- **Local state:**
  - `email`: Stores the user's input.
  - `inlineMessage`: Manages screen-specific success or error feedback.
  - `isSubmitting`: Tracks the local submission status.

**`forgotPassword` function (from `AuthContext.tsx`):**
```tsx
const forgotPassword = async (email: string): Promise<AuthResult> => {
  try {
    await authAPI.forgotPassword(email);
    console.log('Password reset instructions sent to your email!');
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to send reset email';
    console.error('Failed to send reset email:', errorMessage);
    return { success: false, error: errorMessage };
  }
};
```

## UI Structure
- **Screen shell:** Standard `View` with white background.
- **Layout helpers:** `KeyboardAvoidingView` ensures the form remains accessible when the keyboard is active. `ScrollView` handles smaller screen heights.
- **Typography:** React Native `Text` component styled with Tailwind utility classes.
- **Form Container:** Centered `View` with a maximum width for desktop/tablet responsiveness.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│      “Forgot password?”       │
├───────────────────────────────┤
│           Subtitle            │
│   (“Enter your email address”)│
├───────────────────────────────┤
│        Email TextInput        │
├───────────────────────────────┤
│  Inline error / status text   │
├───────────────────────────────┤
│        Submit Button          │
├───────────────────────────────┤
│      “Back to login” CTA      │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐              ┌──────────────────────────┐   │
│  │              │              │                          │   │
│  │    Logo      │              │  📧 Email Address        │   │
│  │              │              │                          │   │
│  └──────────────┘              │  Error/Success Message   │   │
│                                │                          │   │
│  Forgot password?              │  ┌────────────────────┐  │   │
│  Enter your email and we'll    │  │  Send reset link   │  │   │
│  send you instructions.        │  └────────────────────┘  │   │
│                                │                          │   │
│                                │  Back to sign in         │   │
│                                └──────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Email field**
  ```tsx
  <View className="w-full space-y-2">
    <Text className="form-label">Email</Text>
    <TextInput
      value={email}
      onChangeText={(value) => {
        setEmail(value);
        handleInputChange();
      }}
      autoCapitalize="none"
      autoComplete="email"
      keyboardType="email-address"
      placeholder="admin@example.com"
      className="form-input"
    />
  </View>
  ```

- **Submit button**
  ```tsx
  <Pressable
    onPress={handleSubmit}
    disabled={isBusy}
    className="btn btn-primary mt-2 w-full">
    {isBusy ? (
      <ActivityIndicator color="#ffffff" />
    ) : (
      <Text className="btn-text btn-text-primary">Send reset link</Text>
    )}
  </Pressable>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts`.
- **Endpoint:** `POST /api/auth/forgot-password`.
- **Payload:** `{ email: string }`.
- **Response contract:** Standard success response.
- **Error responses:** `error.response.data.message` contains the backend error (e.g., "User not found").

## Components Used
- `View`, `KeyboardAvoidingView`, `ScrollView`, `Text`, `TextInput`, `Pressable`, `ActivityIndicator` from React Native.
- Tailwind (NativeWind) classes for global styles (`form-label`, `form-input`, `btn`, `btn-text`).

## Error Handling
- **Local validation:** Checks if the email field is empty before submission.
- **Context errors:** Listens to the global `error` state from `useAuth`.
- **Inline messages:** Uses a local `inlineMessage` state to show specific feedback (e.g., "Check your inbox").
- **Input clearing:** `handleInputChange` clears existing errors when the user starts typing again.

## Navigation Flow
- Route: `/(public)/forgot-password`.
- Entry: Via "Forgot password?" link on the Login screen.
- Success ➞ Stays on screen to show success message.
- Back ➞ `/(public)/login`.

## Functions Involved
- **`handleSubmit`** — Validates the input, triggers the `forgotPassword` context function, and handles the success/error states.
  ```tsx
  const handleSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setInlineMessage({
        type: 'error',
        text: 'Please enter your email address.',
      });
      return;
    }

    setInlineMessage(null);
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(trimmedEmail);
      if (!result.success) {
        setInlineMessage({
          type: 'error',
          text: result.error ?? 'Unable to send reset link.',
        });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Check your inbox for password reset instructions.',
      });
    } catch {
      setInlineMessage({
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, forgotPassword]);
  ```

- **`handleInputChange`** — Clears stale global and local errors.
  ```tsx
  const handleInputChange = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);
  ```

- **`handleBackToLogin`** — Redirects the user back to the login flow.
  ```tsx
  const handleBackToLogin = useCallback(() => {
    setInlineMessage(null);
    router.push('/(public)/login');
  }, [router]);
  ```

## Future Enhancements
- Support for phone number based recovery.
- Re-send timer to prevent spamming the API.
- Deep link handling directly to the reset password screen.
