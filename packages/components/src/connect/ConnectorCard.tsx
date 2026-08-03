import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import clsx from 'clsx';
import { BrandMark } from '../brand/BrandMark.tsx';

export type ChangesPolicy = 'allow' | 'ask' | 'block';

const policyMeta: Record<ChangesPolicy, { label: string; color: string }> = {
  allow: { label: 'Allow', color: 'teal' },
  ask: { label: 'Ask first', color: 'yellow' },
  block: { label: 'Block', color: 'red' },
};

export interface ConnectorCardProps {
  /** The connector id (also the brand key), e.g. "github". */
  id: string;
  name: string;
  description?: string;
  /** What the connector can reach: everything, or a named set. */
  resourceScope: 'all' | 'these';
  /** The named resources when scope is "these". */
  resourceIds?: string[];
  /** The changes policy: what the connector may do, not just read. */
  changes: ChangesPolicy;
  onEdit?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

/**
 * ConnectorCard is a connected tool tile: the brand mark, name and description,
 * a "Connected" status, and the permission summary (what it can reach, and the
 * changes policy of Allow / Ask first / Block). Actions edit the permissions or
 * disconnect. A connector that exists is connected, so the status is implicit.
 */
export function ConnectorCard({
  id,
  name,
  description,
  resourceScope,
  resourceIds,
  changes,
  onEdit,
  onDisconnect,
  className,
}: ConnectorCardProps) {
  const policy = policyMeta[changes];

  return (
    <Card withBorder radius="lg" padding="md" className={clsx('upmo-connector-card', className)}>
      <Stack justify="space-between" h="100%" gap="md">
        <div>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <span className="upmo-connector-card__mark">
                <BrandMark brand={id} size={32} kind="connector" />
              </span>
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600}>{name}</Text>
                {description ? (
                  <Text size="xs" c="dimmed">
                    {description}
                  </Text>
                ) : null}
              </Stack>
            </Group>
            <Badge variant="light" color="teal" radius="xl">
              Connected
            </Badge>
          </Group>

          <Stack gap="xs" mt="md">
            <Group gap="xs">
              <Text size="xs" c="dimmed" w={110}>
                What it can reach
              </Text>
              <Badge variant="outline">{resourceScope === 'all' ? 'All' : 'Only these'}</Badge>
              {resourceScope === 'these'
                ? resourceIds?.map((r) => (
                    <Badge key={r} size="xs" variant="default">
                      {r}
                    </Badge>
                  ))
                : null}
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed" w={110}>
                Changes
              </Text>
              <Badge variant="light" color={policy.color}>
                {policy.label}
              </Badge>
            </Group>
          </Stack>
        </div>

        <Group justify="flex-end" gap="xs">
          {onEdit ? (
            <Button variant="default" leftSection={<IconSettings size={16} />} onClick={onEdit}>
              Edit permissions
            </Button>
          ) : null}
          {onDisconnect ? (
            <Button variant="subtle" color="red" onClick={onDisconnect}>
              Disconnect
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Card>
  );
}
