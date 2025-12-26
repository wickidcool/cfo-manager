import type { ApiGatewayProxyResult, QBTokens } from '@aws-starter-kit/common-types';
import { HTTP_STATUS } from '@aws-starter-kit/common-types';
import { successResponse, errorResponse } from '../../utils/response';
import { quickBooksApiService } from '../../services/quickbooks-api.service';
import {
  createLambdaHandler,
  type ParsedRequest,
} from '../../utils/lambda-handler';
import { withTokenRefresh } from './utils/token-refresh';

interface CompanyInfoBody {
  tokens: QBTokens;
}

/**
 * POST /api/quickbooks/company - Get company information
 *
 * Retrieves the QuickBooks company information.
 */
async function companyInfoHandler(
  request: ParsedRequest<CompanyInfoBody>
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
    const companyInfo = await quickBooksApiService.getCompanyInfo(tokens);
    return successResponse(companyInfo, HTTP_STATUS.OK);
  });
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(companyInfoHandler, 'QBGetCompanyInfo');

