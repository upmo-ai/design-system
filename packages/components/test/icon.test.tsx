import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { icons } from '@upmo-ai/icons';
import { Icon } from '../src/index.ts';
import { renderThemed } from './render.tsx';

describe('Icon', () => {
  it('resolves a Tabler-backed concept to an svg', () => {
    const { container } = renderThemed(<Icon concept="nav.tasks" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('resolves a caret-backed concept to the caret mark', () => {
    // status.working maps to "caret" in the concept map.
    expect(icons['status.working']).toBe('caret');
    const { container } = renderThemed(<Icon concept="status.working" />);
    expect(container.querySelector('.upmo-caret')).toBeTruthy();
  });

  it('resolves the knowledge source concept to the file-search glyph', () => {
    expect(icons['object.source']).toBe('file-search');
    const { container } = renderThemed(<Icon concept="object.source" />);
    expect(container.querySelector('svg.tabler-icon-file-search')).toBeTruthy();
  });

  it('applies an accessible label when given', () => {
    renderThemed(<Icon concept="action.send" aria-label="Send" />);
    expect(screen.getByLabelText('Send')).toBeInTheDocument();
  });

  it('renders every concept in the map without error', () => {
    for (const concept of Object.keys(icons) as (keyof typeof icons)[]) {
      const { container, unmount } = renderThemed(<Icon concept={concept} />);
      // Either a Tabler svg or the caret svg; never empty for our map.
      expect(container.querySelector('svg')).toBeTruthy();
      unmount();
    }
  });
});
