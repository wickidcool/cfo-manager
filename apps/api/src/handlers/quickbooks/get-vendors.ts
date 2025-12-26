import type { ApiGatewayProxyResult, QBTokens, QBQueryParams } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { withTokenRefresh } from './utils/token-refresh';

interface GetVendorsBody {
  tokens: QBTokens;
  params?: QBQueryParams;
}

/**
 * POST /api/quickbooks/vendors - Get all vendors
 *
 * Retrieves the list of vendors from QuickBooks.
 */
async function getVendorsHandler(
  request: ParsedRequest<GetVendorsBody>
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
    const vendors = await quickBooksApiService.getVendors(tokens, body.params);
    return successResponse(
      {
        vendors,
        count: vendors.length,
      },
      HTTP_STATUS.OK
    );
  });
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(getVendorsHandler, 'QBGetVendors');

