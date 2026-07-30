import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group } from '@mantine/core';
import { Kbd, KbdGroup } from './Kbd.tsx';

const meta: Meta<typeof Kbd> = {
  title: 'Controls/Kbd',
  component: Kbd,
  args: { children: '⌘' },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Playground: Story = {};

export const Shortcuts: Story = {
  render: () => (
    <Group>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>⇧</Kbd>
        <Kbd>Enter</Kbd>
      </KbdGroup>
      <Kbd>Esc</Kbd>
    </Group>
  ),
};
