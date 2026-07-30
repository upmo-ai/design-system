import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { Field } from './Field.tsx';

const meta: Meta<typeof Field> = {
  title: 'Forms/Field',
  component: Field,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Field>;

// Field wraps NATIVE or custom controls via a render prop that supplies the
// aria wiring. Mantine inputs implement their own anatomy, so Field is for the
// cases Mantine does not cover.
export const NativeControl: Story = {
  render: () => (
    <Stack maw={360}>
      <Field label="API endpoint" description="Where requests are sent.">
        {(props) => <input {...props} className="upmo-input" placeholder="https://api.example.com" />}
      </Field>
    </Stack>
  ),
};

export const Optional: Story = {
  render: () => (
    <Field label="Display name" optional description="Required is the default; this one is optional.">
      {(props) => <input {...props} className="upmo-input" />}
    </Field>
  ),
};

export const Errored: Story = {
  render: () => (
    <Field label="Token" error="This token has expired.">
      {(props) => <input {...props} className="upmo-input" defaultValue="sk-expired" />}
    </Field>
  ),
};
