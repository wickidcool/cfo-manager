import type { ApiGatewayProxyResult, QBTokens, QBQueryParams } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { withTokenRefresh } from './utils/token-refresh';

interface GetCustomersBody {
  tokens: QBTokens;
  params?: QBQueryParams;
}

/**
 * POST /api/quickbooks/customers - Get all customers
 *
 * Retrieves the list of customers from QuickBooks.
 */
async function getCustomersHandler(
  request: ParsedRequest<GetCustomersBody>
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
    const customers = await quickBooksApiService.getCustomers(tokens, body.params);
    return successResponse(
      {
        customers,
        count: customers.length,
      },
      HTTP_STATUS.OK
    );
  });
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(getCustomersHandler, 'QBGetCustomers');

