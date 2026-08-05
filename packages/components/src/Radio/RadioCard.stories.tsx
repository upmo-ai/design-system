import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RadioCardGroup } from './RadioCard.tsx';

const meta: Meta<typeof RadioCardGroup> = {
  title: 'Forms/RadioCardGroup',
  component: RadioCardGroup,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof RadioCardGroup>;

export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = useState('yes');
    return (
      <RadioCardGroup
        label="Are you a student?"
        value={value}
        onChange={setValue}
        horizontal
        options={[
          { value: 'yes', label: 'Yes', description: "I'm currently enrolled at a post-secondary institution" },
          { value: 'no', label: 'No' },
        ]}
      />
    );
  },
};

export const Stacked: Story = {
  render: () => {
    const [value, setValue] = useState('ask');
    return (
      <div style={{ maxWidth: 440 }}>
        <RadioCardGroup
          label="Autonomy"
          value={value}
          onChange={setValue}
          options={[
            { value: 'ask', label: 'Ask before each action', description: 'The agent pauses for your approval on every step.' },
            { value: 'auto', label: 'Run automatically', description: 'Only pause for approvals you have configured.' },
            { value: 'off', label: 'Paused', description: 'The agent will not pick up new work.' },
          ]}
        />
      </div>
    );
  },
};
