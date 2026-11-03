import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DateInput } from './DateInput.tsx';

// Mantine 9 dates are `YYYY-MM-DD` strings: onChange gives one (or null when
// cleared), and value, defaultValue, minDate and maxDate take one (a Date is
// also accepted).
const inDays = (n: number) => dayjs().add(n, 'day').format('YYYY-MM-DD');

const meta: Meta<typeof DateInput> = {
  title: 'Forms/DateInput',
  component: DateInput,
  args: {
    label: 'Expiry',
    description: 'Tokens stop working at the end of this day.',
    placeholder: '15 Jan 2027',
    minDate: inDays(0),
    maxDate: inDays(365),
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

export const Playground: Story = {};

export const Controlled: Story = {
  render: function Controlled(args) {
    const [expiry, setExpiry] = useState<string | null>(inDays(30));
    return (
      <Stack maw={360}>
        <DateInput {...args} clearable value={expiry} onChange={setExpiry} />
        <Text size="sm" c="dimmed">
          value: {expiry === null ? 'null' : `"${expiry}"`}
        </Text>
      </Stack>
    );
  },
};

const states: Story['render'] = (args) => (
  <Stack maw={360}>
    <DateInput {...args} />
    <DateInput {...args} optional description={undefined} />
    <DateInput {...args} error="Pick a date within the next year." />
    <DateInput {...args} disabled defaultValue={inDays(30)} />
  </Stack>
);

export const States: Story = { render: states };
export const Dark: Story = { render: states, globals: { theme: 'dark' } };
export const HighContrast: Story = { render: states, globals: { theme: 'hc' } };
