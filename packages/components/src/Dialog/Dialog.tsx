import { Modal, type ModalProps } from '@mantine/core';

export interface DialogProps extends ModalProps {}

/**
 * A modal dialog. A themed Mantine Modal (radius-lg, centered, scrim from the
 * overlay token). Use for focused tasks and confirmations. For a yes/no confirm,
 * prefer ConfirmDialog.
 */
export function Dialog(props: DialogProps) {
  return <Modal {...props} />;
}
