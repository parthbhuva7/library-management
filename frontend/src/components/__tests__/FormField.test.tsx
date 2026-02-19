/**
 * Tests for FormField validation behavior.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormField from '../FormField';
import { validate_required } from '@/lib/form-validation';

describe('FormField', () => {
  it('displays error message when error prop is provided', () => {
    render(
      <FormField
        label="Title"
        name="title"
        value=""
        onChange={() => {}}
        error="Title is required"
      />
    );
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('calls onValidationChange with error when validateOnChange and value is invalid', () => {
    const onValidationChange = vi.fn();
    render(
      <FormField
        label="Title"
        name="title"
        value=""
        onChange={() => {}}
        onValidate={(v) => validate_required(v, 'Title')}
        validateOnChange
        onValidationChange={onValidationChange}
      />
    );
    const input = screen.getByRole('textbox', { name: /title/i });
    fireEvent.change(input, { target: { value: '   ' } });
    expect(onValidationChange).toHaveBeenCalledWith('Title is required');
  });

  it('calls onValidationChange with null when value becomes valid', () => {
    const onValidationChange = vi.fn();
    render(
      <FormField
        label="Title"
        name="title"
        value=""
        onChange={() => {}}
        onValidate={(v) => validate_required(v, 'Title')}
        validateOnChange
        onValidationChange={onValidationChange}
      />
    );
    const input = screen.getByRole('textbox', { name: /title/i });
    fireEvent.change(input, { target: { value: 'Valid Title' } });
    expect(onValidationChange).toHaveBeenCalledWith(null);
  });

  it('calls onChange with the new value', () => {
    const onChange = vi.fn();
    render(
      <FormField
        label="Name"
        name="name"
        value=""
        onChange={onChange}
      />
    );
    const input = screen.getByRole('textbox', { name: /name/i });
    fireEvent.change(input, { target: { value: 'John Doe' } });
    expect(onChange).toHaveBeenCalledWith('John Doe');
  });

  it('does not show error element when error is empty', () => {
    render(
      <FormField
        label="Title"
        name="title"
        value="hello"
        onChange={() => {}}
      />
    );
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });
});
