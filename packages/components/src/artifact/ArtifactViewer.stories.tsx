import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArtifactViewer, type Artifact } from './ArtifactViewer.tsx';

const meta: Meta<typeof ArtifactViewer> = {
  title: 'Agent surfaces/ArtifactViewer',
  component: ArtifactViewer,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ArtifactViewer>;

const artifacts: Artifact[] = [
  {
    id: 'summary',
    name: 'summary.md',
    kind: 'markdown',
    size: '1 KB',
    time: '08:04',
    content:
      '## Invoice sync summary\n\nReconciled 138 of 142 invoices.\n\n- 4 invoices unmatched\n- 2 flagged for review\n- 0 errors',
  },
  {
    id: 'unmatched',
    name: 'unmatched.csv',
    kind: 'csv',
    size: '320 B',
    time: '08:04',
    content: 'invoice,amount,customer\nINV-204,€120,Acme\nINV-209,€64,Globex\nINV-221,€890,Initech\nINV-230,€12,Umbrella',
  },
];

export const Default: Story = {
  render: () => <ArtifactViewer artifacts={artifacts} />,
};

export const Empty: Story = {
  render: () => <ArtifactViewer artifacts={[]} />,
};
