import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Kbd, KbdGroup, SegmentedControl, Tabs, Tooltip } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('Tabs', () => {
  it('renders tabs and shows the active panel', () => {
    renderThemed(
      <Tabs defaultValue="chat">
        <Tabs.List>
          <Tabs.Tab value="chat">Chat</Tabs.Tab>
          <Tabs.Tab value="runs">Runs</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="chat">Chat panel</Tabs.Panel>
        <Tabs.Panel value="runs">Runs panel</Tabs.Panel>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'Chat' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Runs' })).toBeInTheDocument();
    expect(screen.getByText('Chat panel')).toBeVisible();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(
        <Tabs defaultValue="a">
          <Tabs.List>
            <Tabs.Tab value="a">A</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">Panel</Tabs.Panel>
        </Tabs>,
        theme,
      );
      expect(screen.getByRole('tab', { name: 'A' })).toBeInTheDocument();
      unmount();
    }
  });
});

describe('SegmentedControl', () => {
  it('renders its options', () => {
    renderThemed(
      <SegmentedControl
        data={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
        defaultValue="light"
      />,
    );
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });
});

describe('Tooltip', () => {
  it('renders its target', () => {
    renderThemed(
      <Tooltip label="More info">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });
});

describe('Kbd', () => {
  it('renders a non-interactive key cap', () => {
    const { container } = renderThemed(<Kbd>Esc</Kbd>);
    const kbd = container.querySelector('kbd');
    expect(kbd).toBeTruthy();
    expect(kbd).toHaveTextContent('Esc');
    expect(kbd?.className).toContain('upmo-kbd');
  });

  it('groups keys without a plus sign', () => {
    const { container } = renderThemed(
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );
    const group = container.querySelector('.upmo-kbd-group');
    expect(group?.querySelectorAll('kbd').length).toBe(2);
    expect(group?.textContent).not.toContain('+');
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { container, unmount } = renderThemed(<Kbd>K</Kbd>, theme);
      expect(container.querySelector('kbd')).toBeTruthy();
      unmount();
    }
  });
});
