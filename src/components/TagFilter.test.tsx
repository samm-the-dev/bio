import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/utils';
import { TagFilter } from './TagFilter';

const tags = ['React', 'TypeScript', 'Node', 'Python', 'Go', 'Rust', 'Svelte', 'Vue'];

describe('TagFilter', () => {
  it('returns null when tags array is empty', () => {
    const { container } = render(<TagFilter tags={[]} activeTag={null} onTagChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all tags', () => {
    render(
      <TagFilter tags={['React', 'TypeScript', 'Node']} activeTag={null} onTagChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'TypeScript' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Node' })).toBeInTheDocument();
  });

  it('sets aria-pressed on active tag', () => {
    render(<TagFilter tags={['React', 'TypeScript']} activeTag="React" onTagChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'TypeScript' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onTagChange with tag name when inactive tag is clicked', () => {
    const onTagChange = vi.fn();
    render(<TagFilter tags={['React']} activeTag={null} onTagChange={onTagChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'React' }));
    expect(onTagChange).toHaveBeenCalledWith('React');
  });

  it('calls onTagChange with null when active tag is clicked (deselect)', () => {
    const onTagChange = vi.fn();
    render(<TagFilter tags={['React']} activeTag="React" onTagChange={onTagChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'React' }));
    expect(onTagChange).toHaveBeenCalledWith(null);
  });

  it('shows More button when tags exceed 3', () => {
    render(<TagFilter tags={tags} activeTag={null} onTagChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument();
  });

  it('does not show More button when tags are 3 or fewer', () => {
    render(
      <TagFilter tags={['React', 'TypeScript', 'Node']} activeTag={null} onTagChange={vi.fn()} />,
    );
    expect(screen.queryByRole('button', { name: /more/i })).not.toBeInTheDocument();
  });

  it('More button has aria-expanded=false initially', () => {
    render(<TagFilter tags={tags} activeTag={null} onTagChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /more/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles to Less button when More is clicked', () => {
    render(<TagFilter tags={tags} activeTag={null} onTagChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /more/i }));
    const lessBtn = screen.getByRole('button', { name: /less/i });
    expect(lessBtn).toBeInTheDocument();
    expect(lessBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapses back to More when Less is clicked', () => {
    render(<TagFilter tags={tags} activeTag={null} onTagChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /more/i }));
    fireEvent.click(screen.getByRole('button', { name: /less/i }));
    expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument();
  });
});
