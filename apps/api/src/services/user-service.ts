import type { User, CreateUserRequest, UpdateUserRequest } from '@aws-starter-kit/common-types';

/**
 * User Service
 * Handles all business logic for user management
 */
export class UserService {
  // In-memory store for demo purposes
  // In production, use DynamoDB or another database
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user || null;
  }

  /**
   * Create a new user
   */
  async createUser(request: CreateUserRequest): Promise<User> {
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    const user: User = {
      id: userId,
      email: request.email,
      name: request.name,
      createdAt: now,
    };

    this.users.set(userId, user);
    return user;
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, request: UpdateUserRequest): Promise<User | null> {
    const existingUser = this.users.get(id);

    if (!existingUser) {
      return null;
    }

    const updatedUser: User = {
      ...existingUser,
      name: request.name ?? existingUser.name,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id);

    if (!user) {
      return false;
    }

    this.users.delete(id);
    return true;
  }

  /**
   * Check if user exists
   */
  async userExists(id: string): Promise<boolean> {
    return this.users.has(id);
  }

  /**
   * Get user count
   */
  async getUserCount(): Promise<number> {
    return this.users.size;
  }
}

// Export singleton instance
export const userService = new UserService();

