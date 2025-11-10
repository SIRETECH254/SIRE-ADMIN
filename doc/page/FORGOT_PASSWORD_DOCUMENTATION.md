# Forgot Password Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
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
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the tree and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` retains `isLoading`, `error`, and auth metadata that the screen can surface.
- **Persistent storage:** `AsyncStorage` keeps tokens and the serialized user; on success the flow can remove the refresh token when “remember me” is unchecked.
- **Hook usage on forgot-password screen:** `const { forgotPassword, isLoading, error, clearError } = useAuth();`

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

**`isLoading` selector reused via `useAuth`:**
```tsx
const isLoading = useSelector((state: RootState) => state.auth.isLoading);
```

## UI Structure
- **Screen shell:** A `View` wrapped in `KeyboardAvoidingView` and `ScrollView` to accommodate smaller displays and software keyboards.
- **Typography:** Standard `Text` components styled via Tailwind (NativeWind) utilities.
- **Layout helpers:** Stacked `View` containers for consistent vertical rhythm and responsive spacing.
- **Feedback:** Inline success or error banners appear beneath the form to inform the user of API outcomes.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│    “Forgot password?”         │
├───────────────────────────────┤
│        Subtitle / Copy        │
│  (“Enter your email address”) │
├───────────────────────────────┤
│        Email TextInput        │
├───────────────────────────────┤
│   Primary Submit Button       │
├───────────────────────────────┤
│  Inline success / error text  │
├───────────────────────────────┤
│   Back to login link/button   │
└───────────────────────────────┘
```

## Form Inputs
- **Email field**
  ```tsx
  <View className="w-full space-y-2">
    <Text className="text-base font-semibold text-gray-800">
      Email
    </Text>
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
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
    />
  </View>
  ```

## API Integration
- **HTTP client:** Uses the shared axios instance exported from `api/config.ts`.
- **Endpoint:** `POST /api/auth/forgot-password`.
- **Payload:** `{ email: string }`.
- **Response contract:** Success returns a confirmation message; error responses populate `response.data.message`.
- **Token handling:** No token exchange occurs; the backend sends reset instructions to the provided email.

## Components Used
- `View`, `KeyboardAvoidingView`, `ScrollView`, `Text`, `TextInput`, `Pressable`, `ActivityIndicator` from React Native.
- `MaterialIcons` from `@expo/vector-icons/MaterialIcons` for iconography reuse if needed (e.g., inline alerts).
- Tailwind (NativeWind) utility classes for spacing, typography, and color.
- Optional `Alert` component from `components/ui/Alert` to standardize feedback states.

## Error Handling
- `useAuth` surfaces API failures so the screen can show a human-friendly message.
- Client-side validation blocks submission when the email field is empty.
- `handleInputChange` clears stale errors once the user edits the field.
- Success responses can render a success banner instructing the user to check their inbox.

## Navigation Flow
- Route: `/(public)/forgot-password`.
- Entry points:
  - Login screen’s “Forgot password?” link (`/(public)/login`).
  - Any guarded flow that needs password assistance.
- On success, the user remains on the page with success messaging and can navigate back to `/(public)/login`.
- Secondary navigation:
  - “Back to sign in” CTA ➞ `/(public)/login`.
  - Future “Didn’t receive email?” link can trigger resends.

## Functions Involved
- **`handleInputChange`** — clears inline and global errors whenever the user edits the email field.
  ```tsx
  const handleInputChange = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);
  ```

- **`handleSubmit`** — validates input, calls `forgotPassword`, and updates status messaging.
  ```tsx
  const handleSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setInlineMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setInlineMessage(null);
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(trimmedEmail);
      if (!result.success) {
        setInlineMessage({ type: 'error', text: result.error ?? 'Unable to send reset link' });
        return;
      }

      if (!rememberMe) {
        await AsyncStorage.removeItem('refreshToken');
      }

      setInlineMessage({
        type: 'success',
        text: 'Check your inbox for password reset instructions.',
      });
    } catch {
      setInlineMessage({ type: 'error', text: 'Unexpected error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, rememberMe, forgotPassword]);
  ```

- **`handleBackToLogin`** — navigates the user back to the sign-in screen.
  ```tsx
  const handleBackToLogin = useCallback(() => {
    setInlineMessage(null);
    router.push('/(public)/login');
  }, [router]);
  ```

## Future Enhancements
- Swap the current placeholder view for the planned interactive form and success states.
- Add resend and support links when rate-limiting or delivery failures occur.
- Capture analytics (e.g., form submits, error reasons) for product feedback.
- Localize copy and validation messaging as part of the broader internationalization effort.
- Extend the flow to handle phone-based recovery once the backend supports SMS resets.

