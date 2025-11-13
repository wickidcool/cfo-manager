import {
  validateCreateUserRequest,
  validateUpdateUserRequest,
  validateCreateUserRequestWithErrors,
  validateUpdateUserRequestWithErrors,
  getValidationErrors,
} from '../../utils/validator';

describe('Validator Utils', () => {

  describe('validateCreateUserRequest', () => {
    it('should return true for valid request', () => {
      const validRequest = {
        email: 'user@example.com',
        name: 'John Doe',
      };
      expect(validateCreateUserRequest(validRequest)).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(validateCreateUserRequest(null)).toBe(false);
      expect(validateCreateUserRequest(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(validateCreateUserRequest('string')).toBe(false);
      expect(validateCreateUserRequest(123)).toBe(false);
      expect(validateCreateUserRequest([])).toBe(false);
    });

    it('should return false for missing email', () => {
      const request = {
        name: 'John Doe',
      };
      expect(validateCreateUserRequest(request)).toBe(false);
    });

    it('should return false for invalid email format', () => {
      const request = {
        email: 'invalid-email',
        name: 'John Doe',
      };
      expect(validateCreateUserRequest(request)).toBe(false);
    });

    it('should return false for email without @', () => {
      const request = {
        email: 'invalidemail.com',
        name: 'John Doe',
      };
      expect(validateCreateUserRequest(request)).toBe(false);
    });

    it('should return false for missing name', () => {
      const request = {
        email: 'user@example.com',
      };
      expect(validateCreateUserRequest(request)).toBe(false);
    });

    it('should return false for empty name', () => {
      const request = {
        email: 'user@example.com',
        name: '',
      };
      expect(validateCreateUserRequest(request)).toBe(false);
    });

    it('should return false for whitespace-only name', () => {
      const request = {
        email: 'user@example.com',
        name: '   ',
      };
      expect(validateCreateUserRequest(request)).toBe(false);
    });

    it('should return false for non-string email', () => {
      const request = {
        email: 123,
        name: 'John Doe',
      };
      expect(validateCreateUserRequest(request)).toBe(false);
    });

    it('should return false for non-string name', () => {
      const request = {
        email: 'user@example.com',
        name: 123,
      };
      expect(validateCreateUserRequest(request)).toBe(false);
    });
  });

  describe('validateUpdateUserRequest', () => {
    it('should return true for valid request with name', () => {
      const validRequest = {
        name: 'John Doe',
      };
      expect(validateUpdateUserRequest(validRequest)).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(validateUpdateUserRequest(null)).toBe(false);
      expect(validateUpdateUserRequest(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(validateUpdateUserRequest('string')).toBe(false);
      expect(validateUpdateUserRequest(123)).toBe(false);
      expect(validateUpdateUserRequest([])).toBe(false);
    });

    it('should return false for empty object', () => {
      const request = {};
      expect(validateUpdateUserRequest(request)).toBe(false);
    });

    it('should return false for empty name', () => {
      const request = {
        name: '',
      };
      expect(validateUpdateUserRequest(request)).toBe(false);
    });

    it('should return false for whitespace-only name', () => {
      const request = {
        name: '   ',
      };
      expect(validateUpdateUserRequest(request)).toBe(false);
    });

    it('should return false for non-string name', () => {
      const request = {
        name: 123,
      };
      expect(validateUpdateUserRequest(request)).toBe(false);
    });

    it('should reject name with only leading/trailing spaces', () => {
      const request = {
        name: '  John Doe  ',
      };
      // AJV schema requires non-whitespace characters
      expect(validateUpdateUserRequest(request)).toBe(false);
    });

    it('should accept valid name', () => {
      const request = {
        name: 'John Doe',
      };
      expect(validateUpdateUserRequest(request)).toBe(true);
    });
  });

  describe('validateCreateUserRequestWithErrors', () => {
    it('should return valid for correct data', () => {
      const validRequest = {
        email: 'user@example.com',
        name: 'John Doe',
      };
      const result = validateCreateUserRequestWithErrors(validRequest);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const invalidRequest = {
        email: 'invalid-email',
        name: 'John Doe',
      };
      const result = validateCreateUserRequestWithErrors(invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should return errors for missing fields', () => {
      const invalidRequest = {
        name: 'John Doe',
      };
      const result = validateCreateUserRequestWithErrors(invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateUpdateUserRequestWithErrors', () => {
    it('should return valid for correct data', () => {
      const validRequest = {
        name: 'John Doe',
      };
      const result = validateUpdateUserRequestWithErrors(validRequest);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for empty object', () => {
      const invalidRequest = {};
      const result = validateUpdateUserRequestWithErrors(invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return errors for invalid name', () => {
      const invalidRequest = {
        name: '',
      };
      const result = validateUpdateUserRequestWithErrors(invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('getValidationErrors', () => {
    it('should return default message for no errors', () => {
      const message = getValidationErrors();
      expect(message).toBe('Validation failed');
    });

    it('should return default message for empty errors array', () => {
      const message = getValidationErrors([]);
      expect(message).toBe('Validation failed');
    });

    it('should join multiple errors', () => {
      const errors = ['email: must be valid', 'name: is required'];
      const message = getValidationErrors(errors);
      expect(message).toBe('email: must be valid, name: is required');
    });

    it('should return single error', () => {
      const errors = ['email: must be valid'];
      const message = getValidationErrors(errors);
      expect(message).toBe('email: must be valid');
    });
  });
});

