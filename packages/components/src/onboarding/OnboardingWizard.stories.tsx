import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { OnboardingWizard } from './OnboardingWizard.tsx';

const meta: Meta<typeof OnboardingWizard> = {
  title: 'Onboarding/OnboardingWizard',
  component: OnboardingWizard,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof OnboardingWizard>;

export const Flow: Story = {
  render: () => {
    const [active, setActive] = useState(0);
    return (
      <OnboardingWizard
        active={active}
        onActiveChange={setActive}
        onSkip={() => {}}
        onFinish={() => {}}
        steps={[
          { title: 'Welcome to Upmo', description: 'A control room for an always-on AI workforce you own.' },
          { title: 'Connect a provider', description: 'Bring your own model keys; your data stays yours.' },
          { title: 'Deploy an agent', description: 'Give it a goal and a budget, then watch it work.' },
        ]}
      />
    );
  },
};
