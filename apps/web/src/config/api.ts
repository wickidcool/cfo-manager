import { createApiClient } from '@aws-starter-kit/api-client';

/**
 * Get API base URL from current web URL
 */
function getApiBaseUrl(): string {
  // Derive API URL from current web URL
  // In production: https://example.cloudfront.net -> https://example.cloudfront.net
  // In development: http://localhost:5173 -> http://localhost:3000
  // Note: API client methods include /api prefix (e.g., /api/users)
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;

    // For local development (localhost), use port 3000 for API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const apiUrl = `${protocol}//${hostname}:3000`;
      console.log('[API Config] Local development - API URL:', apiUrl);
      return apiUrl;
    }

    // For production/deployed environments, use root URL (API client handles /api prefix)
    const apiUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
    console.log('[API Config] Production - API URL:', apiUrl);
    return apiUrl;
  }

  console.warn('[API Config] Running in SSR/edge case - using fallback URL');
  return 'http://localhost:3000';
}

/**
 * API Client instance for the web application
 *
 * API URL is automatically derived from current web URL:
 * - Local dev (localhost): http://localhost:3000
 * - Production: https://your-domain.com
 *
 * The API client methods include the /api prefix, so:
 * - Calling getUsers() → https://your-domain.com/api/users
 * - CloudFront routes /api/* to API Gateway
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

