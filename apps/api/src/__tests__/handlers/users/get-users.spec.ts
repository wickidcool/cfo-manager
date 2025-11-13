import { handler } from '../../../handlers/users/get-users';
import { userService } from '../../../services/user-service';
import type { ApiGatewayProxyEvent } from '@aws-starter-kit/common-types';
import { HTTP_STATUS, ERROR_CODES } from '@aws-starter-kit/common-types';

// Mock the userService
jest.mock('../../../services/user-service');

describe('Get Users Handler', () => {
  const mockEvent = {} as ApiGatewayProxyEvent;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all users successfully', async () => {
    const mockUsers = [
      { id: '1', email: 'user1@example.com', name: 'User 1', createdAt: '2024-01-01' },
      { id: '2', email: 'user2@example.com', name: 'User 2', createdAt: '2024-01-02' },
    ];

    jest.spyOn(userService, 'getAllUsers').mockResolvedValue(mockUsers);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.OK);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: mockUsers,
    });
    expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no users exist', async () => {
    jest.spyOn(userService, 'getAllUsers').mockResolvedValue([]);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.OK);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: [],
    });
  });

  it('should handle service errors', async () => {
    jest.spyOn(userService, 'getAllUsers').mockRejectedValue(new Error('Database error'));

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });
});

