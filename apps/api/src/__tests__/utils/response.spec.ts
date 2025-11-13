import { successResponse, errorResponse } from '../../utils/response';
import { HTTP_STATUS, ERROR_CODES } from '@aws-starter-kit/common-types';

describe('Response Utils', () => {
  describe('successResponse', () => {
    it('should create success response with data', () => {
      const data = { id: '1', name: 'Test' };
      const response = successResponse(data);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeDefined();
      expect(response.headers?.['Content-Type']).toBe('application/json');
      expect(response.headers?.['Access-Control-Allow-Origin']).toBe('*');

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.message).toBeUndefined();
    });

    it('should create success response with custom status code', () => {
      const data = { id: '1' };
      const response = successResponse(data, HTTP_STATUS.CREATED);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
    });

    it('should create success response with message', () => {
      const data = { id: '1' };
      const message = 'Operation successful';
      const response = successResponse(data, HTTP_STATUS.OK, message);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.message).toBe(message);
    });

    it('should handle null data', () => {
      const response = successResponse(null);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeNull();
    });

    it('should handle array data', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const response = successResponse(data);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should include CORS headers', () => {
      const response = successResponse({});

      expect(response.headers?.['Access-Control-Allow-Origin']).toBe('*');
      expect(response.headers?.['Access-Control-Allow-Methods']).toBeDefined();
      expect(response.headers?.['Access-Control-Allow-Headers']).toBeDefined();
    });
  });

  describe('errorResponse', () => {
    it('should create error response with code and message', () => {
      const code = ERROR_CODES.NOT_FOUND;
      const message = 'Resource not found';
      const response = errorResponse(code, message);

      expect(response.statusCode).toBe(500);
      expect(response.headers).toBeDefined();

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe(code);
      expect(body.error.message).toBe(message);
      expect(body.error.details).toBeUndefined();
    });

    it('should create error response with custom status code', () => {
      const code = ERROR_CODES.NOT_FOUND;
      const message = 'Not found';
      const response = errorResponse(code, message, HTTP_STATUS.NOT_FOUND);

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe(code);
    });

    it('should create error response with details', () => {
      const code = ERROR_CODES.VALIDATION_ERROR;
      const message = 'Validation failed';
      const details = { field: 'email', reason: 'invalid format' };
      const response = errorResponse(
        code,
        message,
        HTTP_STATUS.BAD_REQUEST,
        details
      );

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe(code);
      expect(body.error.message).toBe(message);
      expect(body.error.details).toEqual(details);
    });

    it('should use default status code 500', () => {
      const response = errorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        'Internal error'
      );

      expect(response.statusCode).toBe(500);
    });

    it('should include CORS headers', () => {
      const response = errorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        'Error message'
      );

      expect(response.headers?.['Access-Control-Allow-Origin']).toBe('*');
      expect(response.headers?.['Access-Control-Allow-Methods']).toBeDefined();
      expect(response.headers?.['Access-Control-Allow-Headers']).toBeDefined();
    });

    it('should not include data field in error response', () => {
      const response = errorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        'Error message'
      );

      const body = JSON.parse(response.body);
      expect(body.data).toBeUndefined();
      expect(body.error).toBeDefined();
    });
  });
});

