import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Stack, Text } from '@mantine/core';
import { icons, type IconConcept } from '@upmo-ai/icons';
import { Icon } from './Icon.tsx';

const meta: Meta<typeof Icon> = {
  title: 'Foundations/Icon',
  component: Icon,
  args: { concept: 'nav.tasks', size: 22 },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Playground: Story = {};

const groups = ['nav', 'action', 'status', 'object'] as const;

export const Concepts: Story = {
  render: () => (
    <Stack gap="lg">
      {groups.map((g) => (
        <div key={g}>
          <Text fw={600} tt="capitalize" mb="xs">
            {g}
          </Text>
          <Group gap="lg">
            {(Object.keys(icons) as IconConcept[])
              .filter((c) => c.startsWith(`${g}.`))
              .map((c) => (
                <Stack key={c} align="center" gap={2} w={76}>
                  <Icon concept={c} size={22} />
                  <Text size="xs" c="dimmed" ta="center" style={{ wordBreak: 'break-all' }}>
                    {c.slice(g.length + 1)}
                  </Text>
                </Stack>
              ))}
          </Group>
        </div>
      ))}
    </Stack>
  ),
};
