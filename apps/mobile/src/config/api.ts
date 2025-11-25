import { createApiClient } from '@aws-starter-kit/api-client';

// TODO: Update this URL to match your deployed API Gateway endpoint
// For local development, you might use: 'http://localhost:3000'
// For production, use your AWS API Gateway URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-gateway-url.amazonaws.com';

export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

