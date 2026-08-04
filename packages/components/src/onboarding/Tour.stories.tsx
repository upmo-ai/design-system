import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tour } from './Tour.tsx';

const meta: Meta<typeof Tour> = {
  title: 'Onboarding/Tour',
  component: Tour,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Tour>;

export const Coachmark: Story = {
  render: () => {
    const [active, setActive] = useState(0);
    return (
      <div style={{ paddingTop: 40 }}>
        <Tour
          active={active}
          onActiveChange={setActive}
          onClose={() => {}}
          steps={[
            { title: 'This is the activity stream', body: 'Everything your agents do shows up here, live.' },
            { title: 'Approvals live here', body: 'When an agent needs a decision, it pauses and asks you.' },
            { title: 'Watch your budget', body: 'Each task shows its spend and pauses before the cap.' },
          ]}
        />
      </div>
    );
  },
};
