# @aws-starter-kit/api-client

Type-safe API client for AWS Starter Kit backend using Axios.

## Features

- 🔒 **Type-Safe**: Full TypeScript support with types from `@aws-starter-kit/common-types`
- 🚀 **Easy to Use**: Simple, intuitive API for all backend operations
- 🛡️ **Error Handling**: Structured error handling with `ApiError` class
- 🔑 **Authentication**: Built-in support for bearer token authentication
- ⚙️ **Configurable**: Flexible configuration options for different environments
- 📦 **Lightweight**: Minimal dependencies, built on Axios

## Installation

The package is part of the monorepo and automatically available via path mapping:

```typescript
import { createApiClient } from '@aws-starter-kit/api-client';
```

## Usage

### Creating a Client Instance

```typescript
import { createApiClient } from '@aws-starter-kit/api-client';

// Create client with base configuration
const apiClient = createApiClient({
  baseURL: 'https://api.example.com',
  timeout: 30000, // Optional: default is 30000 (30 seconds)
  headers: {
    'X-Custom-Header': 'value', // Optional: custom headers
  },
});
```

### Auto-Configuration in Web App

In the web application (`apps/web/src/config/api.ts`), the API URL is automatically determined from the current web URL:

```typescript
// Base URL is automatically set to:
// - Local dev (localhost): http://localhost:3000
// - Production: https://your-domain.com
// 
// API client methods include /api prefix:
// - getUsers() → https://your-domain.com/api/users

export const apiClient = createApiClient({
  baseURL: getApiBaseUrl(), // Automatically derived from current URL
  timeout: 30000,
});
```

**How it works:**
1. For localhost (127.0.0.1), base URL is `http://localhost:3000`, web app uses port 5173
2. For production, base URL is the web app domain (e.g., `https://your-domain.com`)
3. API client methods include `/api` prefix, so `getUsers()` calls `https://your-domain.com/api/users`
4. CloudFront routes `/api/*` requests to API Gateway
5. No environment variables needed - fully automatic

### Configuration Options

```typescript
interface ApiClientConfig {
  baseURL: string;           // Required: API base URL
  timeout?: number;          // Optional: Request timeout (default: 30000ms)
  headers?: Record<string, string>;  // Optional: Custom headers
  withCredentials?: boolean; // Optional: Include credentials (default: false)
}
```

### User Operations

#### Get All Users

```typescript
try {
  const users = await apiClient.getUsers();
  console.log('Users:', users);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.statusCode);
  }
}
```

#### Get User by ID

```typescript
try {
  const user = await apiClient.getUser('user-123');
  console.log('User:', user);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Error:', error.message);
  }
}
```

#### Create User

```typescript
import type { CreateUserRequest } from '@aws-starter-kit/common-types';

const newUser: CreateUserRequest = {
  email: 'user@example.com',
  name: 'John Doe',
};

try {
  const createdUser = await apiClient.createUser(newUser);
  console.log('Created:', createdUser);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Failed to create user:', error.message);
    console.error('Validation errors:', error.details);
  }
}
```

#### Update User

```typescript
import type { UpdateUserRequest } from '@aws-starter-kit/common-types';

const updates: UpdateUserRequest = {
  name: 'Jane Doe',
};

try {
  const updatedUser = await apiClient.updateUser('user-123', updates);
  console.log('Updated:', updatedUser);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Failed to update user:', error.message);
  }
}
```

#### Delete User

```typescript
try {
  await apiClient.deleteUser('user-123');
  console.log('User deleted successfully');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Failed to delete user:', error.message);
  }
}
```

### Authentication

#### Set Authorization Token

```typescript
// Set bearer token for authenticated requests
apiClient.setAuthToken('your-jwt-token-here');

// All subsequent requests will include the token
const users = await apiClient.getUsers();
```

#### Clear Authorization Token

```typescript
// Remove authentication token
apiClient.clearAuthToken();
```

### Environment-Specific Configuration

```typescript
// Development
const devClient = createApiClient({
  baseURL: 'http://localhost:3000',
});

// Production (via CloudFront)
const prodClient = createApiClient({
  baseURL: 'https://d123456.cloudfront.net/api',
});

// Using environment variables
const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});
```

### Error Handling

The client provides a structured `ApiError` class:

```typescript
import { ApiError } from '@aws-starter-kit/api-client';

try {
  await apiClient.createUser(userData);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Status Code:', error.statusCode);    // HTTP status code
    console.error('Error Code:', error.code);           // API error code
    console.error('Message:', error.message);           // Error message
    console.error('Details:', error.details);           // Additional details
  }
}
```

### React Integration

#### Using with useState/useEffect

```typescript
import { useEffect, useState } from 'react';
import { createApiClient } from '@aws-starter-kit/api-client';
import type { User } from '@aws-starter-kit/common-types';

const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL,
});

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiClient.getUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

#### Using with Zustand

```typescript
import { create } from 'zustand';
import { createApiClient, ApiError } from '@aws-starter-kit/api-client';
import type { User } from '@aws-starter-kit/common-types';

const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL,
});

interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await apiClient.getUsers();
      set({ users, loading: false });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch users';
      set({ error: message, loading: false });
    }
  },

  deleteUser: async (id: string) => {
    try {
      await apiClient.deleteUser(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete user';
      set({ error: message });
    }
  },
}));
```

### Advanced Usage

#### Access Underlying Axios Instance

```typescript
// Get axios instance for advanced configuration
const axiosInstance = apiClient.getAxiosInstance();

// Add custom interceptors
axiosInstance.interceptors.request.use((config) => {
  // Add custom request logic
  return config;
});
```

#### Request Configuration

All methods accept optional Axios request config:

```typescript
// With custom headers
const users = await apiClient.getUsers({
  headers: { 'X-Request-ID': '123' },
});

// With timeout override
const user = await apiClient.getUser('user-123', {
  timeout: 5000,
});

// With signal for cancellation
const controller = new AbortController();
const users = await apiClient.getUsers({
  signal: controller.signal,
});

// Cancel request
controller.abort();
```

#### Update Base URL Dynamically

```typescript
// Change API endpoint at runtime
apiClient.setBaseURL('https://staging-api.example.com');
```

## Type Safety

All methods use TypeScript types from `@aws-starter-kit/common-types`:

```typescript
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponse,
} from '@aws-starter-kit/common-types';
```

This ensures type safety across your entire application stack.

## Error Codes

Common error codes returned by the API:

- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error
- `NETWORK_ERROR` - No response from server (client-side)
- `REQUEST_ERROR` - Request setup error (client-side)

## Testing

The package includes Jest tests. Run tests with:

```bash
nx test api-client
```

## License

ISC

