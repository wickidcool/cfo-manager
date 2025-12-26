import type { ApiGatewayProxyResult, QBTokens, QBQueryParams, QBDateRange } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { withTokenRefresh } from './utils/token-refresh';

interface GetInvoicesBody {
  tokens: QBTokens;
  params?: QBQueryParams;
  dateRange?: QBDateRange;
}

/**
 * POST /api/quickbooks/invoices - Get all invoices
 *
 * Retrieves the list of invoices from QuickBooks.
 * Optionally filter by date range.
 */
async function getInvoicesHandler(
  request: ParsedRequest<GetInvoicesBody>
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
    const invoices = await quickBooksApiService.getInvoices(tokens, {
      ...body.params,
      dateRange: body.dateRange,
    });

    // Calculate summary statistics
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalBalance = invoices.reduce((sum, inv) => sum + inv.balance, 0);
    const paidCount = invoices.filter((inv) => inv.status === 'Paid').length;
    const overdueCount = invoices.filter((inv) => inv.status === 'Overdue').length;

    return successResponse(
      {
        invoices,
        count: invoices.length,
        summary: {
          totalAmount,
          totalBalance,
          paidCount,
          overdueCount,
          pendingCount: invoices.length - paidCount - overdueCount,
        },
      },
      HTTP_STATUS.OK
    );
  });
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(getInvoicesHandler, 'QBGetInvoices');

