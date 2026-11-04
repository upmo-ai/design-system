import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { IconCpu } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';
import { Button } from '../Button/Button.tsx';
import { Icon } from '../icon/Icon.tsx';
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

export interface ProviderCardProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'children' | 'color'> {
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
}

/**
 * ProviderCard is a model-provider tile: the brand mark, name and adapter, a
 * status badge coloured by the provider state (Connected, Rate limited, Key
 * rejected, Offline), the plan kind, an optional endpoint, and the enabled
 * models. Unlike a connector, a provider carries an explicit status, so error
 * states (a rejected key, a rate limit) show on the same card layout.
 *
 * Any other prop (`data-*`, `aria-*`, `style`, event handlers) is a rest prop
 * and goes to the root `div`. Things to know:
 * - `id` is the provider id, not a DOM id; pass `data-id` or wrap the card if you
 *   need one.
 * - Do not spread a whole API object into the card (`<ProviderCard {...item} />`):
 *   fields the card does not know, such as `hidden`, `title` or `createdAt`,
 *   are forwarded to the DOM. They hide the card, show as a tooltip or raise
 *   React unknown-prop warnings. Pick the props you mean to pass.
 * - A click handler (`onClick`) on the card also receives clicks from the
 *   Edit and Disconnect buttons, because clicks bubble. Check `event.target`
 *   or call `event.stopPropagation()` in the button handlers if that matters.
 * - `aria-label` needs a `role` on a plain `div` (for example `role="group"`);
 *   without one it is not valid ARIA. Avoid `role="button"`, which would nest
 *   the card's buttons inside a button.
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
  ...rest
}: ProviderCardProps) {
  return (
    <Card {...rest} withBorder radius="lg" padding="md" className={clsx('upmo-provider-card', className)}>
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
            <Button variant="default" onClick={onEdit} leftSection={<Icon concept="action.edit" size={16} />}>
              Edit
            </Button>
          ) : null}
          {onDisconnect ? (
            <Button variant="subtle" color="red" onClick={onDisconnect} leftSection={<Icon concept="action.disconnect" size={16} />}>
              Disconnect
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Card>
  );
}
