import type { ApiGatewayProxyResult, QBTokens } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksOAuthService } from '../../services/quickbooks-oauth.service';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';

interface ConnectionStatusBody {
  tokens: QBTokens;
}

/**
 * POST /api/quickbooks/connection/status - Check connection status
 *
 * Checks the current QuickBooks connection status and token validity.
 * Also fetches company info if connected.
 */
async function connectionStatusHandler(
  request: ParsedRequest<ConnectionStatusBody>
): Promise<ApiGatewayProxyResult> {
  const { body } = request;

  if (!body?.tokens) {
    return successResponse(
      {
        connected: false,
        message: 'No tokens provided',
      },
      HTTP_STATUS.OK
    );
  }

  const status = quickBooksOAuthService.getConnectionStatus(body.tokens);

  if (!status.connected) {
    return successResponse(
      {
        connected: false,
        message: 'QuickBooks connection has expired. Please reconnect.',
      },
      HTTP_STATUS.OK
    );
  }

  // Check if access token needs refresh
  let tokens = body.tokens;
  if (quickBooksOAuthService.isTokenExpired(tokens)) {
    try {
      tokens = await quickBooksOAuthService.refreshTokens(
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

  // Fetch company info
  try {
    const companyInfo = await quickBooksApiService.getCompanyInfo(tokens);

    return successResponse(
      {
        connected: true,
        companyName: companyInfo.companyName,
        realmId: tokens.realmId,
        expiresAt: status.expiresAt,
        refreshTokenExpiresAt: status.refreshTokenExpiresAt,
        // Return refreshed tokens if they were updated
        ...(tokens !== body.tokens && { newTokens: tokens }),
      },
      HTTP_STATUS.OK
    );
  } catch (err) {
    console.error('Company info fetch error:', err);
    return successResponse(
      {
        connected: true,
        realmId: tokens.realmId,
        expiresAt: status.expiresAt,
        refreshTokenExpiresAt: status.refreshTokenExpiresAt,
        warning: 'Could not fetch company info',
      },
      HTTP_STATUS.OK
    );
  }
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(connectionStatusHandler, 'QBConnectionStatus');

