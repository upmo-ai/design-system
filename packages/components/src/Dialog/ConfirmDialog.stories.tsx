import type { Meta, StoryObj } from '@storybook/react-vite';
import { useDisclosure } from '@mantine/hooks';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { Button } from '../Button/Button.tsx';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Compositions/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Confirm: Story = {
  render: () => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
      <>
        <Button variant="default" onClick={open}>
          Pause agent
        </Button>
        <ConfirmDialog
          opened={opened}
          onClose={close}
          onConfirm={close}
          title="Pause this agent?"
          body="It will stop picking up new work until you resume it. Work in progress finishes first."
          action="Pause agent"
        />
      </>
    );
  },
};

export const Destructive: Story = {
  render: () => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
      <>
        <Button color="red" onClick={open}>
          Delete workspace
        </Button>
        <ConfirmDialog
          destructive
          opened={opened}
          onClose={close}
          onConfirm={close}
          title="Delete this workspace?"
          body="This permanently removes the workspace, its agents, and their run history. This cannot be undone."
          action="Delete workspace"
        />
      </>
    );
  },
};
