import {
  validate,
  validateTypeGuard,
  getValidationErrors,
} from '../../utils/validator';
import { createUserSchema, updateUserSchema } from '../../schemas/user.schema';
import type { CreateUserRequest, UpdateUserRequest } from '@aws-starter-kit/common-types';

describe('Validator Utils', () => {

  describe('validate with createUserSchema', () => {
    it('should return valid for correct data', () => {
      const validRequest = {
        email: 'user@example.com',
        name: 'John Doe',
      };
      const result = validate(createUserSchema, validRequest);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for missing email', () => {
      const invalidRequest = {
        name: 'John Doe',
      };
      const result = validate(createUserSchema, invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should return errors for invalid email format', () => {
      const invalidRequest = {
        email: 'invalid-email',
        name: 'John Doe',
      };
      const result = validate(createUserSchema, invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should return errors for missing name', () => {
      const invalidRequest = {
        email: 'user@example.com',
      };
      const result = validate(createUserSchema, invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return errors for empty name', () => {
      const invalidRequest = {
        email: 'user@example.com',
        name: '',
      };
      const result = validate(createUserSchema, invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return errors for whitespace-only name', () => {
      const invalidRequest = {
        email: 'user@example.com',
        name: '   ',
      };
      const result = validate(createUserSchema, invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validate with updateUserSchema', () => {
    it('should return valid for correct data', () => {
      const validRequest = {
        name: 'John Doe',
      };
      const result = validate(updateUserSchema, validRequest);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for empty object', () => {
      const invalidRequest = {};
      const result = validate(updateUserSchema, invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return errors for empty name', () => {
      const invalidRequest = {
        name: '',
      };
      const result = validate(updateUserSchema, invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return errors for whitespace-only name', () => {
      const invalidRequest = {
        name: '   ',
      };
      const result = validate(updateUserSchema, invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return errors for name with leading/trailing spaces', () => {
      const invalidRequest = {
        name: '  John Doe  ',
      };
      const result = validate(updateUserSchema, invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateTypeGuard', () => {
    it('should return true for valid CreateUserRequest', () => {
      const validRequest = {
        email: 'user@example.com',
        name: 'John Doe',
      };
      
      expect(validateTypeGuard<CreateUserRequest>(createUserSchema, validRequest)).toBe(true);
    });

    it('should return false for invalid CreateUserRequest', () => {
      const invalidRequest = {
        email: 'invalid-email',
        name: 'John Doe',
      };
      
      expect(validateTypeGuard<CreateUserRequest>(createUserSchema, invalidRequest)).toBe(false);
    });

    it('should return true for valid UpdateUserRequest', () => {
      const validRequest = {
        name: 'John Doe',
      };
      
      expect(validateTypeGuard<UpdateUserRequest>(updateUserSchema, validRequest)).toBe(true);
    });

    it('should return false for invalid UpdateUserRequest', () => {
      const invalidRequest = {};
      
      expect(validateTypeGuard<UpdateUserRequest>(updateUserSchema, invalidRequest)).toBe(false);
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
