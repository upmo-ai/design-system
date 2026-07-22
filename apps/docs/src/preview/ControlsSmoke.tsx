import { Group, Stack } from '@mantine/core';
import { IconCheck, IconCopy, IconDownload, IconPlayerPause, IconTrash } from '@tabler/icons-react';
import { Badge, Button, IconButton, Spinner } from '@upmo-ai/components';
import { Preview } from './Preview.tsx';

/**
 * Batch 1 controls, rendered live through the Upmo theme. Button, IconButton,
 * Badge and the conventional Spinner, in all three themes.
 */
export function ControlsSmoke() {
  return (
    <Preview label="Button, IconButton, Badge and Spinner from @upmo-ai/components. Switch themes to check all three.">
      <Stack gap="lg">
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

        <Group>
          <IconButton aria-label="Copy">
            <IconCopy size={18} />
          </IconButton>
          <IconButton aria-label="Download artifact" variant="default">
            <IconDownload size={18} />
          </IconButton>
          <IconButton aria-label="Delete" variant="subtle" color="red">
            <IconTrash size={18} />
          </IconButton>
        </Group>

        <Group>
          <Badge>Working</Badge>
          <Badge variant="outline">Preparing</Badge>
          <Badge variant="default">Queued</Badge>
          <Badge leftSection={<IconCheck size={12} />}>Done</Badge>
          <Spinner size="sm" />
        </Group>
      </Stack>
    </Preview>
  );
}
