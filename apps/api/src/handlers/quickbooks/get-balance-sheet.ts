import type { ApiGatewayProxyResult, QBTokens } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { withTokenRefresh } from './utils/token-refresh';

interface GetBalanceSheetBody {
  tokens: QBTokens;
  asOfDate?: string;
}

/**
 * POST /api/quickbooks/reports/balance-sheet - Get Balance Sheet report
 *
 * Retrieves the Balance Sheet report from QuickBooks.
 * Optionally specify an "as of" date (defaults to today).
 */
async function getBalanceSheetHandler(
  request: ParsedRequest<GetBalanceSheetBody>
): Promise<ApiGatewayProxyResult> {
  const { body } = request;

  if (!body?.tokens) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Tokens are required',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Default to today if no date specified
  const asOfDate = body.asOfDate || new Date().toISOString().split('T')[0];

  return withTokenRefresh(body.tokens, async (tokens) => {
    const report = await quickBooksApiService.getBalanceSheetReport(
      tokens,
      asOfDate
    );
    return successResponse(report, HTTP_STATUS.OK);
  });
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(getBalanceSheetHandler, 'QBGetBalanceSheet');

