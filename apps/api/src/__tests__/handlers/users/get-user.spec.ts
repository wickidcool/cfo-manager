import { handler } from '../../../handlers/users/get-user';
import { userService } from '../../../services/user-service';
import { HTTP_STATUS, ERROR_CODES } from '@aws-starter-kit/common-types';
import type { ApiGatewayProxyEvent } from '@aws-starter-kit/common-types';

// Mock the userService
jest.mock('../../../services/user-service');

describe('Get User Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user by ID successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'user@example.com',
      name: 'Test User',
      createdAt: '2024-01-01',
    };

    const mockEvent = {
      pathParameters: { id: '123' },
    } as unknown as ApiGatewayProxyEvent;

    jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.OK);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: mockUser,
    });
    expect(userService.getUserById).toHaveBeenCalledWith('123');
  });

  it('should return 400 when user ID is missing', async () => {
    const mockEvent = {
      pathParameters: null,
    } as unknown as ApiGatewayProxyEvent;

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('should return 404 when user not found', async () => {
    const mockEvent = {
      pathParameters: { id: '999' },
    } as unknown as ApiGatewayProxyEvent;

    jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it('should handle service errors', async () => {
    const mockEvent = {
      pathParameters: { id: '123' },
    } as unknown as ApiGatewayProxyEvent;

    jest.spyOn(userService, 'getUserById').mockRejectedValue(new Error('Database error'));

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });
});

