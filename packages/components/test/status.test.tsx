import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Caret,
  StatusBadge,
  StatusDot,
  attentionMeta,
  attentions,
  phaseMeta,
  phases,
  statusMeta,
} from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('status model', () => {
  it('maps every phase and attention state to a tone and a mark', () => {
    for (const p of phases) {
      const m = phaseMeta[p];
      expect(m.tone).toBeTruthy();
      expect(m.mark).toBeTruthy();
    }
    for (const a of attentions) {
      const m = attentionMeta[a];
      expect(m.tone).toBeTruthy();
      expect(m.mark).toBeTruthy();
    }
  });

  it('uses the live caret only for Working and Checking', () => {
    expect(phaseMeta.Working.mark).toBe('caret-live');
    expect(phaseMeta.Checking.mark).toBe('caret-live');
    expect(phaseMeta.Done.mark).toBe('icon');
    expect(phaseMeta.Failed.mark).toBe('icon');
  });

  it('assigns the agreed tones', () => {
    expect(phaseMeta.Working.tone).toBe('active');
    expect(phaseMeta.Done.tone).toBe('positive');
    expect(phaseMeta.Failed.tone).toBe('critical');
    expect(attentionMeta['Needs approval'].tone).toBe('attention');
    expect(attentionMeta.Paused.tone).toBe('neutral');
    expect(attentionMeta.Stopped.tone).toBe('critical');
  });

  it('throws on an unknown status', () => {
    // @ts-expect-error intentional bad input
    expect(() => statusMeta('Nope')).toThrow();
  });
});

describe('StatusBadge', () => {
  it('renders the status word for every phase and attention state', () => {
    for (const s of [...phases, ...attentions]) {
      const { unmount } = renderThemed(<StatusBadge status={s} />);
      expect(screen.getByText(s)).toBeInTheDocument();
      unmount();
    }
  });

  it('carries the tone class so colour comes from tokens, not Mantine palette', () => {
    const { container } = renderThemed(<StatusBadge status="Needs approval" />);
    const badge = container.querySelector('.upmo-status-badge') as HTMLElement;
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('upmo-tone-attention');
  });

  it('draws the live caret for Working', () => {
    const { container } = renderThemed(<StatusBadge status="Working" />);
    expect(container.querySelector('.upmo-caret--live')).toBeTruthy();
  });

  it('uses an icon, not a caret, for Done', () => {
    const { container } = renderThemed(<StatusBadge status="Done" />);
    expect(container.querySelector('.upmo-caret')).toBeFalsy();
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<StatusBadge status="Working" />, theme);
      expect(screen.getByText('Working')).toBeInTheDocument();
      unmount();
    }
  });
});

describe('StatusDot', () => {
  it('always carries an accessible label (a dot alone is colour-only)', () => {
    renderThemed(<StatusDot status="Working" />);
    expect(screen.getByRole('img', { name: 'Working' })).toBeInTheDocument();
  });

  it('accepts a fuller contextual label', () => {
    renderThemed(<StatusDot status="Working" label="Invoice sync: Working" />);
    expect(screen.getByRole('img', { name: 'Invoice sync: Working' })).toBeInTheDocument();
  });

  it('shows the live caret for active states and a filled dot otherwise', () => {
    const { container: active } = renderThemed(<StatusDot status="Working" />);
    expect(active.querySelector('.upmo-caret--live')).toBeTruthy();

    const { container: done } = renderThemed(<StatusDot status="Done" />);
    expect(done.querySelector('.upmo-status-dot--filled')).toBeTruthy();
  });
});

describe('Caret', () => {
  it('marks the live caret with the sweep class', () => {
    const { container } = renderThemed(<Caret mark="caret-live" />);
    expect(container.querySelector('.upmo-caret--live')).toBeTruthy();
    expect(container.querySelector('.upmo-caret__sweep')).toBeTruthy();
  });

  it('is decorative (aria-hidden), relying on the surrounding label', () => {
    const { container } = renderThemed(<Caret mark="caret-partial" />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
