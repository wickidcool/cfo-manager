import type { ApiGatewayProxyResult, QBTokens } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { withTokenRefresh } from './utils/token-refresh';

interface GetAccountsBody {
  tokens: QBTokens;
}

/**
 * POST /api/quickbooks/accounts - Get all accounts
 *
 * Retrieves the chart of accounts from QuickBooks.
 */
async function getAccountsHandler(
  request: ParsedRequest<GetAccountsBody>
): Promise<ApiGatewayProxyResult> {
  const { body } = request;

  if (!body?.tokens) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Tokens are required',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  return withTokenRefresh(body.tokens, async (tokens) => {
    const accounts = await quickBooksApiService.getAccounts(tokens);
    return successResponse(
      {
        accounts,
        count: accounts.length,
      },
      HTTP_STATUS.OK
    );
  });
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(getAccountsHandler, 'QBGetAccounts');

