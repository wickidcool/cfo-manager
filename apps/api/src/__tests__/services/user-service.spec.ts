import { UserService } from '../../services/user-service';
import type { User, CreateUserRequest, UpdateUserRequest } from '@aws-starter-kit/common-types';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe('getAllUsers', () => {
    it('should return empty array initially', async () => {
      const users = await service.getAllUsers();
      expect(users).toEqual([]);
    });

    it('should return all created users', async () => {
      const request1: CreateUserRequest = {
        email: 'user1@example.com',
        name: 'User One',
      };
      const request2: CreateUserRequest = {
        email: 'user2@example.com',
        name: 'User Two',
      };

      await service.createUser(request1);
      await service.createUser(request2);

      const users = await service.getAllUsers();
      expect(users).toHaveLength(2);
      expect(users[0].email).toBe('user1@example.com');
      expect(users[1].email).toBe('user2@example.com');
    });
  });

  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await service.createUser(request);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeUndefined();
    });

    it('should generate unique IDs for each user', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user1 = await service.createUser(request);
      const user2 = await service.createUser(request);

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('getUserById', () => {
    it('should return null for non-existent user', async () => {
      const user = await service.getUserById('non-existent-id');
      expect(user).toBeNull();
    });

    it('should return user by ID', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const createdUser = await service.createUser(request);
      const foundUser = await service.getUserById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe('test@example.com');
    });
  });

  describe('updateUser', () => {
    it('should return null for non-existent user', async () => {
      const update: UpdateUserRequest = { name: 'New Name' };
      const result = await service.updateUser('non-existent-id', update);
      expect(result).toBeNull();
    });

    it('should update user name', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Original Name',
      };

      const createdUser = await service.createUser(request);
      const update: UpdateUserRequest = { name: 'Updated Name' };
      const updatedUser = await service.updateUser(createdUser.id, update);

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.email).toBe('test@example.com');
      expect(updatedUser?.updatedAt).toBeDefined();
    });

    it('should preserve email when updating name', async () => {
      const request: CreateUserRequest = {
        email: 'original@example.com',
        name: 'Original Name',
      };

      const createdUser = await service.createUser(request);
      const update: UpdateUserRequest = { name: 'New Name' };
      const updatedUser = await service.updateUser(createdUser.id, update);

      expect(updatedUser?.email).toBe('original@example.com');
    });
  });

  describe('deleteUser', () => {
    it('should return false for non-existent user', async () => {
      const result = await service.deleteUser('non-existent-id');
      expect(result).toBe(false);
    });

    it('should delete existing user', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const createdUser = await service.createUser(request);
      const result = await service.deleteUser(createdUser.id);

      expect(result).toBe(true);

      // Verify user is deleted
      const foundUser = await service.getUserById(createdUser.id);
      expect(foundUser).toBeNull();
    });
  });

  describe('userExists', () => {
    it('should return false for non-existent user', async () => {
      const exists = await service.userExists('non-existent-id');
      expect(exists).toBe(false);
    });

    it('should return true for existing user', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const createdUser = await service.createUser(request);
      const exists = await service.userExists(createdUser.id);

      expect(exists).toBe(true);
    });
  });

  describe('getUserCount', () => {
    it('should return 0 initially', async () => {
      const count = await service.getUserCount();
      expect(count).toBe(0);
    });

    it('should return correct count after adding users', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await service.createUser(request);
      await service.createUser(request);
      await service.createUser(request);

      const count = await service.getUserCount();
      expect(count).toBe(3);
    });

    it('should update count after deletion', async () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await service.createUser(request);
      await service.createUser(request);

      let count = await service.getUserCount();
      expect(count).toBe(2);

      await service.deleteUser(user.id);

      count = await service.getUserCount();
      expect(count).toBe(1);
    });
  });
});

