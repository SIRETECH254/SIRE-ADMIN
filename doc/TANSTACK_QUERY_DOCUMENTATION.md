# TanStack Query Documentation

## Overview

This document provides comprehensive documentation for TanStack Query (React Query) implementation in the SIRE-ADMIN application. TanStack Query is used for server state management, providing powerful data fetching, caching, synchronization, and updating capabilities.

**Location:** All TanStack Query hooks are located in the `tanstack/` folder.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Setup and Configuration](#setup-and-configuration)
3. [QueryClient Configuration](#queryclient-configuration)
4. [Custom Hooks Pattern](#custom-hooks-pattern)
5. [Query Hooks (useQuery)](#query-hooks-usequery)
6. [Mutation Hooks (useMutation)](#mutation-hooks-usemutation)
7. [Cache Invalidation Strategies](#cache-invalidation-strategies)
8. [Error Handling Patterns](#error-handling-patterns)
9. [Best Practices](#best-practices)
10. [Usage Examples](#usage-examples)

---

## Introduction

TanStack Query (formerly React Query) is a powerful data synchronization library for React applications. It provides:

- **Automatic Caching**: Data is cached automatically with configurable stale times
- **Background Refetching**: Keeps data fresh automatically
- **Request Deduplication**: Prevents duplicate requests
- **Optimistic Updates**: Update UI before server confirms
- **Error Handling**: Built-in error states and retry logic
- **Loading States**: Built-in loading and fetching states

### Why TanStack Query?

- Reduces boilerplate code for data fetching
- Provides excellent developer experience
- Handles complex caching scenarios automatically
- Works seamlessly with existing API layer (axios)
- Integrates well with Redux for client state

---

## Setup and Configuration

### Installation

```bash
npm install @tanstack/react-query
```

### Provider Setup

The QueryClientProvider is set up in `app/_layout.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Wrap your app
<QueryClientProvider client={queryClient}>
  {/* Your app */}
</QueryClientProvider>
```

---

## QueryClient Configuration

### Default Options

The QueryClient is configured with the following default options:

- **staleTime**: `5 * 60 * 1000` (5 minutes)
  - Data is considered fresh for 5 minutes
  - No refetch occurs during this time

- **gcTime**: `10 * 60 * 1000` (10 minutes, formerly cacheTime)
  - Unused data is garbage collected after 10 minutes
  - Data remains in cache for this duration even if not used

- **retry**: `1`
  - Failed requests are retried once
  - Reduces unnecessary network calls

- **refetchOnWindowFocus**: `false`
  - Prevents automatic refetch when window regains focus
  - Better for mobile/React Native apps

### Mutation Default Options

- **retry**: `1`
  - Failed mutations are retried once

---

## Custom Hooks Pattern

### Folder Structure

All TanStack Query hooks are organized in the `tanstack/` folder:

```
tanstack/
├── index.ts              # Exports all hooks
├── useClients.ts         # Client-related hooks
├── useServices.ts         # Service-related hooks
├── useQuotations.ts       # Quotation-related hooks
├── useInvoices.ts         # Invoice-related hooks
├── usePayments.ts         # Payment-related hooks
├── useProjects.ts         # Project-related hooks
├── useTestimonials.ts     # Testimonial-related hooks
├── useNotifications.ts   # Notification-related hooks
├── useContact.ts          # Contact-related hooks
├── useDashboard.ts        # Dashboard-related hooks
└── useUsers.ts            # User-related hooks
```

### Hook Naming Convention

- **Query Hooks**: `useGet[Resource]` or `useGet[Resource]ById`
  - Example: `useGetClients`, `useGetClient`

- **Mutation Hooks**: `use[Action][Resource]`
  - Example: `useCreateClient`, `useUpdateClient`, `useDeleteClient`

---

## Query Hooks (useQuery)

Query hooks are used for GET operations (fetching data).

### Basic Structure

```typescript
import { useQuery } from '@tanstack/react-query';
import { clientAPI } from '@/api';

export const useGetClients = (params = {}) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => {
      const response = await clientAPI.getAllClients(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
```

### Query Hook Options

- **queryKey**: Array that uniquely identifies the query
  - Format: `['resource', params/id]`
  - Used for cache management and invalidation

- **queryFn**: Async function that fetches data
  - Must return a Promise
  - Typically calls API and returns `response.data`

- **enabled**: Boolean to conditionally enable/disable query
  - Useful when query depends on other data
  - Example: `enabled: !!userId`

- **staleTime**: Time in milliseconds before data is considered stale
  - Default: 5 minutes (from QueryClient config)

- **gcTime**: Time in milliseconds before unused data is garbage collected
  - Default: 10 minutes (from QueryClient config)

### Query Hook Return Value

```typescript
const {
  data,           // The data returned from queryFn
  isLoading,      // True if query is fetching for the first time
  isFetching,     // True if query is fetching (including refetches)
  isError,        // True if query encountered an error
  error,          // Error object if query failed
  refetch,        // Function to manually refetch
  isSuccess,      // True if query succeeded
} = useGetClients();
```

### Conditional Queries

```typescript
export const useGetClient = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await clientAPI.getClient(clientId);
      return response.data;
    },
    enabled: !!clientId, // Only run if clientId exists
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
```

---

## Mutation Hooks (useMutation)

Mutation hooks are used for POST, PUT, PATCH, and DELETE operations.

### Basic Structure

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAPI } from '@/api';

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData: any) => {
      const response = await clientAPI.createClient(clientData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      console.log('Client created successfully');
    },
    onError: (error: any) => {
      console.error('Create client error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create client';
      console.error('Error:', errorMessage);
    },
  });
};
```

### Mutation Hook Options

- **mutationFn**: Async function that performs the mutation
  - Receives variables as parameter
  - Must return a Promise

- **onSuccess**: Callback executed on successful mutation
  - Receives data and variables as parameters
  - Typically used for cache invalidation and notifications

- **onError**: Callback executed on mutation failure
  - Receives error and variables as parameters
  - Typically used for error handling and notifications

### Mutation Hook Return Value

```typescript
const {
  mutate,         // Function to trigger mutation
  mutateAsync,    // Async function that returns a Promise
  isLoading,      // True if mutation is in progress
  isError,        // True if mutation failed
  error,          // Error object if mutation failed
  isSuccess,      // True if mutation succeeded
  data,           // Data returned from successful mutation
  reset,          // Function to reset mutation state
} = useCreateClient();

// Usage
mutate(clientData);
// or
await mutateAsync(clientData);
```

### Mutation with Variables

```typescript
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, clientData }: { clientId: string; clientData: any }) => {
      const response = await clientAPI.updateClient(clientId, clientData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate both list and specific client
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      console.log('Client updated successfully');
    },
    onError: (error: any) => {
      console.error('Update client error:', error);
    },
  });
};
```

---

## Cache Invalidation Strategies

### Invalidate Queries

Invalidate queries to trigger refetch:

```typescript
// Invalidate all queries with key 'clients'
queryClient.invalidateQueries({ queryKey: ['clients'] });

// Invalidate specific client
queryClient.invalidateQueries({ queryKey: ['client', clientId] });

// Invalidate all queries starting with 'client'
queryClient.invalidateQueries({ queryKey: ['client'] });
```

### Refetch Queries

Manually refetch queries:

```typescript
// Refetch all 'clients' queries
queryClient.refetchQueries({ queryKey: ['clients'] });
```

### Update Query Data

Update cache directly without refetching:

```typescript
queryClient.setQueryData(['client', clientId], (oldData) => {
  return { ...oldData, ...updatedData };
});
```

### Common Patterns

1. **After Create**: Invalidate list query
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['clients'] });
   }
   ```

2. **After Update**: Invalidate both list and item queries
   ```typescript
   onSuccess: (data, variables) => {
     queryClient.invalidateQueries({ queryKey: ['clients'] });
     queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
   }
   ```

3. **After Delete**: Invalidate list query
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['clients'] });
   }
   ```

---

## Error Handling Patterns

### Query Error Handling

```typescript
const { data, isError, error } = useGetClients();

if (isError) {
  const errorMessage = error?.response?.data?.message || 'Failed to fetch clients';
  // Handle error (show toast, alert, etc.)
}
```

### Mutation Error Handling

```typescript
const createClient = useCreateClient();

const handleCreate = async (clientData: any) => {
  try {
    await createClient.mutateAsync(clientData);
    // Success handling
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || 'Failed to create client';
    // Error handling
  }
};
```

### Global Error Handling

Errors are logged in the mutation's `onError` callback. For user-facing errors, consider:

- Toast notifications (can be added later)
- Alert dialogs
- Error state in UI components

---

## Best Practices

### 1. Query Key Structure

- Use consistent, hierarchical query keys
- Include all parameters that affect the query
- Example: `['clients', { page: 1, limit: 10 }]`

### 2. Stale Time Configuration

- Set appropriate stale times based on data freshness requirements
- Use longer stale times for relatively static data
- Use shorter stale times for frequently changing data

### 3. Conditional Queries

- Use `enabled` option to prevent unnecessary queries
- Example: `enabled: !!userId` prevents query when userId is missing

### 4. Cache Invalidation

- Invalidate related queries after mutations
- Invalidate both list and detail queries after updates
- Consider optimistic updates for better UX

### 5. Error Handling

- Always handle errors in mutations
- Provide user-friendly error messages
- Log errors for debugging

### 6. TypeScript

- Type all hook parameters and return values
- Use proper types from API responses
- Leverage TypeScript for better developer experience

### 7. Performance

- Use `staleTime` to reduce unnecessary refetches
- Use `gcTime` to manage cache size
- Consider pagination for large datasets

---

## Usage Examples

### Example 1: Fetching Data

```typescript
import { useGetClients } from '@/tanstack';

function ClientsList() {
  const { data, isLoading, isError, error } = useGetClients({ page: 1, limit: 10 });

  if (isLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Error: {error?.message}</Text>;

  return (
    <View>
      {data?.data?.clients?.map((client) => (
        <Text key={client.id}>{client.name}</Text>
      ))}
    </View>
  );
}
```

### Example 2: Creating Data

```typescript
import { useCreateClient } from '@/tanstack';

function CreateClientForm() {
  const createClient = useCreateClient();

  const handleSubmit = async (formData: any) => {
    try {
      await createClient.mutateAsync(formData);
      // Navigate or show success message
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <View>
      <Button
        onPress={handleSubmit}
        disabled={createClient.isLoading}
        title={createClient.isLoading ? 'Creating...' : 'Create Client'}
      />
    </View>
  );
}
```

### Example 3: Updating Data

```typescript
import { useUpdateClient } from '@/tanstack';

function EditClient({ clientId }: { clientId: string }) {
  const updateClient = useUpdateClient();

  const handleUpdate = async (clientData: any) => {
    try {
      await updateClient.mutateAsync({ clientId, clientData });
      // Show success message
    } catch (error) {
      // Error handling
    }
  };

  return (
    <View>
      {/* Form */}
      <Button onPress={handleUpdate} title="Update" />
    </View>
  );
}
```

### Example 4: Conditional Query

```typescript
import { useGetClient } from '@/tanstack';

function ClientDetails({ clientId }: { clientId?: string }) {
  const { data, isLoading } = useGetClient(clientId || '');

  if (!clientId) return <Text>No client selected</Text>;
  if (isLoading) return <Text>Loading...</Text>;

  return <Text>{data?.data?.client?.name}</Text>;
}
```

### Example 5: Multiple Queries

```typescript
import { useGetClient, useGetClientProjects } from '@/tanstack';

function ClientDashboard({ clientId }: { clientId: string }) {
  const { data: client } = useGetClient(clientId);
  const { data: projects } = useGetClientProjects(clientId);

  return (
    <View>
      <Text>Client: {client?.data?.client?.name}</Text>
      <Text>Projects: {projects?.data?.projects?.length}</Text>
    </View>
  );
}
```

---

## Integration with Existing Code

### API Layer

TanStack Query hooks use the existing API layer (`api/index.ts`):

```typescript
import { clientAPI } from '@/api';

export const useGetClients = (params = {}) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => {
      const response = await clientAPI.getAllClients(params);
      return response.data;
    },
  });
};
```

### Redux Integration

- TanStack Query handles server state (data from API)
- Redux handles client state (UI state, auth state)
- Both can coexist in the same application

### Auth Context

- Authentication is handled in `AuthContext` (not in TanStack Query)
- API interceptors handle token management
- TanStack Query hooks automatically use authenticated requests

---

## Troubleshooting

### Common Issues

1. **Queries not refetching**
   - Check `staleTime` configuration
   - Verify query keys are correct
   - Ensure `refetchOnWindowFocus` is not blocking

2. **Cache not invalidating**
   - Verify query keys match exactly
   - Check that `invalidateQueries` is called in `onSuccess`

3. **TypeScript errors**
   - Ensure proper types are imported
   - Check API response types match expected types

4. **Multiple requests**
   - Check if queries are enabled unnecessarily
   - Verify request deduplication is working

---

## Notes

- All hooks follow TypeScript typing conventions
- Error handling uses console.error (toast notifications can be added later)
- Cache invalidation follows consistent patterns
- Query keys are structured as arrays: `['resource', params/id]`
- Hooks are organized by resource type for better maintainability

---

**Last Updated:** January 2025  
**Version:** 1.0.0

