# DynamoDB Integration

The API now uses DynamoDB for data persistence instead of in-memory storage.

## Architecture

### DynamoModel Base Class

The `DynamoModel` abstract class (`src/data/DynamoModel.ts`) provides:

- **CRUD Operations**: Create, Read, Update, Delete
- **Batch Operations**: Batch delete for multiple items
- **GSI Support**: Global Secondary Index queries
- **Logging**: AWS Lambda Powertools integration
- **ID Management**: Automatic prefix handling
- **Type Safety**: Full TypeScript support

### User Model

The `UserModel` (`src/models/UserModel.ts`) extends `DynamoModel` and provides:

- User-specific CRUD operations
- Email-based lookups via GSI1
- Time-based queries via GSI2
- Type conversion to API types

### User Service

The `UserService` (`src/services/user-service.ts`) provides:

- Business logic layer
- Validation and error handling
- Service methods for handlers

## GSI (Global Secondary Index) Design

### GSI1 - Email Lookup
- **PK**: `USER`
- **SK**: `EMAIL#{email}`
- **Use Case**: Find user by email address

### GSI2 - Time-based Queries
- **PK**: `USER`
- **SK**: `CREATED#{timestamp}`
- **Use Case**: Query users by creation date

## Environment Variables

Required environment variables:

```bash
# DynamoDB Table Name
DYNAMODB_TABLE=aws-starter-kit-table

# AWS Region
AWS_REGION=us-east-1

# Service Name for Logging
SERVICE_NAME=aws-starter-kit-api

# Log Level (DEBUG, INFO, WARN, ERROR)
LOG_LEVEL=INFO

# Node Environment
NODE_ENV=development
```

## Table Schema

### Primary Key
- **Partition Key**: `id` (String) - With `USER#` prefix

### Attributes
- `id`: User ID with prefix (e.g., `USER#uuid`)
- `email`: User email address
- `name`: User name
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp (optional)
- `pk1`, `sk1`: GSI1 keys (email lookup)
- `pk2`, `sk2`: GSI2 keys (time-based queries)

### Global Secondary Indexes

**GSI1**: Email Lookup
- Partition Key: `pk1`
- Sort Key: `sk1`

**GSI2**: Time-based Queries
- Partition Key: `pk2`
- Sort Key: `sk2`

## Usage Examples

### Get All Users

```typescript
const users = await userService.getAllUsers();
```

### Get User by ID

```typescript
const user = await userService.getUserById('user-id');
```

### Get User by Email

```typescript
const user = await userService.getUserByEmail('user@example.com');
```

### Create User

```typescript
const user = await userService.createUser({
  email: 'new@example.com',
  name: 'New User',
});
```

### Update User

```typescript
const updated = await userService.updateUser('user-id', {
  name: 'Updated Name',
});
```

### Delete User

```typescript
const success = await userService.deleteUser('user-id');
```

### Batch Delete Users

```typescript
const result = await userService.batchDeleteUsers(['id1', 'id2', 'id3']);
console.log(`Success: ${result.success.length}, Failed: ${result.failed.length}`);
```

### Get Users Created After Date

```typescript
const users = await userService.getUsersCreatedAfter('2024-01-01T00:00:00Z');
```

## ID Prefix Management

The DynamoModel automatically manages ID prefixes:

- **Storage**: IDs stored with prefix (e.g., `USER#abc-123`)
- **API Responses**: IDs returned without prefix (e.g., `abc-123`)
- **Lookups**: Accepts IDs with or without prefix

This allows:
- Single-table design with multiple entity types
- Efficient filtering in scans
- Cleaner API responses

## Error Handling

All operations include error handling:

```typescript
try {
  const user = await userService.createUser({
    email: 'duplicate@example.com',
    name: 'Test',
  });
} catch (error) {
  // Error: User with email duplicate@example.com already exists
  console.error(error.message);
}
```

## Logging

AWS Lambda Powertools logger is integrated:

```typescript
this.logger.info('Creating user', { user });
this.logger.error('Error creating user', { error });
this.logger.warn('User not found', { id });
```

## Performance Considerations

### Scans vs Queries

- **Scan** (`getAllUsers`): Scans entire table, use sparingly
- **Query** (`getByEmail`, `getByCreatedAfter`): Uses GSI, much faster

### Batch Operations

- Use `batchDeleteUsers` for deleting multiple users
- Automatically handles DynamoDB's 25-item limit
- Returns detailed success/failure results

### Caching

Consider adding caching layer for:
- Frequently accessed users
- User email lookups
- User count calculations

## Testing

### Local DynamoDB

Use DynamoDB Local for development:

```bash
docker run -p 8000:8000 amazon/dynamodb-local
```

Set environment variable:
```bash
AWS_ENDPOINT_URL=http://localhost:8000
```

### Mock Testing

The service can be mocked for unit tests:

```typescript
jest.mock('../services/user-service', () => ({
  userService: {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    // ... other methods
  },
}));
```

## Migration from In-Memory Storage

The API has been migrated from in-memory storage to DynamoDB:

**Before:**
```typescript
private users: Map<string, User>;
```

**After:**
```typescript
private userModel: UserDynamoModel;
```

All public methods maintain the same interface, ensuring backward compatibility with existing handlers.

## Adding New Models

To create a new model:

1. **Define the model interface**:
```typescript
export interface ProductModel extends BaseModel {
  name: string;
  price: number;
}
```

2. **Create the model class**:
```typescript
export class ProductDynamoModel extends DynamoModel<ProductModel> {
  protected getEntityName(): string {
    return 'Product';
  }

  protected async generateId(data: ProductModel): Promise<string> {
    return generateUUID();
  }

  protected setGSIKeys(entity: ProductModel, now: string): void {
    entity.pk1 = 'PRODUCT';
    entity.sk1 = `NAME#${entity.name}`;
  }
}
```

3. **Create the service**:
```typescript
export class ProductService {
  private productModel: ProductDynamoModel;

  constructor() {
    this.productModel = new ProductDynamoModel();
  }
  // ... service methods
}
```

## Best Practices

1. **Use GSIs for queries** - Avoid scans when possible
2. **Validate input** - Check for duplicates and constraints
3. **Handle errors** - Provide meaningful error messages
4. **Log operations** - Use structured logging
5. **Clean responses** - Remove GSI fields from API responses
6. **Batch operations** - Use batch operations for multiple items
7. **Single table design** - Use ID prefixes for multiple entity types

## Resources

- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Single Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/)
- [AWS Lambda Powertools](https://docs.powertools.aws.dev/lambda/typescript/latest/)

