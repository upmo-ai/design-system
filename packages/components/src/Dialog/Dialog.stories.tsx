import type { Meta, StoryObj } from '@storybook/react-vite';
import { useDisclosure } from '@mantine/hooks';
import { Group, Stack, Text } from '@mantine/core';
import { Dialog } from './Dialog.tsx';
import { Button } from '../Button/Button.tsx';

const meta: Meta<typeof Dialog> = {
  title: 'Compositions/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
      <>
        <Button onClick={open}>Open dialog</Button>
        <Dialog opened={opened} onClose={close} title="Rename agent">
          <Stack gap="md">
            <Text size="sm">A focused task in a modal. Use ConfirmDialog for a yes/no.</Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button onClick={close}>Save</Button>
            </Group>
          </Stack>
        </Dialog>
      </>
    );
  },
};

// A pre-opened variant so the modal is visible without interaction (useful for
// review and visual checks).
export const Opened: Story = {
  render: () => (
    <Dialog opened onClose={() => {}} title="Rename agent">
      <Stack gap="md">
        <Text size="sm">A focused task in a modal. Use ConfirmDialog for a yes/no.</Text>
        <Group justify="flex-end">
          <Button variant="default">Cancel</Button>
          <Button>Save</Button>
        </Group>
      </Stack>
    </Dialog>
  ),
};
