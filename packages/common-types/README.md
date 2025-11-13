# @aws-starter-kit/common-types

Shared TypeScript types and interfaces for the AWS Starter Kit monorepo.

## Structure

The package is organized into focused, modular type files:

```
packages/common-types/src/
├── index.ts           # Main entry point (re-exports all types)
├── user.types.ts      # User domain types
├── api.types.ts       # API response structures
├── lambda.types.ts    # AWS Lambda types
└── common.types.ts    # Utility types and constants
```

## Usage

### Import from Main Entry Point

The recommended approach is to import from the package root:

```typescript
import { User, ApiResponse, HTTP_STATUS } from '@aws-starter-kit/common-types';

const user: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date().toISOString()
};

const response: ApiResponse<User> = {
  success: true,
  data: user
};
```

### Import from Specific Files

For better tree-shaking or explicit imports, you can import from specific type files:

```typescript
import { User, CreateUserRequest } from '@aws-starter-kit/common-types/src/user.types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types/src/common.types';
```

## Available Types

### User Types (`user.types.ts`)
- `User` - User entity with id, email, name, and timestamps
- `CreateUserRequest` - Request body for creating a user
- `UpdateUserRequest` - Request body for updating a user

### API Response Types (`api.types.ts`)
- `ApiResponse<T>` - Standard API response wrapper with success, data, error, and message fields
- `ApiError` - Error details structure with code, message, and optional details

### Lambda Types (`lambda.types.ts`)
- `LambdaContext` - AWS Lambda execution context
- `ApiGatewayProxyEvent` - API Gateway event structure
- `ApiGatewayProxyResult` - API Gateway response structure

### Common Types & Constants (`common.types.ts`)

**Utility Types:**
- `Nullable<T>` - Makes a type nullable (T | null)
- `Optional<T>` - Makes a type optional (T | undefined)

**Constants:**
- `HTTP_STATUS` - HTTP status codes (OK, CREATED, BAD_REQUEST, etc.)
- `ERROR_CODES` - Application error codes (VALIDATION_ERROR, NOT_FOUND, etc.)

## Examples

### Working with User Types

```typescript
import { User, CreateUserRequest, UpdateUserRequest } from '@aws-starter-kit/common-types';

// Create user
const createRequest: CreateUserRequest = {
  email: 'john@example.com',
  name: 'John Doe'
};

// Update user
const updateRequest: UpdateUserRequest = {
  name: 'John Smith'
};

// User entity
const user: User = {
  id: '123',
  email: 'john@example.com',
  name: 'John Smith',
  createdAt: '2025-11-13T00:00:00Z',
  updatedAt: '2025-11-13T12:00:00Z'
};
```

### Working with API Responses

```typescript
import { ApiResponse, ApiError, HTTP_STATUS, ERROR_CODES } from '@aws-starter-kit/common-types';

// Success response
const successResponse: ApiResponse<User> = {
  success: true,
  data: user,
  message: 'User retrieved successfully'
};

// Error response
const errorResponse: ApiResponse = {
  success: false,
  error: {
    code: ERROR_CODES.NOT_FOUND,
    message: 'User not found',
    details: { userId: '123' }
  }
};
```

### Working with Lambda Types

```typescript
import { 
  ApiGatewayProxyEvent, 
  ApiGatewayProxyResult 
} from '@aws-starter-kit/common-types';

async function handler(event: ApiGatewayProxyEvent): Promise<ApiGatewayProxyResult> {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello World' })
  };
}
```

## Adding New Types

When adding new types to this package:

1. **Create a new file** for related types (e.g., `product.types.ts` for product-related types)
2. **Export types** from the new file
3. **Re-export** from `index.ts` to maintain backward compatibility

Example:

```typescript
// src/product.types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}

// src/index.ts
export * from './user.types';
export * from './api.types';
export * from './lambda.types';
export * from './common.types';
export * from './product.types'; // Add new export
```

