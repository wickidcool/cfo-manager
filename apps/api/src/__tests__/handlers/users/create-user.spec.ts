import { handler } from '../../../handlers/users/create-user';
import { userService } from '../../../services/user-service';
import type { ApiGatewayProxyEvent } from '@aws-starter-kit/common-types';
import { HTTP_STATUS, ERROR_CODES } from '@aws-starter-kit/common-types';

// Mock the userService
jest.mock('../../../services/user-service');

describe('Create User Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create user successfully', async () => {
    const requestBody = {
      email: 'newuser@example.com',
      name: 'New User',
    };

    const mockCreatedUser = {
      id: '123',
      ...requestBody,
      createdAt: '2024-01-01',
    };

    const mockEvent = {
      body: JSON.stringify(requestBody),
    } as ApiGatewayProxyEvent;

    jest.spyOn(userService, 'createUser').mockResolvedValue(mockCreatedUser);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.CREATED);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockCreatedUser);
    expect(body.message).toBe('User created successfully');
    expect(userService.createUser).toHaveBeenCalledWith(requestBody);
  });

  it('should return 400 when request body is missing', async () => {
    const mockEvent = {
      body: null,
    } as ApiGatewayProxyEvent;

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('should return 400 when email is invalid', async () => {
    const requestBody = {
      email: 'invalid-email',
      name: 'Test User',
    };

    const mockEvent = {
      body: JSON.stringify(requestBody),
    } as ApiGatewayProxyEvent;

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.error.details?.errors).toBeDefined();
  });

  it('should return 400 when name is missing', async () => {
    const requestBody = {
      email: 'user@example.com',
    };

    const mockEvent = {
      body: JSON.stringify(requestBody),
    } as ApiGatewayProxyEvent;

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('should handle service errors', async () => {
    const requestBody = {
      email: 'user@example.com',
      name: 'Test User',
    };

    const mockEvent = {
      body: JSON.stringify(requestBody),
    } as ApiGatewayProxyEvent;

    jest.spyOn(userService, 'createUser').mockRejectedValue(new Error('Database error'));

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });
});

