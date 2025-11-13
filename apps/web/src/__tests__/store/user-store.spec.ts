import { useUserStore } from '../../store/user-store';
import type { User } from '@aws-starter-kit/common-types';

describe('UserStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.setState({
      user: null,
      users: [],
      isLoading: false,
      error: null,
    });
  });

  it('should initialize with empty state', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.users).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set user', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
    };

    useUserStore.getState().setUser(user);
    expect(useUserStore.getState().user).toEqual(user);
  });

  it('should add user to users array', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
    };

    useUserStore.getState().addUser(user);
    expect(useUserStore.getState().users).toHaveLength(1);
    expect(useUserStore.getState().users[0]).toEqual(user);
  });

  it('should update user in users array', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
    };

    useUserStore.getState().addUser(user);
    useUserStore.getState().updateUser('1', { name: 'Updated User' });

    const updatedUser = useUserStore.getState().users[0];
    expect(updatedUser.name).toBe('Updated User');
  });

  it('should remove user from users array', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
    };

    useUserStore.getState().addUser(user);
    expect(useUserStore.getState().users).toHaveLength(1);

    useUserStore.getState().removeUser('1');
    expect(useUserStore.getState().users).toHaveLength(0);
  });

  it('should set loading state', () => {
    useUserStore.getState().setLoading(true);
    expect(useUserStore.getState().isLoading).toBe(true);

    useUserStore.getState().setLoading(false);
    expect(useUserStore.getState().isLoading).toBe(false);
  });

  it('should set and clear error', () => {
    useUserStore.getState().setError('Test error');
    expect(useUserStore.getState().error).toBe('Test error');

    useUserStore.getState().clearError();
    expect(useUserStore.getState().error).toBeNull();
  });

  it('should update current user when updating by id', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
    };

    useUserStore.getState().setUser(user);
    useUserStore.getState().addUser(user);
    useUserStore.getState().updateUser('1', { name: 'Updated User' });

    expect(useUserStore.getState().user?.name).toBe('Updated User');
  });
});

