import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Composer, type ComposerConfigMenu } from './Composer.tsx';

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

export const Streaming: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [streaming, setStreaming] = useState(true);
    return (
      <div style={{ maxWidth: 640 }}>
        <Composer
          value={value}
          onChange={setValue}
          onSend={() => {
            setValue('');
            setStreaming(true);
          }}
          streaming={streaming}
          onStop={() => setStreaming(false)}
        />
      </div>
    );
  },
};

const described = (state: {
  agent: [string, (v: string) => void];
  route: [string, (v: string) => void];
  model: [string, (v: string) => void];
}): ComposerConfigMenu => ({
  label: 'Agent, route and model',
  groups: [
    {
      label: 'Agent',
      value: state.agent[0],
      onChange: state.agent[1],
      options: [
        { value: 'auto', label: 'Auto', description: 'Picks the agent that fits the task.' },
        { value: 'finance', label: 'Finance', description: 'Invoices, refunds and reconciliation.' },
      ],
    },
    {
      label: 'Route',
      value: state.route[0],
      onChange: state.route[1],
      options: [
        { value: 'default', label: 'Default', description: 'Balanced speed and depth.' },
        { value: 'fast', label: 'Fast', description: 'Answers sooner, with less depth.' },
      ],
    },
    {
      label: 'Model',
      value: state.model[0],
      onChange: state.model[1],
      options: [
        { value: 'sonnet', label: 'Claude Sonnet', description: 'Everyday work.' },
        { value: 'opus', label: 'Claude Opus', description: 'Hard problems and long documents.' },
      ],
    },
  ],
});

function DescribedComposer({ width, toolbar }: { width: number; toolbar?: 'auto' | 'full' | 'compact' }) {
  const [value, setValue] = useState('');
  const agent = useState('auto');
  const route = useState('default');
  const model = useState('sonnet');
  const [tools, setTools] = useState('auto');
  return (
    <div style={{ maxWidth: width }}>
      <Composer
        value={value}
        onChange={setValue}
        onSend={() => setValue('')}
        onAttach={() => {}}
        onDictate={() => {}}
        toolbar={toolbar}
        config={described({ agent, route, model })}
        toolsMode={{
          value: tools,
          onChange: setTools,
          options: [
            { value: 'auto', label: 'Auto', description: 'Use tools when they help.' },
            { value: 'all', label: 'All tools' },
            { value: 'search', label: 'Search only' },
            { value: 'off', label: 'Disabled' },
          ],
        }}
      />
    </div>
  );
}

/** Each option carries a description, and each group shows its current value. Open the config pill. */
export const WithDescriptions: Story = {
  render: () => <DescribedComposer width={640} />,
};

/** At phone width the toolbar goes compact on its own: the config pill shows the model. */
export const Narrow: Story = {
  render: () => <DescribedComposer width={640} />,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};

/** `toolbar="compact"` at any width. The pill's accessible name still lists the full selection. */
export const Compact: Story = {
  render: () => <DescribedComposer width={640} toolbar="compact" />,
};
