import type { ApiGatewayProxyResult, QBTokens, QBQueryParams, QBDateRange } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { withTokenRefresh } from './utils/token-refresh';

interface GetBillsBody {
  tokens: QBTokens;
  params?: QBQueryParams;
  dateRange?: QBDateRange;
}

/**
 * POST /api/quickbooks/bills - Get all bills
 *
 * Retrieves the list of bills (accounts payable) from QuickBooks.
 * Optionally filter by date range.
 */
async function getBillsHandler(
  request: ParsedRequest<GetBillsBody>
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
    const bills = await quickBooksApiService.getBills(tokens, {
      ...body.params,
      dateRange: body.dateRange,
    });

    // Calculate summary statistics
    const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalBalance = bills.reduce((sum, bill) => sum + bill.balance, 0);
    const paidCount = bills.filter((bill) => bill.balance === 0).length;

    return successResponse(
      {
        bills,
        count: bills.length,
        summary: {
          totalAmount,
          totalBalance,
          paidCount,
          unpaidCount: bills.length - paidCount,
        },
      },
      HTTP_STATUS.OK
    );
  });
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(getBillsHandler, 'QBGetBills');

