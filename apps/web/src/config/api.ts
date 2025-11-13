import { createApiClient } from '@aws-starter-kit/api-client';

/**
 * Get API base URL from environment or use default
 */
function getApiBaseUrl(): string {
  // Check if running in test environment
  if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'test') {
    return 'http://localhost:3000';
  }
  
  // Use Vite environment variable in browser
  return (import.meta.env?.['VITE_API_URL'] as string) || 'http://localhost:3000';
}

/**
 * API Client instance for the web application
 * 
 * Configure the base URL via environment variable or use default
 */
export const apiClient = createApiClient({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

/**
 * Set authentication token (call this after user login)
 */
export function setAuthToken(token: string): void {
  apiClient.setAuthToken(token);
}

/**
 * Clear authentication token (call this on logout)
 */
export function clearAuthToken(): void {
  apiClient.clearAuthToken();
}

