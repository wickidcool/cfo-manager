import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponse,
} from '@aws-starter-kit/common-types';

/**
 * API Client configuration options
 */
export interface ApiClientConfig {
  /**
   * Base URL for the API (e.g., 'https://api.example.com' or 'http://localhost:3000')
   */
  baseURL: string;

  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number;

  /**
   * Additional headers to include in all requests
   */
  headers?: Record<string, string>;

  /**
   * Whether to include credentials in requests (default: false)
   */
  withCredentials?: boolean;
}

/**
 * API Error with structured information
 */
export class ApiError extends Error {
  public readonly statusCode?: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * API Client for AWS Starter Kit
 *
 * Provides type-safe methods for interacting with the backend API.
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials || false,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle axios errors and convert to ApiError
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as ApiResponse;
      return new ApiError(
        data.error?.message || error.message,
        error.response.status,
        data.error?.code,
        data.error?.details
      );
    } else if (error.request) {
      // Request was made but no response received
      return new ApiError(
        'No response from server',
        undefined,
        'NETWORK_ERROR'
      );
    } else {
      // Something else happened
      return new ApiError(error.message, undefined, 'REQUEST_ERROR');
    }
  }

  /**
   * Set authorization token
   */
  public setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  public clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  /**
   * Update base URL
   */
  public setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  /**
   * Get all users
   */
  public async getUsers(config?: AxiosRequestConfig): Promise<User[]> {
    const response = await this.client.get<ApiResponse<User[]>>('/users', config);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new ApiError('Invalid response format');
  }

  /**
   * Get user by ID
   */
  public async getUser(id: string, config?: AxiosRequestConfig): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>(`/users/${id}`, config);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new ApiError('Invalid response format');
  }

  /**
   * Create a new user
   */
  public async createUser(
    data: CreateUserRequest,
    config?: AxiosRequestConfig
  ): Promise<User> {
    const response = await this.client.post<ApiResponse<User>>('/users', data, config);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new ApiError('Invalid response format');
  }

  /**
   * Update an existing user
   */
  public async updateUser(
    id: string,
    data: UpdateUserRequest,
    config?: AxiosRequestConfig
  ): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(`/users/${id}`, data, config);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new ApiError('Invalid response format');
  }

  /**
   * Delete a user
   */
  public async deleteUser(id: string, config?: AxiosRequestConfig): Promise<void> {
    await this.client.delete(`/users/${id}`, config);
  }

  /**
   * Get the underlying axios instance for advanced usage
   */
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

/**
 * Create a new API client instance
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

