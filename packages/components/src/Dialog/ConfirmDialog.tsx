import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';

export interface ConfirmDialogProps {
  /** Whether the dialog is open. */
  opened: boolean;
  /** The question, as a short title. */
  title: ReactNode;
  /** The consequence, in a sentence. */
  body: ReactNode;
  /** The confirm button label, naming the outcome (e.g. "Remove member"). */
  action: string;
  /** Called to dismiss without confirming. */
  onClose: () => void;
  /** Called when the user confirms. */
  onConfirm: () => void;
  /**
   * Mark the action destructive: the confirm button turns red. Default false.
   * Even so, the copy should name the consequence; colour is never the sole
   * signal. Prefer undo over confirm where the action is safely reversible.
   */
  destructive?: boolean;
  /** Disable the confirm button while a request runs. */
  busy?: boolean;
  /** Disable the confirm button for another reason (e.g. a required input). */
  confirmDisabled?: boolean;
  /** Extra content between the body and the actions (e.g. a confirm input). */
  children?: ReactNode;
}

/**
 * A yes/no confirmation. Asks before an action, with the consequence spelled
 * out in the body and the outcome named on the confirm button. Destructive
 * confirms turn the confirm button red and still name the consequence in copy.
 * Cancel is the safe default (a plain button); there is no close X, so the only
 * dismissals are Cancel, the scrim, and Escape.
 */
export function ConfirmDialog({
  opened,
  title,
  body,
  action,
  onClose,
  onConfirm,
  destructive,
  busy,
  confirmDisabled,
  children,
}: ConfirmDialogProps) {
  if (!opened) return null;
  return (
    <Modal opened onClose={onClose} title={title} withCloseButton={false}>
      <Stack gap="md">
        <Text>{body}</Text>
        {children}
        <Group gap="xs" justify="flex-end">
          <Button type="button" variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            color={destructive ? 'red' : undefined}
            disabled={busy || confirmDisabled}
            onClick={onConfirm}
          >
            {action}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
