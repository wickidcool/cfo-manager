import type { ApiGatewayProxyResult, QBTokens } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { withTokenRefresh } from './utils/token-refresh';

interface GetItemsBody {
  tokens: QBTokens;
}

/**
 * POST /api/quickbooks/items - Get all items (products/services)
 *
 * Retrieves the list of items (products and services) from QuickBooks.
 */
async function getItemsHandler(
  request: ParsedRequest<GetItemsBody>
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
    const items = await quickBooksApiService.getItems(tokens);

    // Group items by type
    const byType = items.reduce(
      (acc, item) => {
        const type = item.type || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      },
      {} as Record<string, typeof items>
    );

    return successResponse(
      {
        items,
        count: items.length,
        byType: Object.entries(byType).map(([type, typeItems]) => ({
          type,
          count: typeItems.length,
        })),
      },
      HTTP_STATUS.OK
    );
  });
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(getItemsHandler, 'QBGetItems');

