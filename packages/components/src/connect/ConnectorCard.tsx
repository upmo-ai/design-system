import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';
import { Button } from '../Button/Button.tsx';
import { Icon } from '../icon/Icon.tsx';
import { BrandMark } from '../brand/BrandMark.tsx';

export type ChangesPolicy = 'allow' | 'ask' | 'block';

const policyMeta: Record<ChangesPolicy, { label: string; color: string }> = {
  allow: { label: 'Allow', color: 'teal' },
  ask: { label: 'Ask first', color: 'yellow' },
  block: { label: 'Block', color: 'red' },
};

export interface ConnectorCardProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'children' | 'color'> {
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
}

/**
 * ConnectorCard is a connected tool tile: the brand mark, name and description,
 * a "Connected" status, and the permission summary (what it can reach, and the
 * changes policy of Allow / Ask first / Block). Actions edit the permissions or
 * disconnect. A connector that exists is connected, so the status is implicit.
 *
 * Layout: the card is built for a 320px grid cell (288px of content). The status
 * badge keeps its content width and never truncates; the title block gives up
 * space first and wraps. The actions are small buttons on one start-aligned row,
 * and wrap only when the card is too narrow for both.
 *
 * Any other prop (`data-*`, `aria-*`, `style`, event handlers) is a rest prop
 * and goes to the root `div`. Things to know:
 * - `id` is the connector id, not a DOM id; pass `data-id` or wrap the card if you
 *   need one.
 * - Do not spread a whole API object into the card (`<ConnectorCard {...item} />`):
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
  ...rest
}: ConnectorCardProps) {
  const policy = policyMeta[changes];

  return (
    <Card {...rest} withBorder radius="lg" padding="md" className={clsx('upmo-connector-card', className)}>
      <Stack justify="space-between" h="100%" gap="md">
        <div>
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
            <Group gap="sm" wrap="nowrap" className="upmo-card-head__identity">
              <span className="upmo-connector-card__mark">
                <BrandMark brand={id} size={32} kind="connector" />
              </span>
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600} className="upmo-card-head__text">
                  {name}
                </Text>
                {description ? (
                  <Text size="xs" c="dimmed" className="upmo-card-head__text">
                    {description}
                  </Text>
                ) : null}
              </Stack>
            </Group>
            <Badge variant="light" color="teal" radius="xl" className="upmo-card-head__status">
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

        <Group justify="flex-start" gap="xs" wrap="wrap" className="upmo-card-actions">
          {onEdit ? (
            <Button size="sm" variant="default" leftSection={<Icon concept="action.settings" size={16} />} onClick={onEdit}>
              Edit permissions
            </Button>
          ) : null}
          {onDisconnect ? (
            <Button size="sm" variant="subtle" color="red" leftSection={<Icon concept="action.disconnect" size={16} />} onClick={onDisconnect}>
              Disconnect
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Card>
  );
}
