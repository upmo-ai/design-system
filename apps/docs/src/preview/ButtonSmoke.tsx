import { Button, Group } from '@mantine/core';
import { IconCheck, IconPlayerPause } from '@tabler/icons-react';
import { Preview } from './Preview.tsx';

/**
 * Smoke test for the preview pipeline: real Mantine Buttons rendered through
 * upmoTheme, in all three themes. Proves tokens -> theme -> component -> live
 * preview works end to end, including the bright dark primary fill + hover glow.
 */
export function ButtonSmoke() {
  return (
    <Preview label="Mantine Button, themed by @upmo-ai/theme. Switch themes to see the dark primary fill and hover glow.">
      <Group>
        <Button leftSection={<IconCheck size={16} />}>Approve</Button>
        <Button variant="light">Follow up</Button>
        <Button variant="default" leftSection={<IconPlayerPause size={16} />}>
          Pause
        </Button>
        <Button variant="subtle">Cancel</Button>
        <Button color="red" variant="light">
          Stop
        </Button>
      </Group>
    </Preview>
  );
}
