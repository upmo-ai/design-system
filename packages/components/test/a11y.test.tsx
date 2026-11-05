import { IconCheck, IconFolder } from '@tabler/icons-react';
import { act, fireEvent, screen } from '@testing-library/react';
import axe from 'axe-core';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApprovalCard,
  Button,
  Checkbox,
  Composer,
  DataTable,
  Dialog,
  EmptyState,
  EventStream,
  Field,
  IconButton,
  Input,
  Select,
  StatusBadge,
  Switch,
  Table,
  Tabs,
  AppFrame,
  SideNav,
  NavSection,
  NavItem,
  StatusAlert,
  Wordmark,
} from '../src/index.ts';
import { DateInput } from '../src/dates.ts';
import { renderThemed } from './render.tsx';

// jsdom has no layout or paint, so axe cannot judge colour contrast (the token
// contrast tests cover it). Isolated fragments sit outside any landmark, so the
// page-level region rule does not apply either.
const options: axe.RunOptions = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
};

// A failed assertion must not leave a matchMedia stub behind for later tests.
afterEach(() => vi.restoreAllMocks());

/** Render into the Upmo theme and return axe violations as readable lines. */
async function violations(ui: ReactElement) {
  // baseElement (document.body) so portaled content like Dialog is scanned too.
  const { baseElement } = renderThemed(ui);
  // Inside act so Mantine's async Popover setup (Select) settles without warnings.
  const results = await act(() => axe.run(baseElement, options));
  return results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
  );
}

const cases: [string, ReactElement][] = [
  ['Button', <Button>Save</Button>],
  [
    'IconButton',
    <IconButton aria-label="Confirm">
      <IconCheck />
    </IconButton>,
  ],
  ['Input via Field', <Field label="API key">{(props) => <Input {...props} />}</Field>],
  [
    'Select',
    <Select
      label="Plan kind"
      data={[
        { value: 'metered', label: 'Metered' },
        { value: 'subscription', label: 'Subscription' },
      ]}
    />,
  ],
  ['Checkbox', <Checkbox label="Active" />],
  ['Switch', <Switch label="Follow live" />],
  [
    'Tabs',
    <Tabs defaultValue="chat">
      <Tabs.List>
        <Tabs.Tab value="chat">Chat</Tabs.Tab>
        <Tabs.Tab value="runs">Runs</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="chat">Chat panel</Tabs.Panel>
      <Tabs.Panel value="runs">Runs panel</Tabs.Panel>
    </Tabs>,
  ],
  ['StatusBadge', <StatusBadge status="Working" />],
  [
    'EmptyState',
    <EmptyState
      icon={<IconFolder />}
      title="No connectors yet"
      description="Connect a tool to let agents act."
      action={<Button>Connect</Button>}
    />,
  ],
  [
    'Table',
    <Table aria-label="Runs">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Run</Table.Th>
          <Table.Th>Id</Table.Th>
          <Table.Th>Cost</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>Invoice sync</Table.Td>
          <Table.Mono>run_abc</Table.Mono>
          <Table.Num>$0.21</Table.Num>
        </Table.Tr>
      </Table.Tbody>
    </Table>,
  ],
  [
    'EventStream',
    <EventStream
      label="Run activity"
      following
      events={[
        { id: '1', time: '08:01:02', status: 'Planning', message: 'Drafted a plan.' },
        { id: '2', time: '08:01:09', status: 'Working', message: 'Fetched 142 invoices.', live: true },
      ]}
    />,
  ],
  ['ApprovalCard', <ApprovalCard action="Send the digest" onApprove={() => {}} onDeny={() => {}} />],
  ['Composer', <Composer value="hello" onChange={() => {}} onSend={() => {}} />],
  [
    'StatusAlert',
    <StatusAlert tone="critical" title="Key rejected" onDismiss={() => {}} actions={<Button size="xs">Replace key</Button>}>
      Anthropic answered 401.
    </StatusAlert>,
  ],
  ['Wordmark', <Wordmark />],
  ['DateInput', <DateInput label="Expiry" optional description="Europe/London" />],
  ['DateInput with an error', <DateInput label="Expiry" error="Pick a date within the next year." />],
  [
    'decorative Wordmark in a named link',
    <a href="/">
      <Wordmark decorative />
      <span>Home</span>
    </a>,
  ],
];

describe('accessibility (axe)', () => {
  for (const [name, ui] of cases) {
    it(`${name} has no axe violations`, async () => {
      expect(await violations(ui)).toEqual([]);
    });
  }

  it('Dialog (open) has no axe violations', async () => {
    const ui = (
      <Dialog opened onClose={() => {}} title="Share task">
        <p>Anyone with the link can view this task.</p>
      </Dialog>
    );
    expect(await violations(ui)).toEqual([]);
  });
});

describe('accessibility (axe): AppFrame', () => {
  const frame = (defaultCollapsed?: boolean, membersActive?: boolean) => (
    <AppFrame
      defaultCollapsed={defaultCollapsed}
      header={<Wordmark compact={defaultCollapsed} />}
      footer={<Button size="xs">Account</Button>}
      topBar={<span>Search</span>}
      navigation={
        <SideNav>
          <NavSection>
            <NavItem label="Home" icon={<IconFolder />} href="/" />
            <NavItem label="Tasks" icon={<IconFolder />} href="/tasks" active count={2} />
          </NavSection>
          <NavSection label="Workspace">
            <NavItem label="Management" icon={<IconFolder />} defaultOpened>
              <NavItem label="Members" href="/admin/members" active={membersActive} />
            </NavItem>
          </NavSection>
        </SideNav>
      }
    >
      <h1>Tasks</h1>
    </AppFrame>
  );

  // The setup stub answers every media query with false (phone width); these
  // cases answer for the width they test, so the navigation is scanned.
  function atWidth(matches: (query: string) => boolean) {
    const original = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({ ...original(query), matches: matches(query) }));
  }

  async function scan(rules: axe.RunOptions['rules'] = {}) {
    const results = await act(() => axe.run(document.body, { rules: { ...options.rules, ...rules } }));
    return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
  }

  it('full sidebar has no axe violations', async () => {
    atWidth(() => true);
    renderThemed(frame());
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(await scan()).toEqual([]);
  });

  it('icon rail with an open flyout has no axe violations', async () => {
    atWidth(() => true);
    renderThemed(frame(true));
    fireEvent.click(screen.getByRole('button', { name: /Management/ }));
    await screen.findByRole('menuitem', { name: 'Members' });
    // Every open Mantine Menu fails aria-required-children under jsdom: its
    // focus sentinel (role="presentation" with tabindex) reads as a focusable
    // non-item child. A plain Mantine Menu fails the same way, so the rule is
    // off for this scan only; the items themselves are menuitems.
    expect(await scan({ 'aria-required-children': { enabled: false } })).toEqual([]);
  });

  // aria-current is a global attribute in ARIA 1.2, so it is allowed on a
  // menuitem; axe's aria-allowed-attr rule checks exactly that.
  it('icon rail flyout with the current page in it has no axe violations', async () => {
    atWidth(() => true);
    renderThemed(frame(true, true));
    fireEvent.click(screen.getByRole('button', { name: /Management/ }));
    const members = await screen.findByRole('menuitem', { name: 'Members' });
    expect(members).toHaveAttribute('aria-current', 'page');
    expect(await scan({ 'aria-required-children': { enabled: false } })).toEqual([]);
  });

  it('open drawer over the rail has no axe violations', async () => {
    atWidth((query) => !query.includes('62em'));
    renderThemed(frame());
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    await screen.findByRole('dialog');
    expect(await scan()).toEqual([]);
  });
});

describe('accessibility (axe): AppFrame controlled drawer and fill', () => {
  const navigation = (
    <SideNav>
      <NavSection>
        <NavItem label="Home" icon={<IconFolder />} href="/" />
        <NavItem label="Tasks" icon={<IconFolder />} href="/tasks" active />
      </NavSection>
    </SideNav>
  );

  async function scan() {
    const results = await act(() => axe.run(document.body, options));
    return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
  }

  it('controlled drawer open over the rail has no axe violations', async () => {
    const original = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      ...original(query),
      matches: !query.includes('62em'),
    }));
    renderThemed(
      <AppFrame drawerOpened onDrawerOpenedChange={() => {}} header={<Wordmark />} navigation={navigation}>
        <h1>Tasks</h1>
      </AppFrame>,
    );
    await screen.findByRole('dialog', { name: 'Navigation' });
    expect(await scan()).toEqual([]);
  });

  it('fill frame has no axe violations', async () => {
    const original = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({ ...original(query), matches: true }));
    renderThemed(
      <AppFrame fill mainClassName="page" header={<Wordmark />} navigation={navigation}>
        <h1>Chat</h1>
        <section aria-label="Messages">Messages</section>
      </AppFrame>,
    );
    expect(await scan()).toEqual([]);
  });
});

describe('accessibility (axe): DataTable name and Composer details', () => {
  const rows = [{ id: 'run_1', agent: 'Invoice sync' }];
  const columns = [
    { key: 'id', header: 'Run', render: (r: (typeof rows)[number]) => r.id, mono: true },
    { key: 'agent', header: 'Agent', render: (r: (typeof rows)[number]) => r.agent },
  ];

  it('DataTable with a caption has no axe violations', async () => {
    expect(await violations(<DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption="Recent runs" />)).toEqual(
      [],
    );
  });

  it('DataTable with aria-label and minWidth has no axe violations', async () => {
    expect(
      await violations(
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} aria-label="Recent runs" minWidth={320} />,
      ),
    ).toEqual([]);
  });

  it('compact Composer with an open menu of described options has no axe violations', async () => {
    renderThemed(
      <Composer
        value=""
        onChange={() => {}}
        onSend={() => {}}
        toolbar="compact"
        onAttach={() => {}}
        config={{
          label: 'Agent, route and model',
          groups: [
            {
              label: 'Agent',
              value: 'auto',
              onChange: () => {},
              options: [{ value: 'auto', label: 'Auto', description: 'Pick the agent for the task.' }],
            },
            { label: 'Model', value: 'fast', onChange: () => {}, options: [{ value: 'fast', label: 'Fast' }] },
          ],
        }}
        toolsMode={{
          value: 'auto',
          onChange: () => {},
          options: [{ value: 'auto', label: 'Auto', description: 'Use tools when they help.' }],
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tools mode: Auto' }));
    await screen.findByRole('menuitemradio', { name: 'Auto' });
    // An open Mantine Menu fails aria-required-children under jsdom (see the
    // AppFrame flyout cases above); the items themselves are menu items.
    const results = await act(() =>
      axe.run(document.body, { rules: { ...options.rules, 'aria-required-children': { enabled: false } } }),
    );
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
