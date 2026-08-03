import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconCpu } from '@tabler/icons-react';
import clsx from 'clsx';
import { BrandMark } from '../brand/BrandMark.tsx';

export type ProviderStatus =
  | 'Connected'
  | 'Not connected'
  | 'Rate limited'
  | 'Key rejected'
  | 'Offline';

export type ProviderPlan = 'metered' | 'subscription' | 'local';

const statusColor: Record<ProviderStatus, string> = {
  Connected: 'teal',
  'Not connected': 'gray',
  'Rate limited': 'yellow',
  'Key rejected': 'red',
  Offline: 'gray',
};

export interface ProviderCardProps {
  /** The provider id (also the brand key), e.g. "anthropic". */
  id: string;
  /** The brand key if different from the id. Defaults to the id. */
  brand?: string;
  name: string;
  /** The adapter label, e.g. "Anthropic (Claude)". */
  adapter?: string;
  status: ProviderStatus;
  planKind: ProviderPlan;
  /** Optional custom endpoint, shown in monospace. */
  baseUrl?: string;
  /** The enabled model ids. */
  models?: string[];
  onEdit?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

/**
 * ProviderCard is a model-provider tile: the brand mark, name and adapter, a
 * status badge coloured by the provider state (Connected, Rate limited, Key
 * rejected, Offline), the plan kind, an optional endpoint, and the enabled
 * models. Unlike a connector, a provider carries an explicit status, so error
 * states (a rejected key, a rate limit) show on the same card layout.
 */
export function ProviderCard({
  id,
  brand,
  name,
  adapter,
  status,
  planKind,
  baseUrl,
  models,
  onEdit,
  onDisconnect,
  className,
}: ProviderCardProps) {
  return (
    <Card withBorder radius="lg" padding="md" className={clsx('upmo-provider-card', className)}>
      <Stack justify="space-between" h="100%" gap="md">
        <div>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <span className="upmo-provider-card__mark">
                <BrandMark brand={brand ?? id} size={32} kind="provider" />
              </span>
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600}>{name}</Text>
                {adapter ? (
                  <Text size="xs" c="dimmed">
                    {adapter}
                  </Text>
                ) : null}
              </Stack>
            </Group>
            <Badge variant="light" color={statusColor[status]}>
              {status}
            </Badge>
          </Group>

          <Stack gap="xs" mt="md">
            <Group gap="xs">
              <Text size="xs" c="dimmed" w={80}>
                Plan
              </Text>
              <Badge variant="outline">{planKind}</Badge>
            </Group>
            {baseUrl ? (
              <Group gap="xs">
                <Text size="xs" c="dimmed" w={80}>
                  Endpoint
                </Text>
                <Text size="xs" ff="monospace">
                  {baseUrl}
                </Text>
              </Group>
            ) : null}
            {models && models.length > 0 ? (
              <Group gap={4}>
                {models.map((m) => (
                  <Badge key={m} size="xs" variant="default" leftSection={<IconCpu size={11} />}>
                    {m}
                  </Badge>
                ))}
              </Group>
            ) : null}
          </Stack>
        </div>

        <Group justify="flex-end" gap="xs">
          {onEdit ? (
            <Button variant="default" onClick={onEdit}>
              Edit
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
