import type { ApiGatewayProxyResult } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksOAuthService } from '../../services/quickbooks-oauth.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { v4 as uuidv4 } from 'uuid';

interface AuthStartBody {
  userId: string;
  redirectUrl?: string;
}

/**
 * POST /api/quickbooks/auth/start - Start OAuth flow
 *
 * Generates the QuickBooks authorization URL for the OAuth flow.
 * The client should redirect the user to this URL.
 */
async function authStartHandler(
  request: ParsedRequest<AuthStartBody>
): Promise<ApiGatewayProxyResult> {
  const { body } = request;

  if (!body?.userId) {
    return errorResponse(
      'VALIDATION_ERROR',
      'userId is required',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Generate a unique state that includes the userId for verification on callback
  const state = `${body.userId}:${uuidv4()}`;

  const authResponse = await quickBooksOAuthService.getAuthorizationUrl(state);

  return successResponse(authResponse, HTTP_STATUS.OK);
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(authStartHandler, 'QBAuthStart');

