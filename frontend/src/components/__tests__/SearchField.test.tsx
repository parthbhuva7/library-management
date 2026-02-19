/**
 * Tests for SearchField component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchField from '../SearchField';

describe('SearchField', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSearch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with placeholder', () => {
    render(<SearchField {...defaultProps} placeholder="Search..." />);
    const input = screen.getByLabelText('Search');
    expect(input).toHaveAttribute('placeholder', 'Search...');
  });

  it('renders Search button', () => {
    render(<SearchField {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    render(<SearchField {...defaultProps} />);
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('test');
  });

  it('does NOT call onSearch when user types without submitting', () => {
    render(<SearchField {...defaultProps} />);
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(defaultProps.onSearch).not.toHaveBeenCalled();
  });

  it('calls onSearch with trimmed value when Search button is clicked', () => {
    render(<SearchField {...defaultProps} value="  query  " />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);
    expect(defaultProps.onSearch).toHaveBeenCalledWith('query');
  });

  it('calls onSearch with trimmed value on form submit (Enter)', () => {
    render(<SearchField {...defaultProps} value="  query  " />);
    const form = screen.getByLabelText('Search').closest('form');
    if (form) fireEvent.submit(form);
    expect(defaultProps.onSearch).toHaveBeenCalledWith('query');
  });

  it('calls onSearch with empty string when value is whitespace only', () => {
    render(<SearchField {...defaultProps} value="   " />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);
    expect(defaultProps.onSearch).toHaveBeenCalledWith('');
  });

  it('calls onSearch with empty string when clearing search', () => {
    render(<SearchField {...defaultProps} value="" />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);
    expect(defaultProps.onSearch).toHaveBeenCalledWith('');
  });
});
