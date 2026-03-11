import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/utils';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders a search input', () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchInput value="hello" onChange={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toHaveValue('hello');
  });

  it('calls onChange with the new value when typed', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'foo' } });
    expect(onChange).toHaveBeenCalledWith('foo');
  });

  it('uses label prop as aria-label', () => {
    render(<SearchInput value="" onChange={vi.fn()} label="Filter projects" />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Filter projects');
  });

  it('falls back to placeholder for aria-label when no label provided', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search projects..." />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search projects...');
  });

  it('falls back to "Search" for aria-label when neither label nor placeholder provided', () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search');
  });

  it('renders the placeholder text', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});
