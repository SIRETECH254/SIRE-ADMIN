# Redux Documentation

## Overview

This document provides comprehensive documentation for Redux state management in the Sire Admin application. The Redux setup uses Redux Toolkit for simplified state management and Redux Persist for state persistence across app restarts.

**Reference Structure:** This implementation is based on the store structure from the TEO ADMIN project, adapted for the SIRE-ADMIN project.

**Location:** All Redux files are located in the `redux/` folder.

---

## Table of Contents

1. [Installation](#installation)
2. [Project Structure](#project-structure)
3. [Store Configuration](#store-configuration)
4. [Slices](#slices)
5. [TypeScript Types](#typescript-types)
6. [Usage in Components](#usage-in-components)
7. [Best Practices](#best-practices)

---

## Installation

The following packages are required for Redux in this project:

```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

### Dependencies

- **@reduxjs/toolkit** - Official Redux Toolkit for simplified Redux logic
- **react-redux** - React bindings for Redux
- **redux-persist** - Persist and rehydrate Redux store using AsyncStorage

---

## Project Structure

```
redux/
├── index.ts              # Store configuration and exports
├── types.ts              # TypeScript type definitions
└── slices/
    └── authSlice.ts      # Authentication slice
```

### File Descriptions

- **`redux/index.ts`** - Main store configuration file that:
  - Configures the Redux store
  - Sets up Redux Persist
  - Combines all reducers
  - Exports store, persistor, and types

- **`redux/types.ts`** - TypeScript type definitions for:
  - State interfaces
  - User types
  - Root state type

- **`redux/slices/authSlice.ts`** - Authentication slice containing:
  - Auth state management
  - Login/Register actions
  - User management actions
  - Token management

---

## Store Configuration

### Store Setup

The store is configured in `redux/index.ts`:

```typescript
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

export const persistor = persistStore(store);
```

### Key Features

1. **Redux Persist** - Automatically saves and restores auth state using AsyncStorage
2. **Redux DevTools** - Enabled in development mode for debugging
3. **TypeScript Support** - Full type safety with TypeScript
4. **Middleware** - Configured to handle redux-persist actions

---

## Slices

### Auth Slice

The auth slice manages authentication state including user data, tokens, and authentication status.

#### State Structure

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

#### Available Actions

##### Login Actions

- **`loginStart()`** - Initiates login process
  - Sets `isLoading` to `true`
  - Clears any previous errors

- **`loginSuccess(payload)`** - Handles successful login
  - Payload: `{ user: User, accessToken: string, refreshToken: string }`
  - Sets user data and tokens
  - Sets `isAuthenticated` to `true`

- **`loginFailure(error)`** - Handles login failure
  - Payload: `string` (error message)
  - Sets error message
  - Resets auth state

##### Register Actions

- **`registerStart()`** - Initiates registration process
- **`registerSuccess()`** - Handles successful registration
- **`registerFailure(error)`** - Handles registration failure

##### Other Actions

- **`logout()`** - Clears all auth data and logs out user
- **`updateUser(user)`** - Updates user information in state
- **`setTokens(tokens)`** - Updates access and refresh tokens
- **`clearError()`** - Clears error message
- **`setLoading(boolean)`** - Sets loading state

#### Usage Example

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice';
import { RootState } from '@/redux';

// In a component
const dispatch = useDispatch();
const { user, isAuthenticated, isLoading } = useSelector(
  (state: RootState) => state.auth
);

// Dispatch login action
dispatch(loginStart());
```

---

## TypeScript Types

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

### Auth State Type

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

### Root State Type

```typescript
interface RootState {
  auth: AuthState;
}
```

---

## Usage in Components

### Provider Setup

The Redux Provider is already set up in `app/_layout.tsx`:

```typescript
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* Your app components */}
      </PersistGate>
    </Provider>
  );
}
```

### Using Hooks in Components

#### useSelector Hook

Access state from Redux store:

```typescript
import { useSelector } from 'react-redux';
import { RootState } from '@/redux';

function MyComponent() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.firstName}!</Text>
      ) : (
        <Text>Please log in</Text>
      )}
    </View>
  );
}
```

#### useDispatch Hook

Dispatch actions to update state:

```typescript
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '@/redux/slices/authSlice';

function LoginComponent() {
  const dispatch = useDispatch();

  const handleLogin = async (credentials: any) => {
    try {
      // Call your API
      const response = await authAPI.login(credentials);
      
      // Dispatch success action
      dispatch(loginSuccess({
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      }));
    } catch (error: any) {
      dispatch(loginFailure(error.message));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    // Your component JSX
  );
}
```

### Typed Hooks (Recommended)

For better TypeScript support, you can create typed hooks:

```typescript
// redux/hooks.ts (optional - can be created later)
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

Then use them in components:

```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  // TypeScript will provide full type safety
}
```

---

## Integration with API

### Example: Login Flow

```typescript
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice';
import { authAPI } from '@/api';

async function handleLogin(email: string, password: string) {
  dispatch(loginStart());
  
  try {
    const response = await authAPI.login({ email, password });
    
    if (response.data.success) {
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Save tokens to AsyncStorage (handled by API interceptor)
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      
      // Update Redux state
      dispatch(loginSuccess({ user, accessToken, refreshToken }));
    }
  } catch (error: any) {
    dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
  }
}
```

### Example: Logout Flow

```typescript
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/api';

async function handleLogout() {
  try {
    // Call logout API
    await authAPI.logout();
  } catch (error) {
    // Continue with logout even if API call fails
  } finally {
    // Clear AsyncStorage
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    
    // Clear Redux state
    dispatch(logout());
  }
}
```

---

## Best Practices

### 1. State Structure

- Keep state normalized and flat
- Avoid nested state structures
- Use slices to organize related state

### 2. Actions

- Use Redux Toolkit's `createSlice` for action creators
- Keep actions focused and specific
- Use descriptive action names

### 3. Selectors

- Create reusable selectors for complex state access
- Use `useSelector` with specific state paths
- Avoid selecting entire state objects

### 4. Performance

- Use `useSelector` with equality functions when needed
- Memoize selectors for expensive computations
- Avoid unnecessary re-renders by selecting only needed state

### 5. Type Safety

- Always use TypeScript types
- Export and use `RootState` type
- Type action payloads properly

### 6. Error Handling

- Always handle errors in async actions
- Use error state in slices
- Display user-friendly error messages

### 7. Testing

- Test reducers with different action payloads
- Test selectors with various state shapes
- Mock store for component testing

---

## Adding New Slices

To add a new slice (e.g., `userSlice`, `projectSlice`):

1. **Create the slice file:**
   ```typescript
   // redux/slices/userSlice.ts
   import { createSlice, PayloadAction } from '@reduxjs/toolkit';
   
   const userSlice = createSlice({
     name: 'user',
     initialState: { /* initial state */ },
     reducers: {
       // Your reducers
     },
   });
   
   export const { /* actions */ } = userSlice.actions;
   export default userSlice.reducer;
   ```

2. **Add to root reducer:**
   ```typescript
   // redux/index.ts
   import userReducer from './slices/userSlice';
   
   const rootReducer = combineReducers({
     auth: authReducer,
     user: userReducer, // Add new reducer
   });
   ```

3. **Update types:**
   ```typescript
   // redux/types.ts
   export interface RootState {
     auth: AuthState;
     user: UserState; // Add new state type
   }
   ```

---

## Redux DevTools

Redux DevTools are enabled in development mode. To use:

1. Install Redux DevTools browser extension (for web)
2. Use React Native Debugger for mobile development
3. Connect to the store using the DevTools connection

---

## Troubleshooting

### Common Issues

1. **State not persisting:**
   - Check if slice is in `whitelist` in persist config
   - Verify AsyncStorage is working
   - Check for serialization errors

2. **Type errors:**
   - Ensure all types are properly exported
   - Use `RootState` type for selectors
   - Check action payload types

3. **Re-render issues:**
   - Use specific selectors instead of selecting entire state
   - Memoize selectors if needed
   - Check for unnecessary state updates

---

## Reference

- **Redux Toolkit Documentation:** https://redux-toolkit.js.org/
- **React-Redux Documentation:** https://react-redux.js.org/
- **Redux Persist Documentation:** https://github.com/rt2zz/redux-persist

---

## Notes

- All state is persisted using AsyncStorage
- Only auth state is persisted (configured in `whitelist`)
- Redux DevTools are enabled in development mode
- TypeScript provides full type safety
- Actions are automatically generated by Redux Toolkit

---

**Last Updated:** January 2025  
**Version:** 1.0.0

