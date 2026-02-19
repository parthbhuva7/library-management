/**
 * Tests for form validation utilities.
 * TDD: These tests define the expected behavior before implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  trim_whitespace,
  validate_required,
  get_validation_errors,
} from '../form-validation';

describe('trim_whitespace', () => {
  it('trims leading and trailing ASCII spaces', () => {
    expect(trim_whitespace('  hello  ')).toBe('hello');
  });

  it('trims tabs and newlines', () => {
    expect(trim_whitespace('\t\nhello\n\t')).toBe('hello');
  });

  it('trims Unicode non-breaking space (U+00A0)', () => {
    expect(trim_whitespace('\u00A0hello\u00A0')).toBe('hello');
  });

  it('trims thin space (U+2009) and other Unicode whitespace', () => {
    expect(trim_whitespace('\u2009hello\u2009')).toBe('hello');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(trim_whitespace('   ')).toBe('');
    expect(trim_whitespace('\t\n  \u00A0')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(trim_whitespace('')).toBe('');
  });

  it('handles null and undefined by returning empty string', () => {
    expect(trim_whitespace(null as unknown as string)).toBe('');
    expect(trim_whitespace(undefined as unknown as string)).toBe('');
  });
});

describe('validate_required', () => {
  it('returns null for non-empty trimmed value', () => {
    expect(validate_required('hello', 'name')).toBeNull();
    expect(validate_required('  John Doe  ', 'name')).toBeNull();
  });

  it('returns error message for empty string', () => {
    const result = validate_required('', 'username');
    expect(result).toContain('username');
    expect(result).toContain('required');
  });

  it('returns error message for whitespace-only string', () => {
    const result = validate_required('   ', 'title');
    expect(result).toContain('title');
    expect(result).toContain('required');
  });

  it('returns error message for tab-only string', () => {
    const result = validate_required('\t\t', 'author');
    expect(result).toContain('author');
  });

  it('returns error message for Unicode whitespace-only string', () => {
    const result = validate_required('\u00A0\u00A0', 'email');
    expect(result).toContain('email');
  });

  it('trims value before validation', () => {
    expect(validate_required('  x  ', 'field')).toBeNull();
  });

  it('returns error for null and undefined', () => {
    expect(validate_required(null as unknown as string, 'field')).toContain(
      'required'
    );
    expect(validate_required(undefined as unknown as string, 'field')).toContain(
      'required'
    );
  });
});

describe('get_validation_errors', () => {
  it('returns empty object when all fields are valid', () => {
    const fields = {
      title: 'Book Title',
      author: 'Author Name',
    };
    expect(get_validation_errors(fields)).toEqual({});
  });

  it('returns errors for invalid required fields', () => {
    const fields = {
      title: '',
      author: 'Author Name',
    };
    const errors = get_validation_errors(fields);
    expect(errors.title).toContain('required');
    expect(errors.author).toBeUndefined();
  });

  it('returns errors for whitespace-only fields', () => {
    const fields = {
      name: '   ',
      email: '  \t  ',
    };
    const errors = get_validation_errors(fields);
    expect(errors.name).toContain('required');
    expect(errors.email).toContain('required');
  });

  it('validates all fields in the object', () => {
    const fields = {
      a: '',
      b: '  ',
      c: 'valid',
    };
    const errors = get_validation_errors(fields);
    expect(Object.keys(errors)).toContain('a');
    expect(Object.keys(errors)).toContain('b');
    expect(Object.keys(errors)).not.toContain('c');
  });
});
