import type { ApiGatewayProxyResult } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksOAuthService } from '../../services/quickbooks-oauth.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';

/**
 * GET /api/quickbooks/auth/callback - OAuth callback handler
 *
 * Handles the OAuth callback from QuickBooks after user authorization.
 * Exchanges the authorization code for access/refresh tokens.
 */
async function authCallbackHandler(
  request: ParsedRequest
): Promise<ApiGatewayProxyResult> {
  const { queryParameters } = request;

  const code = queryParameters['code'];
  const state = queryParameters['state'];
  const realmId = queryParameters['realmId'];
  const error = queryParameters['error'];

  // Check for OAuth errors
  if (error) {
    const errorDescription = queryParameters['error_description'] || 'Authorization failed';
    return errorResponse(
      'OAUTH_ERROR',
      errorDescription,
      HTTP_STATUS.BAD_REQUEST,
      { error }
    );
  }

  // Validate required parameters
  if (!code || !realmId || !state) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Missing required OAuth parameters (code, realmId, state)',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  try {
    // Extract userId from state
    const [userId] = state.split(':');

    if (!userId) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid state parameter',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Exchange code for tokens
    const tokens = await quickBooksOAuthService.exchangeCodeForTokens(code, realmId);

    // TODO: Store tokens securely (DynamoDB, Secrets Manager, etc.)
    // For now, return them to be stored client-side or in your own storage

    return successResponse(
      {
        userId,
        realmId,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
        },
        message: 'Successfully connected to QuickBooks',
      },
      HTTP_STATUS.OK
    );
  } catch (err) {
    console.error('OAuth callback error:', err);
    return errorResponse(
      'OAUTH_ERROR',
      'Failed to exchange authorization code for tokens',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(authCallbackHandler, 'QBAuthCallback');

