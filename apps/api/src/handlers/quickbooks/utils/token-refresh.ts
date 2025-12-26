import type { ApiGatewayProxyResult, QBTokens } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { errorResponse } from '../../../utils/response';
import { quickBooksOAuthService } from '../../../services/quickbooks-oauth.service';

/**
 * Wrapper that handles token refresh before making API calls
 *
 * If the access token is expired, it will automatically refresh it
 * before executing the API call.
 */
export async function withTokenRefresh(
  tokens: QBTokens,
  apiCall: (refreshedTokens: QBTokens) => Promise<ApiGatewayProxyResult>
): Promise<ApiGatewayProxyResult> {
  let currentTokens = tokens;

  // Check if access token needs refresh
  if (quickBooksOAuthService.isTokenExpired(tokens)) {
    // Check if refresh token is also expired
    if (quickBooksOAuthService.isRefreshTokenExpired(tokens)) {
      return errorResponse(
        'TOKEN_EXPIRED',
        'QuickBooks session has expired. Please reconnect.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    try {
      currentTokens = await quickBooksOAuthService.refreshTokens(
        tokens.refreshToken,
        tokens.realmId
      );
    } catch (err) {
      console.error('Token refresh error:', err);
      return errorResponse(
        'TOKEN_REFRESH_ERROR',
        'Failed to refresh access token. Please reconnect.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }
  }

  try {
    const result = await apiCall(currentTokens);

    // If tokens were refreshed, include them in the response
    if (currentTokens !== tokens) {
      const body = JSON.parse(result.body);
      body.newTokens = currentTokens;
      result.body = JSON.stringify(body);
    }

    return result;
  } catch (err) {
    console.error('QuickBooks API error:', err);
    return errorResponse(
      'QB_API_ERROR',
      'Failed to fetch data from QuickBooks',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { error: String(err) }
    );
  }
}

