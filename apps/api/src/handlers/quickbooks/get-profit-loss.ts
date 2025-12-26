import type { ApiGatewayProxyResult, QBTokens, QBDateRange } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { withTokenRefresh } from './utils/token-refresh';

interface GetProfitLossBody {
  tokens: QBTokens;
  dateRange: QBDateRange;
}

/**
 * POST /api/quickbooks/reports/profit-loss - Get Profit and Loss report
 *
 * Retrieves the Profit and Loss (Income Statement) report from QuickBooks.
 * Requires a date range.
 */
async function getProfitLossHandler(
  request: ParsedRequest<GetProfitLossBody>
): Promise<ApiGatewayProxyResult> {
  const { body } = request;

  if (!body?.tokens) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Tokens are required',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  if (!body.dateRange?.startDate || !body.dateRange?.endDate) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Date range (startDate and endDate) is required',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  return withTokenRefresh(body.tokens, async (tokens) => {
    const report = await quickBooksApiService.getProfitAndLossReport(
      tokens,
      body.dateRange
    );
    return successResponse(report, HTTP_STATUS.OK);
  });
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(getProfitLossHandler, 'QBGetProfitLoss');

