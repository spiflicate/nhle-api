import { expect } from 'bun:test';
import type { APIResponse } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';

/**
 * Expect the API response to be a successful response
 * @param result - The API response to check
 */
export const expectSuccess = (result: APIResponse<unknown>) => {
   expect(result).toBeDefined();
   expect(typeof result).toBe('object');
   expect(result.success).toBeTrue();
};

/**
 * Expect the API response to be a validation error
 * @param result - The API response to check
 */
export const expectValidationError = (result: APIResponse<unknown>) => {
   expect(result).toBeDefined();
   expect(result.success).toBeFalse();
   if (result.success) {
      expect.unreachable('Expected error but got success');
   }
   expect(result.error).toBeDefined();
   expect(result.error).toBeInstanceOf(ValidationError);
};
