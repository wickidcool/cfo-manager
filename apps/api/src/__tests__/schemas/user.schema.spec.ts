import { createUserSchema, updateUserSchema } from '../../schemas/user.schema';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

describe('User Schemas', () => {
  let ajv: Ajv;

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
  });

  describe('createUserSchema', () => {
    it('should validate correct CreateUserRequest', () => {
      const validate = ajv.compile(createUserSchema);
      const validData = {
        email: 'user@example.com',
        name: 'John Doe',
      };

      expect(validate(validData)).toBe(true);
    });

    it('should reject missing email', () => {
      const validate = ajv.compile(createUserSchema);
      const invalidData = {
        name: 'John Doe',
      };

      expect(validate(invalidData)).toBe(false);
      expect(validate.errors).toBeDefined();
    });

    it('should reject invalid email format', () => {
      const validate = ajv.compile(createUserSchema);
      const invalidData = {
        email: 'not-an-email',
        name: 'John Doe',
      };

      expect(validate(invalidData)).toBe(false);
      expect(validate.errors).toBeDefined();
    });

    it('should reject missing name', () => {
      const validate = ajv.compile(createUserSchema);
      const invalidData = {
        email: 'user@example.com',
      };

      expect(validate(invalidData)).toBe(false);
      expect(validate.errors).toBeDefined();
    });

    it('should reject empty name', () => {
      const validate = ajv.compile(createUserSchema);
      const invalidData = {
        email: 'user@example.com',
        name: '',
      };

      expect(validate(invalidData)).toBe(false);
    });

    it('should reject whitespace-only name', () => {
      const validate = ajv.compile(createUserSchema);
      const invalidData = {
        email: 'user@example.com',
        name: '   ',
      };

      expect(validate(invalidData)).toBe(false);
    });

    it('should reject name exceeding max length', () => {
      const validate = ajv.compile(createUserSchema);
      const invalidData = {
        email: 'user@example.com',
        name: 'a'.repeat(256),
      };

      expect(validate(invalidData)).toBe(false);
    });

    it('should reject additional properties', () => {
      const validate = ajv.compile(createUserSchema);
      const invalidData = {
        email: 'user@example.com',
        name: 'John Doe',
        extraField: 'should not be here',
      };

      expect(validate(invalidData)).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('should validate correct UpdateUserRequest', () => {
      const validate = ajv.compile(updateUserSchema);
      const validData = {
        name: 'John Updated',
      };

      expect(validate(validData)).toBe(true);
    });

    it('should reject empty object', () => {
      const validate = ajv.compile(updateUserSchema);
      const invalidData = {};

      expect(validate(invalidData)).toBe(false);
      expect(validate.errors).toBeDefined();
    });

    it('should reject empty name', () => {
      const validate = ajv.compile(updateUserSchema);
      const invalidData = {
        name: '',
      };

      expect(validate(invalidData)).toBe(false);
    });

    it('should reject whitespace-only name', () => {
      const validate = ajv.compile(updateUserSchema);
      const invalidData = {
        name: '   ',
      };

      expect(validate(invalidData)).toBe(false);
    });

    it('should reject name exceeding max length', () => {
      const validate = ajv.compile(updateUserSchema);
      const invalidData = {
        name: 'a'.repeat(256),
      };

      expect(validate(invalidData)).toBe(false);
    });

    it('should reject additional properties', () => {
      const validate = ajv.compile(updateUserSchema);
      const invalidData = {
        name: 'John Updated',
        extraField: 'should not be here',
      };

      expect(validate(invalidData)).toBe(false);
    });

    it('should accept null name', () => {
      const validate = ajv.compile(updateUserSchema);
      const validData = {
        name: null,
      };

      expect(validate(validData)).toBe(true);
    });
  });
});

