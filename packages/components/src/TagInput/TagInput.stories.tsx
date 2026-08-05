import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TagInput } from './TagInput.tsx';

const meta: Meta<typeof TagInput> = {
  title: 'Forms/TagInput',
  component: TagInput,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof TagInput>;

export const Interests: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([
      'Simple Storage Service (S3)',
      'Lambda',
      'Elastic Container Service (ECS)',
      'CloudFront',
    ]);
    return (
      <div style={{ maxWidth: 640 }}>
        <TagInput
          label="Interests"
          description="Add topics you're interested in to improve your experience."
          placeholder="Search interests"
          maxTags={10}
          value={value}
          onChange={setValue}
          data={['Bedrock', 'API Gateway', 'Simple Queue Service (SQS)', 'Simple Notification Service (SNS)', 'Elastic Kubernetes Service (EKS)']}
        />
      </div>
    );
  },
};
