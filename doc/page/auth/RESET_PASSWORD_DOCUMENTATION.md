# Reset Password Screen Documentation

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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` stores global `error` and `isLoading` states.
- **Hook usage on screen:** `const { resetPassword, isLoading, error, clearError } = useAuth();`
- **Route Params:** `useLocalSearchParams` retrieves the `token` from the URL (e.g., `/(public)/reset-password/[token]`).
- **Local state:**
  - `password`, `confirmPassword`: Managed with standard `useState`.
  - `inlineMessage`: Screen-specific feedback (success/error).
  - `isSubmitting`: Local submission tracker.
  - `isPasswordVisible`, `isConfirmPasswordVisible`: UI visibility toggles.

**`resetPassword` function (from `AuthContext.tsx`):**
```tsx
const resetPassword = async (
  token: string,
  newPassword: string
): Promise<AuthResult> => {
  try {
    await authAPI.resetPassword(token, newPassword);
    console.log('Password reset successfully!');
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to reset password';
    console.error('Failed to reset password:', errorMessage);
    return { success: false, error: errorMessage };
  }
};
```

## UI Structure
- **Screen shell:** standard `View` with white background.
- **Layout helpers:** `KeyboardAvoidingView` for keyboard offsets; `ScrollView` for small screens.
- **Typography:** React Native `Text` components with Tailwind classes.
- **Form Inputs:** Relative `View` wrappers for the password fields to allow absolute positioning of the visibility toggle icon.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│       “Reset password”        │
├───────────────────────────────┤
│           Subtitle            │
│ (“Choose a new password...”)  │
├───────────────────────────────┤
│      New Password Input       │
├───────────────────────────────┤
│    Confirm Password Input     │
├───────────────────────────────┤
│  Inline error / status text   │
├───────────────────────────────┤
│        Update Button          │
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
│  │    Logo      │              │  🔒 New Password   [👁]  │   │
│  │              │              │                          │   │
│  └──────────────┘              │  🔒 Confirm Pass   [👁]  │   │
│                                │                          │   │
│  Reset password                │  Error/Success Message   │   │
│  Choose a new password to      │  ┌────────────────────┐  │   │
│  secure your account.          │  │  Update password   │  │   │
│                                │  └────────────────────┘  │   │
│                                │                          │   │
│                                │  Back to sign in         │   │
│                                └──────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **New Password field**
  ```tsx
  <View className="w-full space-y-2">
    <Text className="form-label">New password</Text>
    <View className="relative w-full">
      <TextInput
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearInlineMessage();
        }}
        autoComplete="password"
        textContentType="newPassword"
        secureTextEntry={!isPasswordVisible}
        placeholder="••••••••"
        className="form-input pr-12"
      />
      <Pressable
        onPress={() => setIsPasswordVisible((prev) => !prev)}
        accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-3.5">
        <MaterialIcons
          name={isPasswordVisible ? 'visibility-off' : 'visibility'}
          size={20}
          color="#7b1c1c"
        />
      </Pressable>
    </View>
  </View>
  ```

- **Confirm Password field**
  ```tsx
  <View className="w-full space-y-2">
    <Text className="form-label">Confirm password</Text>
    <View className="relative w-full">
      <TextInput
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          clearInlineMessage();
        }}
        autoComplete="password"
        textContentType="password"
        secureTextEntry={!isConfirmPasswordVisible}
        placeholder="••••••••"
        className="form-input pr-12"
      />
      <Pressable
        onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
        accessibilityLabel={
          isConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'
        }
        className="absolute right-3 top-3.5">
        <MaterialIcons
          name={isConfirmPasswordVisible ? 'visibility-off' : 'visibility'}
          size={20}
          color="#7b1c1c"
        />
      </Pressable>
    </View>
  </View>
  ```

- **Submit button**
  ```tsx
  <Pressable
    onPress={handleSubmit}
    disabled={!canSubmit}
    className="btn btn-primary mt-2 w-full disabled:opacity-70">
    {isBusy ? (
      <ActivityIndicator color="#ffffff" />
    ) : (
      <Text className="btn-text btn-text-primary">Update password</Text>
    )}
  </Pressable>
  ```

## API Integration
- **HTTP client:** `axios` instance via `authAPI`.
- **Endpoint:** `POST /api/auth/reset-password/${token}`.
- **Payload:** `{ newPassword: string }`.
- **Response contract:** Standard success response.
- **Error responses:** `error.response.data.message` (e.g., "Invalid or expired token").

## Components Used
- `View`, `KeyboardAvoidingView`, `ScrollView`, `Text`, `TextInput`, `Pressable`, `ActivityIndicator` from React Native.
- `MaterialIcons` from `@expo/vector-icons/MaterialIcons` for visibility toggles.
- Tailwind (NativeWind) utility classes.

## Error Handling
- **Local validation:**
  - Token presence check.
  - Required fields check.
  - Password match verification.
- **API errors:** Caught in `handleSubmit` and displayed via `inlineMessage`.
- **Context errors:** Listens to global `error` state.
- **Failsafe:** `clearInlineMessage` clears errors as soon as the user starts correcting inputs.

## Navigation Flow
- Route: `/(public)/reset-password/[token]`.
- Entry: Deep link from password reset email.
- Success ➞ Delayed redirect to `/(public)/login`.
- CTA: "Back to sign in" link.

## Functions Involved
- **`handleSubmit`** — Orchestrates validation, calls context `resetPassword`, and handles the result.
  ```tsx
  const handleSubmit = useCallback(async () => {
    if (!resetToken) {
      setInlineMessage({
        type: 'error',
        text: 'Reset link is missing or invalid.',
      });
      return;
    }

    if (!password || !confirmPassword) {
      setInlineMessage({
        type: 'error',
        text: 'Enter and confirm your new password.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setInlineMessage({
        type: 'error',
        text: 'Passwords do not match.',
      });
      return;
    }

    setIsSubmitting(true);
    setInlineMessage(null);

    try {
      const result = await resetPassword(resetToken, password);
      if (!result.success) {
        setInlineMessage({
          type: 'error',
          text: result.error ?? 'Unable to reset password.',
        });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Password updated! Redirecting to sign in…',
      });

      setTimeout(() => {
        router.replace('/(public)/login');
      }, 1500);
    } catch {
      setInlineMessage({
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, password, resetPassword, resetToken, router]);
  ```

- **`clearInlineMessage`** — Resets both local and global error states.
  ```tsx
  const clearInlineMessage = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);
  ```

- **`handleNavigateToLogin`** — Clears state and redirects to login.
  ```tsx
  const handleNavigateToLogin = useCallback(() => {
    clearInlineMessage();
    router.push('/(public)/login');
  }, [clearInlineMessage, router]);
  ```

## Future Enhancements
- Password strength indicator.
- Real-time validation messages (e.g., "Passwords match!").
- Account lockout logic for repeated failed reset attempts.
