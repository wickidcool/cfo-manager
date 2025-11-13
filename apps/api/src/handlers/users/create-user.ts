import type {
  ApiGatewayProxyResult,
  CreateUserRequest,
} from '@aws-starter-kit/common-types';
import { HTTP_STATUS, ERROR_CODES } from '@aws-starter-kit/common-types';
import { successResponse } from '../../utils/response';
import {
  validateCreateUserRequestWithErrors,
  getValidationErrors,
} from '../../utils/validator';
import { userService } from '../../services/user-service';
import {
  createLambdaHandler,
  createErrorResult,
  validateBodyPresent,
  type ParsedRequest,
} from '../../utils/lambda-handler';

/**
 * POST /users - Create a new user
 */
async function createUserHandler(
  request: ParsedRequest<CreateUserRequest>
): Promise<ApiGatewayProxyResult> {
  // Validate body is present
  const bodyValidation = validateBodyPresent(request.body, request.rawBody);
  if (!bodyValidation.valid) {
    throw createErrorResult(
      ERROR_CODES.VALIDATION_ERROR,
      bodyValidation.error || 'Request body is required',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Validate request data with AJV
  const validation = validateCreateUserRequestWithErrors(request.body);
  if (!validation.valid) {
    throw createErrorResult(
      ERROR_CODES.VALIDATION_ERROR,
      getValidationErrors(validation.errors),
      HTTP_STATUS.BAD_REQUEST,
      { errors: validation.errors }
    );
  }

  const user = await userService.createUser(request.body as CreateUserRequest);

  return successResponse(user, HTTP_STATUS.CREATED, 'User created successfully');
}

/**
 * Lambda handler wrapper
 */
export const handler = createLambdaHandler(createUserHandler, 'CreateUser');
