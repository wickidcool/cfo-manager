import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import type { CreateUserRequest, UpdateUserRequest } from '@aws-starter-kit/common-types';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

// Initialize AJV with formats support
const ajv = new Ajv({ allErrors: true, removeAdditional: true });
addFormats(ajv);

// Compile schemas
const validateCreateUserFn: ValidateFunction<CreateUserRequest> = ajv.compile(createUserSchema);
const validateUpdateUserFn: ValidateFunction<UpdateUserRequest> = ajv.compile(updateUserSchema);

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate CreateUserRequest
 */
export function validateCreateUserRequest(data: unknown): data is CreateUserRequest {
  return validateCreateUserFn(data);
}

/**
 * Validate CreateUserRequest with detailed errors
 */
export function validateCreateUserRequestWithErrors(data: unknown): ValidationResult {
  const valid = validateCreateUserFn(data);
  
  if (!valid && validateCreateUserFn.errors) {
    const errors = validateCreateUserFn.errors.map(err => {
      const field = err.instancePath.replace('/', '') || err.params['missingProperty'] || 'request';
      return `${field}: ${err.message}`;
    });
    return { valid: false, errors };
  }
  
  return { valid: true };
}

/**
 * Validate UpdateUserRequest
 */
export function validateUpdateUserRequest(data: unknown): data is UpdateUserRequest {
  return validateUpdateUserFn(data);
}

/**
 * Validate UpdateUserRequest with detailed errors
 */
export function validateUpdateUserRequestWithErrors(data: unknown): ValidationResult {
  const valid = validateUpdateUserFn(data);
  
  if (!valid && validateUpdateUserFn.errors) {
    const errors = validateUpdateUserFn.errors.map(err => {
      const field = err.instancePath.replace('/', '') || err.params['missingProperty'] || 'request';
      return `${field}: ${err.message}`;
    });
    return { valid: false, errors };
  }
  
  return { valid: true };
}

/**
 * Get validation errors as a formatted string
 */
export function getValidationErrors(errors?: string[]): string {
  if (!errors || errors.length === 0) {
    return 'Validation failed';
  }
  return errors.join(', ');
}

