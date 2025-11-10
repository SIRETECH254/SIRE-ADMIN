# Reset Password Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Params and State Management](#params-and-state-management)
- [UI Structure](#ui-structure)
- [Form Inputs](#form-inputs)
- [Validation Rules](#validation-rules)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Feedback & Loading States](#feedback--loading-states)
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
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
```

## Params and State Management
- **Dynamic route:** `app/(public)/reset-password/[token].tsx`, token arrives via `useLocalSearchParams`.
- **Auth hook:** `useAuth().resetPassword` handles API submission; `isLoading` keeps UX consistent with other auth flows.
- **Local state:**
  - `password`, `confirmPassword` (`string`) — controlled inputs.
  - `inlineMessage` (`{ type: 'success' | 'error'; text: string } | null`) — success/error feedback banner.
  - `isSubmitting` (`boolean`) — gate multiple submissions.
- **Derived helpers:** `canSubmit` memoizes disabled state; error banner merges inline + global auth error.

## UI Structure
- **Screen shell:** full-height `View` with Tailwind classes for spacing/background.
- **Keyboard handling:** `KeyboardAvoidingView` + `ScrollView` for mobile ergonomics (mirrors login/forgot password).
- **Content layout:**
  - Header: title + subtitle centered.
  - Form container: stacked inputs, status banner, submit button.
  - Secondary action: pressable link back to login.
- **Branding:** Tailwind + NativeWind classes (brand reds, spacing, rounded corners) consistent with design system.

## Form Inputs
- **Password field** (includes show/hide toggle)
  ```tsx
  <View className="w-full space-y-2">
    <Text className="text-base font-semibold text-gray-800">New password</Text>
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
        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 text-base text-gray-900"
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

- **Confirm password field** (not sent to API; includes show/hide toggle)
  ```tsx
  <View className="w-full space-y-2">
    <Text className="text-base font-semibold text-gray-800">Confirm password</Text>
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
        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 text-base text-gray-900"
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

## Validation Rules
1. Token must exist (guarded before submission; show inline error if missing).
2. Password fields required.
3. `password === confirmPassword`; mismatch yields inline error.
4. While busy (`isLoading || isSubmitting`) disable button to prevent double submits.

## API Integration
- **HTTP client:** `useAuth().resetPassword(token, password)` which calls `authAPI.resetPassword` under the hood (axios).
- **Payload:** `{ newPassword }` only — confirm field omitted intentionally.
- **Success path:** clears auth error, shows green success banner, redirects back to login after short delay.
- **Error handling:** displays API message (from Redux `error`) or fallback inline message.

## Components Used
- React Native: `View`, `Text`, `TextInput`, `Pressable`, `ScrollView`, `KeyboardAvoidingView`, `ActivityIndicator`.
- Hooks: `useLocalSearchParams`, `useRouter`, custom `useAuth`.
- Tailwind (NativeWind) utility classes for layout, color, spacing.

## Feedback & Loading States
- Inline banner uses Tailwind to swap colors:
  - Success → `bg-green-100` background, `text-green-700` copy.
  - Error → `bg-brand-accent/10`, `text-brand-accent`.
- Submit button shows `ActivityIndicator` (white spinner) when busy.
- Success message triggers timed navigation (`setTimeout`) to login route.

## Navigation Flow
- Route path: `/(public)/reset-password/[token]`.
- Guards missing/invalid token by showing error and disabling submit handling.
- On success: navigate to `/(public)/login` with `router.replace`.
- Secondary link: `Pressable` at footer to go back manually (`router.push('/(public)/login')`).

## Functions Involved
- **`clearInlineMessage`** — clears banners and Redux auth errors when inputs change.
  ```tsx
  const clearInlineMessage = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);
  ```
- **`handleSubmit`** — orchestrates validation and API call.
  ```tsx
  const handleSubmit = useCallback(async () => {
    if (!token) {
      setInlineMessage({ type: 'error', text: 'Reset link is missing or invalid.' });
      return;
    }

    if (!password || !confirmPassword) {
      setInlineMessage({ type: 'error', text: 'Enter and confirm your new password.' });
      return;
    }

    if (password !== confirmPassword) {
      setInlineMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    setInlineMessage(null);

    try {
      const result = await resetPassword(token, password);
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

      setTimeout(() => router.replace('/(public)/login'), 1500);
    } catch {
      setInlineMessage({
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [token, password, confirmPassword, resetPassword, router]);
  ```
- **`handleNavigateToLogin`** — clears state and routes back to login screen.

## Future Enhancements
- Integrate password strength indicator and requirements checklist.
- Allow optional password paste detection or confirmation prompt.
- Display countdown auto-redirect visibly instead of implicit timeout.

