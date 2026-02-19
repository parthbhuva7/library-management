/**
 * Form validation utilities with Unicode whitespace trimming.
 * Rejects empty and whitespace-only submissions.
 */

/**
 * Trim leading and trailing whitespace (all Unicode whitespace).
 * Handles null/undefined by returning empty string.
 */
export function trim_whitespace(value: string | null | undefined): string {
  if (value == null) {
    return '';
  }
  return String(value).trim();
}

/**
 * Validate that a required field has a non-empty value after trimming.
 * Returns error message or null if valid.
 */
export function validate_required(
  value: string | null | undefined,
  field_name: string
): string | null {
  const trimmed = trim_whitespace(value);
  if (trimmed === '') {
    return `${field_name} is required`;
  }
  return null;
}

/**
 * Batch validate required fields. Returns object of field name to error message.
 * Only includes fields that have validation errors.
 */
export function get_validation_errors(
  fields: Record<string, string | null | undefined>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [name, value] of Object.entries(fields)) {
    const error = validate_required(value, name);
    if (error) {
      errors[name] = error;
    }
  }
  return errors;
}
