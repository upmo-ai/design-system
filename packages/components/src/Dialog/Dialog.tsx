import { Modal, type ModalProps } from '@mantine/core';

export interface DialogProps extends ModalProps {}

/**
 * A modal dialog. A themed Mantine Modal (radius-lg, centered, scrim from the
 * overlay token). Use for focused tasks and confirmations. For a yes/no confirm,
 * prefer ConfirmDialog. The close button is named "Close" so it is never an
 * unlabelled icon control.
 */
export function Dialog({ closeButtonProps, ...props }: DialogProps) {
  return <Modal {...props} closeButtonProps={{ 'aria-label': 'Close', ...closeButtonProps }} />;
}
