import { ActionIcon, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import clsx from 'clsx';

export interface CopyButtonProps {
  /** The text to copy. */
  value: string;
  /** Accessible label for the idle state. Default "Copy". */
  label?: string;
  /** Label shown (as tooltip and aria) once copied. Default "Copied". */
  copiedLabel?: string;
  /** How long the copied state lasts, ms. Default 1200. */
  timeout?: number;
  size?: number;
  className?: string;
}

/**
 * An icon button that copies text to the clipboard and confirms with a brief
 * "Copied" state (tooltip + check icon). Fills a gap the product has today
 * (plain copy with no feedback). Honest, reversible, quiet.
 */
export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  timeout = 1200,
  size = 18,
  className,
}: CopyButtonProps) {
  const clipboard = useClipboard({ timeout });
  const current = clipboard.copied ? copiedLabel : label;

  return (
    <Tooltip label={current} position="bottom" openDelay={clipboard.copied ? 0 : 400} withinPortal>
      <ActionIcon
        variant="subtle"
        aria-label={current}
        onClick={() => clipboard.copy(value)}
        className={clsx('upmo-icon-button', className)}
      >
        {clipboard.copied ? <IconCheck size={size} stroke={2.2} /> : <IconCopy size={size} stroke={1.75} />}
      </ActionIcon>
    </Tooltip>
  );
}
