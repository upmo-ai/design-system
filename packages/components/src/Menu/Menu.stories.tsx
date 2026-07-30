import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconCopy, IconPencil, IconPlayerPause, IconTrash } from '@tabler/icons-react';
import { Menu } from './Menu.tsx';
import { Button } from '../Button/Button.tsx';

const meta: Meta<typeof Menu> = {
  title: 'Compositions/Menu',
  component: Menu,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  render: () => (
    <Menu>
      <Menu.Target>
        <Button variant="default">Actions</Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Agent</Menu.Label>
        <Menu.Item leftSection={<IconPencil size={16} />}>Rename</Menu.Item>
        <Menu.Item leftSection={<IconCopy size={16} />}>Duplicate</Menu.Item>
        <Menu.Item leftSection={<IconPlayerPause size={16} />}>Pause</Menu.Item>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconTrash size={16} />}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ),
};
