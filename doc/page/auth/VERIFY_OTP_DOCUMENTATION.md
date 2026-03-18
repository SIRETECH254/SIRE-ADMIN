# Verify OTP Screen Documentation

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
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Future imports
// import { useAuth } from '@/contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` manages auth states.
- **Hook usage (intended):** `const { verifyOTP, resendOTP, isLoading, error } = useAuth();`

**`verifyOTP` function (from `AuthContext.tsx`):**
```tsx
const verifyOTP = async (otpData: OTPData): Promise<AuthResult> => {
  dispatch(loginStart());

  try {
    const response = await authAPI.verifyOTP(otpData);
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

    console.log('Email verified successfully!');
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'OTP verification failed';
    dispatch(loginFailure(errorMessage));
    dispatch(setAuthFailure(errorMessage));
    console.error('OTP verification failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
};
```

## UI Structure
- **Current State:** Placeholder screen using `ThemedView` and `ThemedText`.
- **Planned State:** Standard verification layout with a numeric OTP input field.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│         “Verify OTP”          │
├───────────────────────────────┤
│           Subtitle            │
│   (“Enter the code sent...”)  │
├───────────────────────────────┤
│        OTP Input Field        │
├───────────────────────────────┤
│        Verify Button          │
├───────────────────────────────┤
│        Resend Code Link       │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐              ┌──────────────────────────┐   │
│  │              │              │                          │   │
│  │    Logo      │              │      Enter OTP Code      │   │
│  │              │              │                          │   │
│  └──────────────┘              │  [_] [_] [_] [_] [_] [_] │   │
│                                │                          │   │
│  Verify Email                  │  ┌────────────────────┐  │   │
│  Please enter the 6-digit      │  │      Verify        │  │   │
│  code sent to your email.      │  └────────────────────┘  │   │
│                                │                          │   │
│                                │  Didn't receive code?    │   │
│                                │  Resend in 30s           │   │
│                                └──────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Current Implementation:** None (Placeholder).
- **Planned Implementation:**
  - 6-digit numeric input (either split cells or a single focused input).
  - Submit button with `ActivityIndicator`.

## API Integration
- **HTTP client:** `axios` instance.
- **Endpoint:** `POST /api/auth/verify-otp`.
- **Payload:** `{ email: string, otp: string }`.
- **Token handling:** On success, tokens are stored in `AsyncStorage` and Redux state is updated.

## Components Used
- `ThemedView`, `ThemedText` from custom components.
- Standard `View` and `StyleSheet` from React Native.

## Error Handling
- **Placeholder:** Not yet implemented.
- **Planned:**
  - Validation for 6-digit length.
  - API error display for invalid or expired codes.
  - Rate-limiting for resend attempts.

## Navigation Flow
- Route: `/(public)/verify-otp`.
- Entry: Automatic redirect after registration.
- Success ➞ `/(authenticated)/index`.

## Functions Involved
- **`verifyOTP`**: Main verification logic.
- **`resendOTP`**: Triggers a new code to be sent to the user's email.

## Future Enhancements
- Auto-focus on first OTP digit.
- Clipboard auto-paste for the code.
- Countdown timer for the "Resend" button.
