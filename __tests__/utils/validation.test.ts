import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateWorkoutTitle,
  hasErrors,
  ValidationRules,
  FormErrors,
} from '@/utils/validation';

describe('ValidationRules', () => {
  it('has correct email pattern', () => {
    expect(ValidationRules.email.pattern.test('user@example.com')).toBe(true);
    expect(ValidationRules.email.pattern.test('invalid')).toBe(false);
  });

  it('has correct password min length', () => {
    expect(ValidationRules.password.minLength).toBe(8);
  });

  it('has correct display name bounds', () => {
    expect(ValidationRules.displayName.minLength).toBe(2);
    expect(ValidationRules.displayName.maxLength).toBe(50);
  });

  it('has correct workout title bounds', () => {
    expect(ValidationRules.workoutTitle.minLength).toBe(1);
    expect(ValidationRules.workoutTitle.maxLength).toBe(100);
  });
});

describe('validateEmail', () => {
  it('returns null for valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });

  it('returns error for empty email', () => {
    expect(validateEmail('')).not.toBeNull();
  });

  it('returns error for whitespace-only email', () => {
    expect(validateEmail('   ')).not.toBeNull();
  });

  it('returns error for email without @', () => {
    expect(validateEmail('userexample.com')).not.toBeNull();
  });

  it('returns error for email without domain', () => {
    expect(validateEmail('user@')).not.toBeNull();
  });

  it('returns error for email without TLD', () => {
    expect(validateEmail('user@domain')).not.toBeNull();
  });

  it('accepts email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBeNull();
  });

  it('accepts email with plus addressing', () => {
    expect(validateEmail('user+tag@example.com')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('returns null for valid password', () => {
    expect(validatePassword('12345678')).toBeNull();
  });

  it('returns error for empty password', () => {
    expect(validatePassword('')).not.toBeNull();
  });

  it('returns error for short password', () => {
    expect(validatePassword('1234567')).not.toBeNull();
  });

  it('returns null for exactly min length', () => {
    expect(validatePassword('12345678')).toBeNull();
  });

  it('accepts long passwords', () => {
    expect(validatePassword('a'.repeat(200))).toBeNull();
  });

  it('accepts special characters', () => {
    expect(validatePassword('p@$$w0rd!')).toBeNull();
  });
});

describe('validateDisplayName', () => {
  it('returns null for valid name', () => {
    expect(validateDisplayName('Max')).toBeNull();
  });

  it('returns error for empty name', () => {
    expect(validateDisplayName('')).not.toBeNull();
  });

  it('returns error for whitespace-only name', () => {
    expect(validateDisplayName('   ')).not.toBeNull();
  });

  it('returns error for single character', () => {
    expect(validateDisplayName('A')).not.toBeNull();
  });

  it('returns null for exactly min length', () => {
    expect(validateDisplayName('Ab')).toBeNull();
  });

  it('returns null for max length', () => {
    expect(validateDisplayName('A'.repeat(50))).toBeNull();
  });

  it('returns error for too long name', () => {
    expect(validateDisplayName('A'.repeat(51))).not.toBeNull();
  });
});

describe('validateWorkoutTitle', () => {
  it('returns null for valid title', () => {
    expect(validateWorkoutTitle('Push Day')).toBeNull();
  });

  it('returns error for empty title', () => {
    expect(validateWorkoutTitle('')).not.toBeNull();
  });

  it('returns error for whitespace-only title', () => {
    expect(validateWorkoutTitle('   ')).not.toBeNull();
  });

  it('returns null for single character', () => {
    expect(validateWorkoutTitle('A')).toBeNull();
  });

  it('returns null for max length', () => {
    expect(validateWorkoutTitle('A'.repeat(100))).toBeNull();
  });

  it('returns error for too long title', () => {
    expect(validateWorkoutTitle('A'.repeat(101))).not.toBeNull();
  });
});

describe('hasErrors', () => {
  it('returns false for empty errors', () => {
    expect(hasErrors({})).toBe(false);
  });

  it('returns false when all errors are null', () => {
    expect(hasErrors({ email: null, password: null })).toBe(false);
  });

  it('returns true when any error exists', () => {
    expect(hasErrors({ email: null, password: 'Error' })).toBe(true);
  });

  it('returns true when all errors exist', () => {
    expect(hasErrors({ email: 'Error1', password: 'Error2' })).toBe(true);
  });

  it('handles undefined values as no error', () => {
    expect(hasErrors({ field: undefined as any })).toBe(false);
  });
});
