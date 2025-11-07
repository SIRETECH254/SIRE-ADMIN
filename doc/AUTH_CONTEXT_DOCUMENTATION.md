# AuthContext Documentation

## Overview

This document provides comprehensive documentation for the AuthContext implementation in the SIRE-ADMIN application. The AuthContext provides authentication functionality using Redux as the single source of truth (no useReducer), adapted for React Native/Expo environment.

**Location:** `contexts/AuthContext.tsx`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Storage Strategy](#storage-strategy)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

---

## Architecture Overview

The AuthContext provides a centralized authentication system that:

- Uses **Redux** as the single source of truth for all auth state
- Persists authentication state using **AsyncStorage** (React Native)
- Integrates with **expo-router** for navigation
- Provides authentication functions (login, register, OTP, password reset, etc.)
- Handles token refresh and validation automatically
- Manages user profile updates

### Component Structure

```
AuthProvider (Context Provider)
├── Redux Integration (useSelector, useDispatch)
├── AsyncStorage Integration (token persistence)
├── Navigation Integration (expo-router)
└── Auth Functions (login, register, logout, etc.)
```

---

## State Management

### Why Redux Only?

- **Single Source of Truth**: All auth state comes from Redux store
- **Consistency**: No conflicts between local and global state
- **Persistence**: Redux Persist handles state persistence automatically
- **Simplicity**: Fewer moving parts, easier to debug

### Redux State Structure

The auth state is managed entirely through Redux:

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Redux Actions Used

The AuthContext uses the following Redux actions from `redux/slices/authSlice`:

- `loginStart()` - Sets loading state
- `loginSuccess({ user, accessToken, refreshToken })` - Sets authenticated state
- `loginFailure(error)` - Sets error state
- `registerStart()` - Sets loading for registration
- `registerSuccess()` - Clears loading after registration
- `registerFailure(error)` - Sets registration error
- `logout()` - Clears all auth state
- `updateUser(user)` - Updates user in state
- `setTokens({ accessToken, refreshToken? })` - Updates tokens
- `clearError()` - Clears error state
- `setLoading(boolean)` - Sets loading state

### State Access

All state is accessed via `useSelector`:

```typescript
const user = useSelector((state: RootState) => state.auth.user);
const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
const isLoading = useSelector((state: RootState) => state.auth.isLoading);
const error = useSelector((state: RootState) => state.auth.error);
```

---

## Storage Strategy

### AsyncStorage Keys

The following keys are used in AsyncStorage:

- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token
- `user` - Serialized user object (JSON string)

### Storage Flow

1. **On Login/Register**: Tokens and user data are stored in AsyncStorage
2. **On App Start**: AuthContext rehydrates state from AsyncStorage
3. **Background Validation**: User profile is refreshed in background without clearing tokens on failure
4. **On Logout**: All tokens and user data are removed from AsyncStorage

### Rehydration Strategy

```typescript
// 1. Rehydrate immediately from AsyncStorage
if (token && storedUser) {
  // Restore state from storage
  dispatch(loginSuccess({ user, accessToken, refreshToken }));
}

// 2. Background validation (non-blocking)
// Refresh user profile without clearing tokens on failure
```

---

## API Reference

### AuthProvider Props

```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}
```

### Context Value

The AuthContext provides the following value:

```typescript
interface AuthContextValue {
  // State (from Redux)
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth Functions
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  verifyOTP: (otpData: OTPData) => Promise<AuthResult>;
  resendOTP: (emailData: { email: string }) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
  updateProfile: (profileData: ProfileData) => Promise<AuthResult>;
  changePassword: (passwordData: PasswordData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;

  // Google OAuth (optional)
  initiateGoogleAuth?: () => Promise<void>;
  handleGoogleCallback?: (code: string) => Promise<AuthResult>;
  googleAuthWithIdToken?: (idToken: string) => Promise<AuthResult>;
}
```

### Function Details

#### `login(credentials)`

Authenticates a user with email/phone and password.

**Parameters:**
- `credentials: { email?: string; phone?: string; password: string }`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

**Example:**
```typescript
const result = await login({ email: 'user@example.com', password: 'password123' });
if (result.success) {
  // User is authenticated
}
```

#### `register(userData)`

Registers a new user account.

**Parameters:**
- `userData: { firstName: string; lastName: string; email: string; password: string; phone?: string }`

**Returns:**
```typescript
Promise<{ success: boolean; data?: any; error?: string }>
```

#### `verifyOTP(otpData)`

Verifies email OTP and activates account.

**Parameters:**
- `otpData: { email: string; otp: string }`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `resendOTP(emailData)`

Resends OTP verification email.

**Parameters:**
- `emailData: { email: string }`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `forgotPassword(email)`

Sends password reset email.

**Parameters:**
- `email: string`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `resetPassword(token, newPassword)`

Resets password using reset token.

**Parameters:**
- `token: string` - Password reset token
- `newPassword: string` - New password

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `updateProfile(profileData)`

Updates user profile information.

**Parameters:**
- `profileData: { firstName?: string; lastName?: string; phone?: string; avatar?: string }`

**Returns:**
```typescript
Promise<{ success: boolean; user?: User; error?: string }>
```

#### `changePassword(passwordData)`

Changes user password.

**Parameters:**
- `passwordData: { currentPassword: string; newPassword: string }`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `logout()`

Logs out the current user and clears all auth data.

**Returns:**
```typescript
Promise<void>
```

**Note:** Automatically navigates to login page after logout.

#### `clearError()`

Clears the current error state.

**Returns:**
```typescript
void
```

---

## Integration Guide

### 1. Provider Setup

Wrap your app with `AuthProvider` in the root layout:

```typescript
// app/_layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          {/* Your app components */}
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}
```

### 2. Using Auth in Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      // Handle success
    } else {
      // Handle error (result.error)
    }
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.firstName}!</Text>
      ) : (
        <Button onPress={handleLogin} title="Login" />
      )}
    </View>
  );
}
```

### 3. Protected Routes

Use the auth state to protect routes:

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';

function ProtectedScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <YourProtectedContent />;
}
```

---

## Usage Examples

### Login Flow

```typescript
const { login, isLoading, error } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const result = await login({ email, password });
  
  if (result.success) {
    // Navigate to home or dashboard
    router.push('/home');
  } else {
    // Error is already set in Redux state
    console.error('Login failed:', result.error);
  }
};
```

### Registration Flow

```typescript
const { register, verifyOTP, resendOTP } = useAuth();

// Step 1: Register
const handleRegister = async (userData) => {
  const result = await register(userData);
  if (result.success) {
    // Show OTP input screen
    setShowOTP(true);
  }
};

// Step 2: Verify OTP
const handleVerifyOTP = async (email: string, otp: string) => {
  const result = await verifyOTP({ email, otp });
  if (result.success) {
    // User is authenticated
    router.push('/home');
  }
};

// Step 3: Resend OTP if needed
const handleResendOTP = async (email: string) => {
  await resendOTP({ email });
};
```

### Profile Update

```typescript
const { updateProfile, user } = useAuth();

const handleUpdateProfile = async (profileData) => {
  try {
    const result = await updateProfile(profileData);
    if (result.success) {
      // Profile updated, user state is automatically updated
      console.log('Updated user:', result.user);
    }
  } catch (error) {
    // Handle error
  }
};
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User is automatically navigated to login page
};
```

---

## Best Practices

### 1. Error Handling

Always check the `success` property and handle errors:

```typescript
const result = await login(credentials);
if (!result.success) {
  // Handle error (result.error contains error message)
  Alert.alert('Error', result.error);
}
```

### 2. Loading States

Use the `isLoading` state from context to show loading indicators:

```typescript
const { isLoading } = useAuth();

if (isLoading) {
  return <ActivityIndicator />;
}
```

### 3. State Access

Access state directly from context, not from Redux:

```typescript
// ✅ Good
const { user, isAuthenticated } = useAuth();

// ❌ Avoid (unless you need Redux-specific features)
const user = useSelector((state) => state.auth.user);
```

### 4. Token Management

Tokens are automatically managed by AuthContext:
- Stored in AsyncStorage on login
- Refreshed automatically on 401 errors (via API interceptor)
- Cleared on logout

### 5. Navigation

Use expo-router's navigation after auth actions:

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login(credentials);
  if (result.success) {
    router.replace('/home');
  }
};
```

---

## Troubleshooting

### State Not Persisting

- Check if Redux Persist is configured correctly
- Verify AsyncStorage is working (check for errors in console)
- Ensure `auth` slice is in the persist whitelist

### Navigation Not Working

- Ensure `expo-router` is properly installed
- Check that navigation happens after async operations complete
- Use `router.replace()` instead of `router.push()` for auth flows

### Token Refresh Issues

- Check API interceptor configuration in `api/config.ts`
- Verify refresh token endpoint is correct
- Check network connectivity

### Error State Not Clearing

- Use `clearError()` function to manually clear errors
- Errors are automatically cleared on new auth attempts

---

## Type Definitions

### User Type

```typescript
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'finance' | 'project_manager' | 'staff' | 'client';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Auth Result Type

```typescript
interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
  user?: User;
}
```

---

## Notes

- All authentication state is managed through Redux
- Tokens are persisted in AsyncStorage for offline access
- User profile is automatically refreshed on app start
- Background token validation doesn't clear tokens on failure (preserves offline access)
- Navigation is handled automatically on logout
- Error messages come from the API when available

---

**Last Updated:** January 2025  
**Version:** 1.0.0

