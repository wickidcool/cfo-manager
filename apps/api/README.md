# API - AWS Lambda Handlers

This directory contains AWS Lambda functions for the API backend.

## Structure

```
apps/api/
├── src/
│   ├── handlers/
│   │   └── users/           # User operation handlers
│   │       ├── get-users.ts # GET /users - Get all users
│   │       ├── get-user.ts  # GET /users/{id} - Get user by ID
│   │       ├── create-user.ts # POST /users - Create user
│   │       ├── update-user.ts # PUT /users/{id} - Update user
│   │       ├── delete-user.ts # DELETE /users/{id} - Delete user
│   │       └── index.ts     # Handler exports
│   ├── services/
│   │   └── user-service.ts # Business logic layer
│   ├── schemas/
│   │   └── user.schema.ts  # JSON Schema definitions (AJV)
│   └── utils/
│       ├── response.ts     # Response helpers
│       └── validator.ts    # AJV-based validation
├── project.json            # Nx project configuration
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## Architecture

The API follows a layered architecture:

### 1. **Handlers Layer** (`handlers/`)
- Lambda handler functions organized by resource (e.g., `users/`)
- Each operation has its own dedicated handler file
- Responsible for HTTP request/response handling
- Extracts parameters from API Gateway events
- Validates input using AJV validators
- Calls service layer for business logic
- Formats responses using response utilities
- Each handler is deployed as a separate Lambda function for:
  - Better isolation and debugging
  - Independent scaling per operation
  - Granular permissions and monitoring
  - Smaller deployment packages

### 2. **Services Layer** (`services/`)
- Contains business logic and data operations
- Returns domain objects (e.g., User, null, boolean)
- Independent of HTTP concerns
- Can be easily tested in isolation
- Easy to swap data sources (e.g., from in-memory to DynamoDB)

### 3. **Schemas Layer** (`schemas/`)
- JSON Schema definitions for request/response validation
- Uses AJV (Another JSON Validator) for robust validation
- Type-safe schema definitions with JSONSchemaType
- Supports complex validation rules (email format, patterns, length limits)

### 4. **Utils Layer** (`utils/`)
- Shared utility functions
- **Lambda Handler Wrapper** (`lambda-handler.ts`):
  - Parses API Gateway events into convenient format
  - Extracts path parameters, query parameters, headers, and body
  - Handles errors consistently across all handlers
  - Provides validation helpers for common cases
  - Logs requests and errors with handler names
- **AJV Validation** (`validator.ts`):
  - Schema-based validation with detailed error messages
- **Response Formatting** (`response.ts`):
  - Consistent API response structure
  - CORS headers management

## API Endpoints

### Users API

The users API provides CRUD operations for user management:

- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create a new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

## Services

### UserService

The `UserService` class handles all business logic for user management:

**Methods:**
- `getAllUsers()` - Retrieve all users
- `getUserById(id)` - Find a user by ID
- `createUser(request)` - Create a new user
- `updateUser(id, request)` - Update an existing user
- `deleteUser(id)` - Delete a user
- `userExists(id)` - Check if a user exists
- `getUserCount()` - Get total user count

The service is exported as a singleton instance: `userService`

## Building

```bash
npm run build:api
```

This will bundle the Lambda functions using esbuild and output them to `dist/apps/api`.

## Testing

The API includes comprehensive Jest tests for all services, handlers, and utilities.

### Run Tests

```bash
# Run all API tests
npm run test:api

# Run tests in watch mode
nx test api --watch

# Run tests with coverage
nx test api --coverage
```

### Test Structure

```
apps/api/src/__tests__/
├── handlers/
│   └── users/
│       ├── get-users.spec.ts     # Get Users handler tests (3 tests)
│       ├── get-user.spec.ts      # Get User handler tests (4 tests)
│       └── create-user.spec.ts   # Create User handler tests (5 tests)
├── schemas/
│   └── user.schema.spec.ts      # JSON Schema validation tests (16 tests)
├── services/
│   └── user-service.spec.ts    # UserService unit tests (15 tests)
└── utils/
    ├── lambda-handler.spec.ts   # Lambda handler wrapper tests (15 tests)
    ├── response.spec.ts         # Response helper tests (17 tests)
    └── validator.spec.ts        # AJV validator tests (25 tests)
```

### Test Coverage

- **Handlers**: Integration tests for each Lambda handler function
- **Schemas**: JSON Schema validation for create/update requests with AJV
- **UserService**: Tests for all CRUD operations, edge cases, and error handling
- **Lambda Handler**: Tests for request parsing, validation helpers, and error handling
- **Validators**: AJV-based validation with detailed error reporting
- **Response Helpers**: Tests for success/error response formatting and CORS headers

All 100 tests passing ✓

## Deployment

### Using AWS SAM

The API is configured for deployment using AWS SAM (Serverless Application Model).

1. **Build the application:**
```bash
npm run build:api
```

2. **Deploy with SAM:**
```bash
sam deploy --guided
```

The SAM template (`template.yaml`) defines five separate Lambda functions:
- `GetUsersFunction` - GET /users
- `GetUserFunction` - GET /users/{id}
- `CreateUserFunction` - POST /users
- `UpdateUserFunction` - PUT /users/{id}
- `DeleteUserFunction` - DELETE /users/{id}

Each function is independently deployable and scalable, with dedicated handler files for better isolation and monitoring.

Example from `template.yaml`:

```yaml
  GetUsersFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: dist/apps/api/
      Handler: get-users.handler
      Description: Get all users
      Architectures:
        - x86_64
      Events:
        GetUsers:
          Type: Api
          Properties:
            Path: /users
            Method: get
        CreateUser:
          Type: Api
          Properties:
            Path: /users
            Method: post
        GetUser:
          Type: Api
          Properties:
            Path: /users/{id}
            Method: get
        UpdateUser:
          Type: Api
          Properties:
            Path: /users/{id}
            Method: put
        DeleteUser:
          Type: Api
          Properties:
            Path: /users/{id}
            Method: delete
```

Deploy with:

```bash
sam build
sam deploy --guided
```

### Using AWS CDK

Install AWS CDK:

```bash
npm install --save-dev aws-cdk-lib constructs
```

Create a CDK stack to deploy the Lambda functions.

## Local Testing

Use AWS SAM CLI for local testing:

```bash
sam local start-api
```

Or use the AWS Lambda Test Toolkit.

## Environment Variables

Add any required environment variables to your deployment configuration:

- `DYNAMODB_TABLE_NAME` - DynamoDB table for user data (if using DynamoDB)
- `AWS_REGION` - AWS region

## Lambda Handler Pattern

All handlers use a common pattern that reduces boilerplate and provides consistent error handling:

### Handler Structure

```typescript
import type { ApiGatewayProxyResult } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse } from '../../utils/response';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';

/**
 * Your handler function - receives parsed request data
 */
async function myHandlerFunction(
  request: ParsedRequest
): Promise<ApiGatewayProxyResult> {
  // Access parsed data directly
  const userId = request.pathParameters['id'];
  const { name } = request.body;
  const page = request.queryParameters['page'];
  
  // Your business logic here
  
  return successResponse(data, HTTP_STATUS.OK);
}

/**
 * Export the wrapped handler
 */
export const handler = createLambdaHandler(myHandlerFunction, 'MyHandlerName');
```

### Benefits of This Pattern

1. **Automatic Request Parsing**: Path parameters, query parameters, headers, and body are automatically extracted
2. **Consistent Error Handling**: All errors are caught and formatted consistently
3. **Better Logging**: Handler name is included in all logs for easier debugging
4. **Type Safety**: Typed request parameters and response
5. **Cleaner Code**: Focus on business logic, not boilerplate

### Validation Helpers

The lambda-handler utility provides common validation functions:

```typescript
import {
  validatePathParameters,
  validateBodyPresent,
  createErrorResult,
} from '../../utils/lambda-handler';

// Validate required path parameters
const validation = validatePathParameters(request.pathParameters, ['id', 'type']);
if (!validation.valid) {
  throw createErrorResult(
    ERROR_CODES.VALIDATION_ERROR,
    `Missing parameters: ${validation.missing?.join(', ')}`,
    HTTP_STATUS.BAD_REQUEST
  );
}

// Validate body is present
const bodyValidation = validateBodyPresent(request.body, request.rawBody);
if (!bodyValidation.valid) {
  throw createErrorResult(
    ERROR_CODES.VALIDATION_ERROR,
    bodyValidation.error,
    HTTP_STATUS.BAD_REQUEST
  );
}
```

### Error Handling

Throw `ApiGatewayProxyResult` errors that will be automatically caught:

```typescript
// This error will be caught and returned to the client
throw createErrorResult(
  ERROR_CODES.NOT_FOUND,
  'User not found',
  HTTP_STATUS.NOT_FOUND
);
```

## Adding New Features

### Adding a New Service

1. Create a new service file in `src/services/`:

```typescript
// src/services/my-service.ts
export class MyService {
  async myMethod() {
    // Business logic here
  }
}

export const myService = new MyService();
```

2. Use the service in your handler:

```typescript
// src/handlers/my-handler.ts
import { myService } from '../services/my-service';

export async function handler(event) {
  const result = await myService.myMethod();
  return successResponse(result);
}
```

### Replacing the In-Memory Store

To integrate with DynamoDB or another database:

1. Update the service layer in `src/services/user-service.ts`
2. Replace the `Map` with DynamoDB calls
3. Handlers remain unchanged (separation of concerns)

Example with DynamoDB:

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class UserService {
  private tableName = process.env.DYNAMODB_TABLE_NAME || 'Users';

  async getUserById(id: string): Promise<User | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );
    return result.Item as User || null;
  }
  
  // ... other methods
}
```

## Validation

The API uses **AJV (Another JSON Validator)** for robust request validation with JSON Schema.

### Benefits of AJV

- **Industry Standard**: JSON Schema is a widely-adopted standard
- **Comprehensive**: Supports complex validation rules (formats, patterns, ranges)
- **Detailed Errors**: Returns specific error messages for each validation failure
- **Type Safe**: JSONSchemaType ensures schemas match TypeScript types
- **Performance**: Compiled validators are extremely fast
- **Maintainable**: Declarative schema definitions are easier to understand than imperative code

### Example Schema

```typescript
export const createUserSchema: JSONSchemaType<CreateUserRequest> = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      minLength: 3,
      maxLength: 255,
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: '^(?!\\s*$)(?!.*\\s$)(?!^\\s).*$',
    },
  },
  required: ['email', 'name'],
  additionalProperties: false,
};
```

### Validation Features

- Email format validation
- String length limits (1-255 characters)
- Pattern matching (no leading/trailing whitespace)
- Required field checking
- Additional properties rejection
- Detailed error messages with field names

## Notes

- The current implementation uses an in-memory store for demo purposes
- Service layer makes it easy to swap data sources without changing handlers
- AJV validation provides robust, standards-based request validation
- Validation errors include detailed messages for better API debugging
- Add authentication/authorization middleware as needed
- Consider adding rate limiting and request throttling
- Add comprehensive error handling and logging
- Services can be easily unit tested independently

