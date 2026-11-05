import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Text, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useState, type ReactNode } from 'react';
import { AppFrame, useAppFrame, type AppFrameProps } from './AppFrame.tsx';
import { NavItem, NavSection, SideNav } from './SideNav.tsx';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs.tsx';
import { Icon } from '../icon/Icon.tsx';
import { IconButton } from '../IconButton/IconButton.tsx';
import { Input } from '../Input/Input.tsx';
import { Menu } from '../Menu/Menu.tsx';
import { PageShell } from '../PageShell/PageShell.tsx';
import { Panel } from '../Panel/Panel.tsx';
import { StatusAlert } from '../StatusAlert/StatusAlert.tsx';
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

function Frame({
  defaultCollapsed,
  frameProps,
  content,
}: {
  defaultCollapsed?: boolean;
  frameProps?: Partial<AppFrameProps>;
  content?: ReactNode;
}) {
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
      {...frameProps}
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
      {content ?? (
        <PageShell header={{ title: page, description: 'Everything your workforce is doing right now.' }}>
          <Panel p="md">
            <Text size="sm" c="dimmed">
              Page content sits in the main region, inside a PageShell.
            </Text>
          </Panel>
        </PageShell>
      )}
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

/** Opens the navigation drawer, as a user does from the top bar toggle. */
function openDrawer({ canvasElement }: { canvasElement: HTMLElement }) {
  canvasElement.ownerDocument.querySelector<HTMLButtonElement>('button[aria-label="Open navigation"]')?.click();
}

/** Tablet width: the icon rail, with the toggle opening the full navigation as a drawer. */
export const Tablet: Story = {
  render: () => <Frame />,
  globals: { viewport: { value: 'tablet', isRotated: false } },
};

/** The drawer open at phone width: full viewport height, the whole navigation visible. */
export const PhoneDrawerOpen: Story = {
  render: () => <Frame />,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: openDrawer,
};

/** The drawer open at tablet width: full viewport height, the whole navigation visible. */
export const TabletDrawerOpen: Story = {
  render: () => <Frame />,
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: openDrawer,
};

/**
 * The app holds the drawer state, so a keyboard shortcut can open it. Press
 * Ctrl+B or Cmd+B: from md it collapses the rail, below md it toggles the
 * drawer. The shortcut belongs to the app; the frame only exposes the state.
 */
function ControlledDrawerFrame() {
  const theme = useMantineTheme();
  const wide = useMediaQuery(`(min-width: ${theme.breakpoints.md})`, true, { getInitialValueInEffect: false });
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'b' || !(event.metaKey || event.ctrlKey)) return;
      if (event.altKey || event.shiftKey || event.repeat || event.isComposing) return;
      // Firefox opens its bookmarks sidebar on Ctrl+B.
      event.preventDefault();
      if (wide) setCollapsed((value) => !value);
      else setDrawerOpened((value) => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wide]);

  return (
    <Frame
      frameProps={{ collapsed, onCollapsedChange: setCollapsed, drawerOpened, onDrawerOpenedChange: setDrawerOpened }}
      content={
        <PageShell header={{ title: 'Controlled drawer', description: 'Press Ctrl+B or Cmd+B to toggle the navigation.' }}>
          <Panel p="md">
            <Text size="sm" c="dimmed">
              Drawer {drawerOpened ? 'open' : 'closed'}, rail {collapsed ? 'collapsed' : 'expanded'}.
            </Text>
          </Panel>
        </PageShell>
      }
    />
  );
}

export const ControlledDrawer: Story = {
  render: () => <ControlledDrawerFrame />,
  globals: { viewport: { value: 'tablet', isRotated: false } },
};

/**
 * `fill` makes main a viewport-tall column without padding. The alert keeps its
 * height and the last child, the chat page, takes the rest. The page sets
 * `min-height: 0` and gives its thread `flex: 1 1 0`, so the thread scrolls
 * inside and the composer stays in view.
 */
export const FillMain: Story = {
  render: () => (
    <Frame
      frameProps={{ fill: true }}
      content={
        <>
          <StatusAlert tone="attention" title="Read only">
            This workspace is paused. Messages are not sent.
          </StatusAlert>
          <section aria-label="Messages" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: 'var(--space-4)' }}>
              {Array.from({ length: 30 }, (_, index) => (
                <Text key={index} size="sm" mb="xs">
                  Message {index + 1}
                </Text>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-3)' }}>
              <Text size="sm" c="dimmed">
                The composer sits at the bottom.
              </Text>
            </div>
          </section>
        </>
      }
    />
  ),
};
