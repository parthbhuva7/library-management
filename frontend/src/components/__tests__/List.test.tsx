import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import List, { ListItem, ListCell, ListHeader } from '../List';

describe('List', () => {
  it('renders list with headers and grid columns', () => {
    const { container } = render(
      <List headers={['A', 'B', 'C']}>
        <ListItem>
          <ListCell>1</ListCell>
          <ListCell>2</ListCell>
          <ListCell>3</ListCell>
        </ListItem>
      </List>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute('style');
    expect((list as HTMLElement).style.getPropertyValue('--list-grid-cols')).toBe(
      'repeat(3, minmax(0, 1fr))'
    );
  });

  it('applies custom columnWidths when provided', () => {
    const { container } = render(
      <List
        headers={['Col1', 'Col2']}
        columnWidths={['1fr', 'min-content']}
      >
        <ListItem>
          <ListCell>a</ListCell>
          <ListCell>b</ListCell>
        </ListItem>
      </List>
    );
    const list = container.querySelector('ul');
    expect(list).toHaveAttribute(
      'style',
      expect.stringContaining('--list-grid-cols')
    );
  });

  it('renders ListCell with truncate by default', () => {
    render(
      <List headers={['Title']}>
        <ListItem>
          <ListCell>Long text that should truncate</ListCell>
        </ListItem>
      </List>
    );
    const cell = screen.getByText('Long text that should truncate');
    expect(cell).toBeInTheDocument();
  });

  it('renders ListCell with truncate=false for action columns', () => {
    render(
      <List headers={['Actions']}>
        <ListItem>
          <ListCell truncate={false}>Edit</ListCell>
        </ListItem>
      </List>
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('passes alignments to ListHeader', () => {
    render(
      <List headers={['Left', 'Right']} alignments={['left', 'right']}>
        <ListItem>
          <ListCell align="left">a</ListCell>
          <ListCell align="right">b</ListCell>
        </ListItem>
      </List>
    );
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });
});
