import {
  parseRequest,
  validatePathParameters,
  validateBodyPresent,
  createLambdaHandler,
  createErrorResult,
} from '../../utils/lambda-handler';
import type { ApiGatewayProxyEvent } from '@aws-starter-kit/common-types';
import { HTTP_STATUS, ERROR_CODES } from '@aws-starter-kit/common-types';

describe('Lambda Handler Utils', () => {
  describe('parseRequest', () => {
    it('should parse a complete API Gateway event', () => {
      const event: ApiGatewayProxyEvent = {
        httpMethod: 'POST',
        path: '/users',
        pathParameters: { id: '123' },
        queryStringParameters: { page: '1', limit: '10' },
        headers: { 'Content-Type': 'application/json' },
        body: '{"name":"Test User"}',
        isBase64Encoded: false,
      };

      const result = parseRequest(event);

      expect(result.httpMethod).toBe('POST');
      expect(result.path).toBe('/users');
      expect(result.pathParameters).toEqual({ id: '123' });
      expect(result.queryParameters).toEqual({ page: '1', limit: '10' });
      expect(result.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(result.body).toEqual({ name: 'Test User' });
      expect(result.rawBody).toBe('{"name":"Test User"}');
    });

    it('should handle missing optional fields', () => {
      const event: ApiGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/users',
        pathParameters: null,
        queryStringParameters: null,
        headers: {},
        body: null,
        isBase64Encoded: false,
      };

      const result = parseRequest(event);

      expect(result.pathParameters).toEqual({});
      expect(result.queryParameters).toEqual({});
      expect(result.headers).toEqual({});
      expect(result.body).toBeNull();
      expect(result.rawBody).toBeNull();
    });

    it('should handle invalid JSON body', () => {
      const event: ApiGatewayProxyEvent = {
        httpMethod: 'POST',
        path: '/users',
        pathParameters: null,
        queryStringParameters: null,
        headers: {},
        body: 'invalid json{',
        isBase64Encoded: false,
      };

      const result = parseRequest(event);

      expect(result.body).toBeNull();
      expect(result.rawBody).toBe('invalid json{');
    });
  });

  describe('validatePathParameters', () => {
    it('should validate all required parameters are present', () => {
      const pathParameters = { id: '123', type: 'user' };
      const result = validatePathParameters(pathParameters, ['id', 'type']);

      expect(result.valid).toBe(true);
      expect(result.missing).toBeUndefined();
    });

    it('should return false when required parameter is missing', () => {
      const pathParameters = { id: '123' };
      const result = validatePathParameters(pathParameters, ['id', 'type']);

      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['type']);
    });

    it('should return false when multiple required parameters are missing', () => {
      const pathParameters = {};
      const result = validatePathParameters(pathParameters, ['id', 'type']);

      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['id', 'type']);
    });

    it('should validate successfully with no required parameters', () => {
      const pathParameters = {};
      const result = validatePathParameters(pathParameters, []);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateBodyPresent', () => {
    it('should validate when body is present', () => {
      const body = { name: 'Test' };
      const rawBody = '{"name":"Test"}';
      const result = validateBodyPresent(body, rawBody);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error when raw body is null', () => {
      const result = validateBodyPresent(null, null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Request body is required');
    });

    it('should return error when body is null but raw body exists', () => {
      const result = validateBodyPresent(null, 'invalid json{');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid JSON in request body');
    });
  });

  describe('createErrorResult', () => {
    it('should create an error response', () => {
      const result = createErrorResult(
        ERROR_CODES.NOT_FOUND,
        'Resource not found',
        HTTP_STATUS.NOT_FOUND
      );

      expect(result.statusCode).toBe(404);
      expect(result.headers).toBeDefined();
      expect(result.body).toBeDefined();

      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(body.error.message).toBe('Resource not found');
    });

    it('should include details in error response', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const result = createErrorResult(
        ERROR_CODES.VALIDATION_ERROR,
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        details
      );

      const body = JSON.parse(result.body);
      expect(body.error.details).toEqual(details);
    });
  });

  describe('createLambdaHandler', () => {
    it('should wrap handler function and call it with parsed request', async () => {
      const mockHandlerFn = jest.fn().mockResolvedValue({
        statusCode: 200,
        body: '{"success":true}',
      });

      const handler = createLambdaHandler(mockHandlerFn, 'TestHandler');

      const event: ApiGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
        pathParameters: null,
        queryStringParameters: null,
        headers: {},
        body: null,
        isBase64Encoded: false,
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(mockHandlerFn).toHaveBeenCalledTimes(1);
      expect(mockHandlerFn).toHaveBeenCalledWith(
        expect.objectContaining({
          httpMethod: 'GET',
          path: '/test',
          pathParameters: {},
          queryParameters: {},
          headers: {},
          body: null,
          rawBody: null,
        })
      );
    });

    it('should catch and return ApiGatewayProxyResult errors', async () => {
      const mockError = createErrorResult(
        ERROR_CODES.NOT_FOUND,
        'Not found',
        HTTP_STATUS.NOT_FOUND
      );

      const mockHandlerFn = jest.fn().mockRejectedValue(mockError);

      const handler = createLambdaHandler(mockHandlerFn, 'TestHandler');

      const event: ApiGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
        pathParameters: null,
        queryStringParameters: null,
        headers: {},
        body: null,
        isBase64Encoded: false,
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(404);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(ERROR_CODES.NOT_FOUND);
    });

    it('should handle generic errors', async () => {
      const mockHandlerFn = jest.fn().mockRejectedValue(new Error('Unexpected error'));

      const handler = createLambdaHandler(mockHandlerFn, 'TestHandler');

      const event: ApiGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
        pathParameters: null,
        queryStringParameters: null,
        headers: {},
        body: null,
        isBase64Encoded: false,
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
      expect(body.error.message).toContain('TestHandler');
    });
  });
});

