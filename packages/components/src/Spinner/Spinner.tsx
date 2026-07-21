import { Loader, type LoaderProps } from '@mantine/core';

export interface SpinnerProps extends LoaderProps {
  /**
   * Accessible label announced to assistive tech. Defaults to "Loading". The
   * Loader is otherwise silent, so a label keeps the state honest.
   */
  label?: string;
}

/**
 * A conventional loading spinner. Deliberately NOT the caret: the caret is the
 * brand and liveness signature reserved for agent-liveness surfaces (see
 * StatusBadge), so a generic "waiting" state uses a familiar spinner instead.
 * Wraps Mantine Loader, themed to the emerald primary by the Upmo theme.
 */
export function Spinner({ label = 'Loading', ...rest }: SpinnerProps) {
  return <Loader aria-label={label} {...rest} />;
}
