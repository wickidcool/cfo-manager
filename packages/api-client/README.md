# @aws-starter-kit/api-client

Type-safe API client for the AWS Starter Kit. Provides a consistent interface for making API requests across web and mobile applications.

## Features

- **Type-Safe**: Full TypeScript support with type inference
- **Environment-Aware**: Automatic configuration from environment variables
- **Cross-Platform**: Works in web (Vite), mobile (Expo), and Node.js
- **Error Handling**: Consistent error handling with custom error types
- **Interceptors**: Request/response interceptors for auth and logging
- **Configurable**: Flexible configuration with sensible defaults

## Installation

This package is part of the monorepo and doesn't need separate installation.

## Usage

### Web App (Vite)

```typescript
// apps/web/src/config/api.ts
import { createApiClient, createConfig } from '@aws-starter-kit/api-client';

export const apiClient = createApiClient(createConfig());
```

### Mobile App (Expo)

```typescript
// apps/mobile/src/config/api.ts
import { createApiClient, createConfigFromEnv } from '@aws-starter-kit/api-client';

export const apiClient = createApiClient(createConfigFromEnv());
```

### Custom Configuration

```typescript
import { createApiClient } from '@aws-starter-kit/api-client';

const apiClient = createApiClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  headers: {
    'X-Custom-Header': 'value',
  },
  withCredentials: true,
});
```

## Environment Variables

The API client supports environment-based configuration. Variable names depend on your environment:

### Vite (Web App)

Create `apps/web/.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
VITE_API_KEY=your-api-key-here
VITE_API_WITH_CREDENTIALS=false
VITE_API_DEBUG=true
```

### Expo (Mobile App)

Create `apps/mobile/.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_API_KEY=your-api-key-here
EXPO_PUBLIC_API_WITH_CREDENTIALS=false
EXPO_PUBLIC_API_DEBUG=true
```

### Node.js

```bash
API_BASE_URL=http://localhost:3000
API_TIMEOUT=30000
API_KEY=your-api-key-here
API_WITH_CREDENTIALS=false
API_DEBUG=true
```

See `ENV_EXAMPLE.md` for detailed examples.

## API Methods

### User Management

```typescript
// Get all users
const users = await apiClient.getUsers();

// Get user by ID
const user = await apiClient.getUser('user-id');

// Create user
const newUser = await apiClient.createUser({
  email: 'user@example.com',
  name: 'John Doe',
});

// Update user
const updatedUser = await apiClient.updateUser('user-id', {
  name: 'Jane Doe',
});

// Delete user
await apiClient.deleteUser('user-id');
```

### Authentication

```typescript
// Set authentication token
apiClient.setAuthToken('your-jwt-token');

// Clear authentication token
apiClient.clearAuthToken();

// Update base URL
apiClient.setBaseURL('https://new-api-url.com');
```

## Configuration Utilities

### `createConfig(overrides?)`

Creates configuration with smart defaults. Auto-detects API URL in browser environments.

```typescript
import { createConfig } from '@aws-starter-kit/api-client';

const config = createConfig();
// Uses window.location.origin in production
// Uses localhost:3000 in development
```

### `createConfigFromEnv(overrides?)`

Creates configuration from environment variables with optional overrides.

```typescript
import { createConfigFromEnv } from '@aws-starter-kit/api-client';

const config = createConfigFromEnv({
  timeout: 60000, // Override timeout
});
```

### `getDefaultBaseURL()`

Gets the default base URL for the current environment.

```typescript
import { getDefaultBaseURL } from '@aws-starter-kit/api-client';

const baseURL = getDefaultBaseURL();
console.log(baseURL); // http://localhost:3000 or current origin
```

## Error Handling

The API client throws `ApiError` instances with detailed error information:

```typescript
import { ApiError } from '@aws-starter-kit/api-client';

try {
  const user = await apiClient.getUser('invalid-id');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
  }
}
```

Error codes:
- `API_ERROR` - Server returned error response
- `NETWORK_ERROR` - No response received from server
- `REQUEST_ERROR` - Error setting up request
- `VALIDATION_ERROR` - Response validation failed

## Advanced Usage

### Custom Axios Instance

```typescript
const instance = apiClient.getAxiosInstance();

// Add custom interceptors
instance.interceptors.request.use((config) => {
  // Modify request config
  return config;
});
```

### Request-Level Configuration

```typescript
// Pass config to individual requests
const users = await apiClient.getUsers({
  timeout: 5000,
  headers: {
    'X-Request-ID': 'unique-id',
  },
});
```

## TypeScript

All types are exported for use in your application:

```typescript
import type {
  ApiClientConfig,
  EnvironmentConfig,
} from '@aws-starter-kit/api-client';
```

## Development

### Building

```bash
nx build api-client
```

### Testing

```bash
nx test api-client
```

### Linting

```bash
nx lint api-client
```

## License

ISC
