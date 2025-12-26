import type { ApiGatewayProxyResult, QBTokens } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksOAuthService } from '../../services/quickbooks-oauth.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';

interface DisconnectBody {
  tokens: QBTokens;
}

/**
 * POST /api/quickbooks/disconnect - Disconnect from QuickBooks
 *
 * Revokes the OAuth tokens and disconnects from QuickBooks.
 */
async function disconnectHandler(
  request: ParsedRequest<DisconnectBody>
): Promise<ApiGatewayProxyResult> {
  const { body } = request;

  if (!body?.tokens) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Tokens are required to disconnect',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  try {
    await quickBooksOAuthService.revokeTokens(
      body.tokens.accessToken,
      body.tokens.refreshToken
    );

    return successResponse(
      {
        disconnected: true,
        message: 'Successfully disconnected from QuickBooks',
      },
      HTTP_STATUS.OK
    );
  } catch (err) {
    console.error('Disconnect error:', err);
    // Even if revoke fails, consider it disconnected from our side
    return successResponse(
      {
        disconnected: true,
        message: 'Disconnected from QuickBooks (token revocation may have failed)',
      },
      HTTP_STATUS.OK
    );
  }
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(disconnectHandler, 'QBDisconnect');

