import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Stack } from '@mantine/core';
import { Button } from './Button.tsx';

const meta: Meta<typeof Button> = {
  title: 'Controls/Button',
  component: Button,
  args: {
    children: 'Deploy agent',
    variant: 'filled',
    size: 'sm',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['filled', 'light', 'outline', 'default', 'subtle'],
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <Group>
      <Button {...args} variant="filled">
        Filled
      </Button>
      <Button {...args} variant="light">
        Light
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="default">
        Default
      </Button>
      <Button {...args} variant="subtle">
        Subtle
      </Button>
    </Group>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Group align="center">
      <Button {...args} size="xs">
        Extra small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </Group>
  ),
};

export const Destructive: Story = {
  render: (args) => (
    <Stack>
      <Button {...args} color="red" variant="filled">
        Delete workspace
      </Button>
      <Button {...args} color="red" variant="outline">
        Delete workspace
      </Button>
    </Stack>
  ),
};
