import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Text, UnstyledButton } from '@mantine/core';
import { useState } from 'react';
import { AppFrame, useAppFrame } from './AppFrame.tsx';
import { NavItem, NavSection, SideNav } from './SideNav.tsx';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs.tsx';
import { Icon } from '../icon/Icon.tsx';
import { IconButton } from '../IconButton/IconButton.tsx';
import { Input } from '../Input/Input.tsx';
import { Menu } from '../Menu/Menu.tsx';
import { PageShell } from '../PageShell/PageShell.tsx';
import { Panel } from '../Panel/Panel.tsx';
import { StatusBadge } from '../status/StatusBadge.tsx';
import { Wordmark } from '../Wordmark/Wordmark.tsx';

const meta: Meta<typeof AppFrame> = {
  title: 'Compositions/AppFrame',
  component: AppFrame,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AppFrame>;

function Brand() {
  const { rail } = useAppFrame();
  return (
    <Group gap="xs" wrap="nowrap">
      <Wordmark compact={rail} height={rail ? 22 : 20} />
      {rail ? null : (
        <Text size="sm" c="dimmed" truncate>
          Acme production
        </Text>
      )}
    </Group>
  );
}

function Account() {
  const { rail } = useAppFrame();
  return (
    <Menu position={rail ? 'right-end' : 'top-start'} width={220}>
      <Menu.Target>
        {rail ? (
          <IconButton aria-label="Account: Ada Lovelace" tooltipPosition="right" size="lg">
            <Icon concept="object.user" />
          </IconButton>
        ) : (
          <UnstyledButton aria-label="Account: Ada Lovelace" style={{ padding: 'var(--space-1) var(--space-2)' }}>
            <Group gap="xs" wrap="nowrap">
              <Icon concept="object.user" />
              <Text size="sm" fw={600}>
                Ada Lovelace
              </Text>
            </Group>
          </UnstyledButton>
        )}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<Icon concept="object.key" size={16} />}>API tokens</Menu.Item>
        <Menu.Item leftSection={<Icon concept="action.sign_out" size={16} />}>Log out</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function Frame({ defaultCollapsed }: { defaultCollapsed?: boolean }) {
  const [page, setPage] = useState('Tasks');
  const item = (label: string, concept: Parameters<typeof Icon>[0]['concept'], extra = {}) => (
    <NavItem
      label={label}
      icon={<Icon concept={concept} />}
      href="#"
      active={page === label}
      onClick={(event) => {
        event.preventDefault();
        setPage(label);
      }}
      {...extra}
    />
  );
  return (
    <AppFrame
      defaultCollapsed={defaultCollapsed}
      header={<Brand />}
      footer={<Account />}
      topBar={
        <Group justify="space-between" w="100%" wrap="nowrap">
          <Breadcrumbs items={[{ label: 'Workspace', href: '#' }, { label: page }]} />
          <Group gap="xs" wrap="nowrap">
            <Input aria-label="Search" placeholder="Search" leftSection={<Icon concept="nav.search" size={16} />} />
            <IconButton aria-label="Notifications" size="lg">
              <Icon concept="nav.notifications" />
            </IconButton>
          </Group>
        </Group>
      }
      navigation={
        <SideNav>
          <NavSection>
            {item('Home', 'nav.home')}
            {item('Chat', 'nav.chats')}
            {item('Tasks', 'nav.tasks', { count: 3 })}
            {item('Automations', 'nav.automations')}
            {item('Knowledge', 'nav.knowledge', { badge: <StatusBadge status="Working" /> })}
          </NavSection>
          <NavSection label="Workspace">
            {item('Providers', 'object.provider')}
            {item('Connectors', 'object.connector')}
            <NavItem label="Management" icon={<Icon concept="nav.settings" />} defaultOpened>
              {item('Members', 'object.user')}
              {item('Teams', 'object.team')}
            </NavItem>
          </NavSection>
        </SideNav>
      }
    >
      <PageShell header={{ title: page, description: 'Everything your workforce is doing right now.' }}>
        <Panel p="md">
          <Text size="sm" c="dimmed">
            Page content sits in the main region, inside a PageShell.
          </Text>
        </Panel>
      </PageShell>
    </AppFrame>
  );
}

export const Default: Story = { render: () => <Frame /> };
export const Rail: Story = { render: () => <Frame defaultCollapsed /> };
export const Dark: Story = { render: () => <Frame />, globals: { theme: 'dark' } };
export const HighContrast: Story = { render: () => <Frame />, globals: { theme: 'hc' } };
export const Phone: Story = {
  render: () => <Frame />,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
