import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Composer } from './Composer.tsx';

const meta: Meta<typeof Composer> = {
  title: 'Agent surfaces/Composer',
  component: Composer,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Composer>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [agent, setAgent] = useState('auto');
    const [route, setRoute] = useState('default');
    const [model, setModel] = useState('sonnet');
    const [tools, setTools] = useState('auto');
    return (
      <div style={{ maxWidth: 640 }}>
        <Composer
          value={value}
          onChange={setValue}
          onSend={() => setValue('')}
          onAttach={() => {}}
          onDictate={() => {}}
          config={{
            label: 'Agent, route and model',
            groups: [
              {
                label: 'Agent',
                value: agent,
                onChange: setAgent,
                options: [
                  { value: 'auto', label: 'Auto' },
                  { value: 'finance', label: 'Finance' },
                ],
              },
              {
                label: 'Route',
                value: route,
                onChange: setRoute,
                options: [
                  { value: 'default', label: 'Default' },
                  { value: 'fast', label: 'Fast' },
                ],
              },
              {
                label: 'Model',
                value: model,
                onChange: setModel,
                options: [
                  { value: 'sonnet', label: 'Claude Sonnet' },
                  { value: 'opus', label: 'Claude Opus' },
                ],
              },
            ],
          }}
          toolsMode={{
            value: tools,
            onChange: setTools,
            options: [
              { value: 'auto', label: 'Auto' },
              { value: 'all', label: 'All tools' },
              { value: 'search', label: 'Search only' },
              { value: 'off', label: 'Disabled' },
            ],
          }}
        />
      </div>
    );
  },
};

export const Minimal: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ maxWidth: 640 }}>
        <Composer value={value} onChange={setValue} onSend={() => setValue('')} />
      </div>
    );
  },
};
