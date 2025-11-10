# Login Screen Documentation

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
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` stores `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`, and `error`.
- **Persistent storage:** `AsyncStorage` keeps the tokens and serialized user object so sessions survive reloads.
- **Hook usage on login screen:** `const { login, isLoading, error, clearError } = useAuth();`

**`login` function (from `AuthContext.tsx`):**
```tsx
const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
  dispatch(loginStart());
  dispatch(setAuthLoading(true));

  try {
    const response = await authAPI.login(credentials);
    const { user: userData, accessToken, refreshToken } = response.data.data;

    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));

    dispatch(
      loginSuccess({
        user: userData,
        accessToken,
        refreshToken,
      })
    );

    console.log('Login successful!');
    return { success: true };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Login failed';
    dispatch(loginFailure(errorMessage));
    dispatch(setAuthFailure(errorMessage));
    console.error('Login failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
};
```

**`isLoading` constant inside `AuthProvider`:**
```tsx
const isLoading = useSelector((state: RootState) => state.auth.isLoading);
```

## UI Structure
- **Screen shell:** standard `View` with background color and padding from Tailwind (NativeWind).
- **Typography:** plain `Text` from React Native with Tailwind utility classes for styling.
- **Layout helpers:** `View` orchestrates spacing; Tailwind classes drive the vertical stack.
- **Branding:** Optional `Image` or `Logo` component can sit above the form; not yet implemented.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│   “Welcome back” (H1 style)   │
├───────────────────────────────┤
│           Subtitle            │
│   (“Sign in to your account”) │
├───────────────────────────────┤
│        Email TextInput        │
├───────────────────────────────┤
│       Password TextInput      │
├───────────────────────────────┤
│ [ ] Remember me    Forgot?    │
├───────────────────────────────┤
│        Primary Button         │
├───────────────────────────────┤
│  Inline error / status text   │
├───────────────────────────────┤
│      “Create account” CTA     │
└───────────────────────────────┘
```

## Form Inputs
- **Email field**
  ```tsx
  <View className="w-full space-y-2">
    <Text className="text-base font-semibold text-gray-800">Email</Text>
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

- **Password field**
  ```tsx
  <View className="w-full space-y-2">
    <Text className="text-base font-semibold text-gray-800">Password</Text>
    <View className="relative w-full">
      <TextInput
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          handleInputChange();
        }}
        autoComplete="password"
        textContentType="password"
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

- **Remember me toggle**
  ```tsx
  <View className="mt-4 flex-row items-center justify-between">
    <Pressable
      onPress={() => {
        const next = !rememberMe;
        setRememberMe(next);
        handleInputChange();
      }}
      className="flex-row items-center space-x-3">
      <MaterialIcons
        name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
        size={22}
        color={rememberMe ? '#7b1c1c' : '#9ca3af'}
      />
      <Text className="text-sm text-gray-700">Remember me</Text>
    </Pressable>
    <Pressable onPress={handleForgotPassword}>
      <Text className="text-sm font-semibold text-brand-primary">Forgot password?</Text>
    </Pressable>
  </View>
  ```
  
- **Submit button**
  ```tsx
  <Pressable
    onPress={onSubmit}
    disabled={isSubmitting || isLoading}
    className="mt-6 w-full items-center justify-center rounded-xl bg-brand-primary py-3 disabled:bg-disabled"
  >
    {isSubmitting || isLoading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text className="text-base font-semibold text-white">Sign in</Text>
    )}
  </Pressable>
  ```

Form state is managed with React's `useState` hooks to keep the implementation lightweight.

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts`.
- **Endpoint:** `POST /api/auth/login`.
- **Payload:** `{ email?: string; phone?: string; password: string }`.
- **Response contract:** `data.data` contains `{ user, accessToken, refreshToken }`.
- **Token handling:** Tokens saved to `AsyncStorage`; Redux receives `loginSuccess`.
- **Error responses:** API returns a message in `response.data.message`; fallback to generic message.

## Components Used
- `View`, `KeyboardAvoidingView`, `ScrollView`, `Text`, `TextInput`, `Pressable`, `ActivityIndicator` from React Native.
- `MaterialIcons` from `@expo/vector-icons/MaterialIcons` for password visibility toggle and checkbox icons.
- Tailwind (NativeWind) classes for spacing, colors, and typography.
- No cards and no themed text components.

## Error Handling
- `useAuth` dispatches `loginFailure` and `setAuthFailure`, populating Redux `error`.
- Login screen listens to `error` and renders a plain `Text` message styled with Tailwind utilities.
- Client-side checks ensure inputs are not empty before submission.
- `handleInputChange` clears stale errors as soon as the user edits inputs.
- Network failures show a generic retry message; consider adding retry UI later.
- Input values persist in local state after failures to avoid retyping.

## Navigation Flow
- Route: `/(public)/login`.
- On app launch, `app/index.tsx` checks `useAuth`:
  - Authenticated ➞ redirect to `/(authenticated)`.
  - Not authenticated ➞ redirect to `/(public)/login`.
- Successful login ➞ `router.replace('/(authenticated)')`.
- Secondary navigation:
  - “Forgot password?” ➞ `/(public)/forgot-password`.
  - “Sign up” ➞ `/(public)/register`.
  - “Back home” link ➞ `/`.

## Functions Involved
- **`onSubmit`** — orchestrates local validation, calls `login`, handles navigation, and clears tokens when “remember me” is unchecked.
  ```tsx
  const onSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setInlineError('Please enter both email and password.');
      return;
    }

    setInlineError(null);
    setIsSubmitting(true);

    try {
      const result = await login({ email: trimmedEmail, password });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to sign in');
        return;
      }

      if (!rememberMe) {
        await AsyncStorage.removeItem('refreshToken');
      }

      router.replace('/(authenticated)');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, rememberMe, login, router]);
  ```

- **`handleInputChange`** — clears Redux and inline errors whenever the user adjusts a field.
  ```tsx
  const handleInputChange = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineError(null);
  }, [error, clearError]);
  ```

- **`handleForgotPassword`** — navigates to the password reset flow.
  ```tsx
  const handleForgotPassword = useCallback(() => {
    setInlineError(null);
    router.push('/(public)/forgot-password');
  }, [router]);
  ```

- **`handleNavigateToRegister`** — links to the registration flow for new admins.
  ```tsx
  const handleNavigateToRegister = useCallback(() => {
    setInlineError(null);
    router.push('/(public)/register');
  }, [router]);
  ```

## Future Enhancements
- Add optional form libraries (`react-hook-form`) when we reintroduce advanced validation.
- Expand the card layout to use shared design-system utilities once global component classes are finalized.
- Offer social sign-in placeholders (if backend support arrives).
- Display rate-limiting or account lockout feedback when the API returns those states.

