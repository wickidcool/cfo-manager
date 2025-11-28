import { UserService } from '../../services/user-service';
import { UserDynamoModel, UserModel } from '../../models/UserModel';
import type { CreateUserRequest, UpdateUserRequest, User } from '@aws-starter-kit/common-types';

// Mock the UserDynamoModel
jest.mock('../../models/UserModel');

describe('UserService', () => {
  let userService: UserService;
  let mockUserModel: jest.Mocked<UserDynamoModel>;

  // Helper to create a mock user model
  const createMockUserModel = (data: Partial<UserModel>): UserModel => ({
    id: data.id || 'USER#test-id',
    email: data.email || 'test@example.com',
    name: data.name || 'Test User',
    createdAt: data.createdAt || '2024-01-01T00:00:00Z',
    updatedAt: data.updatedAt || undefined,
    pk1: 'USER',
    sk1: `EMAIL#${data.email || 'test@example.com'}`,
    pk2: 'USER',
    sk2: `CREATED#${data.createdAt || '2024-01-01T00:00:00Z'}`,
  });

  // Helper to create expected API response
  const createExpectedUser = (data: Partial<User>): User => ({
    id: data.id || 'test-id',
    email: data.email || 'test@example.com',
    name: data.name || 'Test User',
    createdAt: data.createdAt || '2024-01-01T00:00:00Z',
    updatedAt: data.updatedAt,
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create a new instance for each test
    userService = new UserService();

    // Get the mocked instance - accessing private property for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUserModel = (userService as any).userModel as jest.Mocked<UserDynamoModel>;

    // Setup default toUserType implementation
    mockUserModel.toUserType = jest.fn((userModel: UserModel) => ({
      id: userModel.id.replace('USER#', ''),
      email: userModel.email,
      name: userModel.name,
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt,
    }));
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        createMockUserModel({ id: 'USER#1', email: 'user1@example.com', name: 'User 1' }),
        createMockUserModel({ id: 'USER#2', email: 'user2@example.com', name: 'User 2' }),
      ];

      mockUserModel.scanAll = jest.fn().mockResolvedValue(mockUsers);

      const users = await userService.getAllUsers();

      expect(mockUserModel.scanAll).toHaveBeenCalledTimes(1);
      expect(users).toHaveLength(2);
      expect(users[0]).toEqual(createExpectedUser({ id: '1', email: 'user1@example.com', name: 'User 1' }));
      expect(users[1]).toEqual(createExpectedUser({ id: '2', email: 'user2@example.com', name: 'User 2' }));
    });

    it('should return empty array when no users exist', async () => {
      mockUserModel.scanAll = jest.fn().mockResolvedValue([]);

      const users = await userService.getAllUsers();

      expect(mockUserModel.scanAll).toHaveBeenCalledTimes(1);
      expect(users).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const mockUser = createMockUserModel({ id: 'USER#test-id' });
      mockUserModel.getById = jest.fn().mockResolvedValue(mockUser);

      const user = await userService.getUserById('test-id');

      expect(mockUserModel.getById).toHaveBeenCalledWith('test-id');
      expect(user).toEqual(createExpectedUser({ id: 'test-id' }));
    });

    it('should return null when user not found', async () => {
      mockUserModel.getById = jest.fn().mockResolvedValue(null);

      const user = await userService.getUserById('non-existent-id');

      expect(mockUserModel.getById).toHaveBeenCalledWith('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user when found by email', async () => {
      const mockUser = createMockUserModel({ email: 'test@example.com' });
      mockUserModel.getByEmail = jest.fn().mockResolvedValue(mockUser);

      const user = await userService.getUserByEmail('test@example.com');

      expect(mockUserModel.getByEmail).toHaveBeenCalledWith('test@example.com');
      expect(user).toEqual(createExpectedUser({ email: 'test@example.com' }));
    });

    it('should return null when user not found by email', async () => {
      mockUserModel.getByEmail = jest.fn().mockResolvedValue(null);

      const user = await userService.getUserByEmail('nonexistent@example.com');

      expect(mockUserModel.getByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createRequest: CreateUserRequest = {
        email: 'new@example.com',
        name: 'New User',
      };

      const mockCreatedUser = createMockUserModel({
        id: 'USER#new-id',
        email: 'new@example.com',
        name: 'New User',
      });

      mockUserModel.getByEmail = jest.fn().mockResolvedValue(null);
      mockUserModel.create = jest.fn().mockResolvedValue(mockCreatedUser);

      const user = await userService.createUser(createRequest);

      expect(mockUserModel.getByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: 'New User',
      });
      expect(user).toEqual(createExpectedUser({ id: 'new-id', email: 'new@example.com', name: 'New User' }));
    });

    it('should throw error when email already exists', async () => {
      const createRequest: CreateUserRequest = {
        email: 'existing@example.com',
        name: 'New User',
      };

      const existingUser = createMockUserModel({ email: 'existing@example.com' });
      mockUserModel.getByEmail = jest.fn().mockResolvedValue(existingUser);

      await expect(userService.createUser(createRequest)).rejects.toThrow(
        'User with email existing@example.com already exists'
      );

      expect(mockUserModel.getByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const updateRequest: UpdateUserRequest = {
        name: 'Updated Name',
      };

      const mockUpdatedUser = createMockUserModel({
        id: 'USER#test-id',
        name: 'Updated Name',
        updatedAt: '2024-01-02T00:00:00Z',
      });

      mockUserModel.update = jest.fn().mockResolvedValue(mockUpdatedUser);

      const user = await userService.updateUser('test-id', updateRequest);

      expect(mockUserModel.update).toHaveBeenCalledWith('test-id', { name: 'Updated Name' });
      expect(user).toEqual(
        createExpectedUser({
          id: 'test-id',
          name: 'Updated Name',
          updatedAt: '2024-01-02T00:00:00Z',
        })
      );
    });

    it('should return null when user not found', async () => {
      const updateRequest: UpdateUserRequest = {
        name: 'Updated Name',
      };

      mockUserModel.update = jest.fn().mockResolvedValue(null);

      const user = await userService.updateUser('non-existent-id', updateRequest);

      expect(mockUserModel.update).toHaveBeenCalledWith('non-existent-id', { name: 'Updated Name' });
      expect(user).toBeNull();
    });

    it('should handle empty update request', async () => {
      const updateRequest: UpdateUserRequest = {};

      const mockUser = createMockUserModel({
        id: 'USER#test-id',
        updatedAt: '2024-01-02T00:00:00Z',
      });

      mockUserModel.update = jest.fn().mockResolvedValue(mockUser);

      const user = await userService.updateUser('test-id', updateRequest);

      expect(mockUserModel.update).toHaveBeenCalledWith('test-id', {});
      expect(user).toEqual(createExpectedUser({ id: 'test-id', updatedAt: '2024-01-02T00:00:00Z' }));
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      mockUserModel.delete = jest.fn().mockResolvedValue(true);

      const result = await userService.deleteUser('test-id');

      expect(mockUserModel.delete).toHaveBeenCalledWith('test-id');
      expect(result).toBe(true);
    });

    it('should handle deletion of non-existent user', async () => {
      mockUserModel.delete = jest.fn().mockResolvedValue(false);

      const result = await userService.deleteUser('non-existent-id');

      expect(mockUserModel.delete).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('batchDeleteUsers', () => {
    it('should batch delete multiple users successfully', async () => {
      const ids = ['id1', 'id2', 'id3'];
      const mockResult = {
        success: ['id1', 'id2', 'id3'],
        failed: [],
      };

      mockUserModel.batchDelete = jest.fn().mockResolvedValue(mockResult);

      const result = await userService.batchDeleteUsers(ids);

      expect(mockUserModel.batchDelete).toHaveBeenCalledWith(ids);
      expect(result).toEqual(mockResult);
    });

    it('should handle partial failures in batch delete', async () => {
      const ids = ['id1', 'id2', 'id3'];
      const mockResult = {
        success: ['id1', 'id3'],
        failed: [{ id: 'id2', error: 'Item was not processed' }],
      };

      mockUserModel.batchDelete = jest.fn().mockResolvedValue(mockResult);

      const result = await userService.batchDeleteUsers(ids);

      expect(mockUserModel.batchDelete).toHaveBeenCalledWith(ids);
      expect(result.success).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].id).toBe('id2');
    });

    it('should handle empty array', async () => {
      const mockResult = { success: [], failed: [] };
      mockUserModel.batchDelete = jest.fn().mockResolvedValue(mockResult);

      const result = await userService.batchDeleteUsers([]);

      expect(mockUserModel.batchDelete).toHaveBeenCalledWith([]);
      expect(result).toEqual(mockResult);
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      const mockUser = createMockUserModel({ id: 'USER#test-id' });
      mockUserModel.getById = jest.fn().mockResolvedValue(mockUser);

      const exists = await userService.userExists('test-id');

      expect(mockUserModel.getById).toHaveBeenCalledWith('test-id');
      expect(exists).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      mockUserModel.getById = jest.fn().mockResolvedValue(null);

      const exists = await userService.userExists('non-existent-id');

      expect(mockUserModel.getById).toHaveBeenCalledWith('non-existent-id');
      expect(exists).toBe(false);
    });
  });

  describe('getUserCount', () => {
    it('should return the count of users', async () => {
      const mockUsers = [
        createMockUserModel({ id: 'USER#1' }),
        createMockUserModel({ id: 'USER#2' }),
        createMockUserModel({ id: 'USER#3' }),
      ];

      mockUserModel.scanAll = jest.fn().mockResolvedValue(mockUsers);

      const count = await userService.getUserCount();

      expect(mockUserModel.scanAll).toHaveBeenCalledTimes(1);
      expect(count).toBe(3);
    });

    it('should return 0 when no users exist', async () => {
      mockUserModel.scanAll = jest.fn().mockResolvedValue([]);

      const count = await userService.getUserCount();

      expect(mockUserModel.scanAll).toHaveBeenCalledTimes(1);
      expect(count).toBe(0);
    });
  });

  describe('getUsersCreatedAfter', () => {
    it('should return users created after specified date', async () => {
      const date = '2024-01-01T00:00:00Z';
      const mockUsers = [
        createMockUserModel({ id: 'USER#1', createdAt: '2024-01-02T00:00:00Z' }),
        createMockUserModel({ id: 'USER#2', createdAt: '2024-01-03T00:00:00Z' }),
      ];

      mockUserModel.getByCreatedAfter = jest.fn().mockResolvedValue(mockUsers);

      const users = await userService.getUsersCreatedAfter(date);

      expect(mockUserModel.getByCreatedAfter).toHaveBeenCalledWith(date);
      expect(users).toHaveLength(2);
      expect(users[0].createdAt).toBe('2024-01-02T00:00:00Z');
      expect(users[1].createdAt).toBe('2024-01-03T00:00:00Z');
    });

    it('should return empty array when no users match', async () => {
      const date = '2024-12-31T00:00:00Z';
      mockUserModel.getByCreatedAfter = jest.fn().mockResolvedValue([]);

      const users = await userService.getUsersCreatedAfter(date);

      expect(mockUserModel.getByCreatedAfter).toHaveBeenCalledWith(date);
      expect(users).toEqual([]);
    });
  });
});
