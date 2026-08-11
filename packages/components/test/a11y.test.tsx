import { IconCheck, IconFolder } from '@tabler/icons-react';
import { act } from '@testing-library/react';
import axe from 'axe-core';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ApprovalCard,
  Button,
  Checkbox,
  Composer,
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
} from '../src/index.ts';
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
