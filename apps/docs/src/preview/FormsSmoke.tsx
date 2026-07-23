import { Group, Stack } from '@mantine/core';
import { Button, Checkbox, Field, Input, Radio, Select, Switch, Textarea } from '@upmo-ai/components';
import { Preview } from './Preview.tsx';

/**
 * The form controls: Field, Input, Textarea, Select, Checkbox, Radio, Switch,
 * in a realistic connect-a-provider style form.
 */
export function FormsSmoke() {
  return (
    <Preview label="Field, Input, Textarea, Select, Checkbox, Radio and Switch from @upmo-ai/components. Switch themes to check all three.">
      <Stack gap="md" style={{ maxWidth: 440 }}>
        <Input label="Provider display name" placeholder="e.g. Anthropic Production" defaultValue="Anthropic" />

        <Input
          label="API key"
          description="Keys are encrypted at rest and stay on this server."
          placeholder="sk-..."
        />

        <Input
          label="Endpoint URL"
          error="Enter a URL that starts with https://."
          defaultValue="http:/bad"
        />

        <Select
          label="Plan kind"
          description="Controls rate limits, cost accounting, and scheduling."
          data={[
            { value: 'metered', label: 'Metered (Pay-as-you-go)' },
            { value: 'subscription', label: 'Subscription' },
            { value: 'local', label: 'Local (Self-hosted)' },
          ]}
          defaultValue="metered"
        />

        <Textarea
          label="Notes"
          description="Anything the team should know about this provider."
          placeholder="Optional notes"
        />

        <Field label="Reach" description="What agents can access through this connector.">
          {() => (
            <Radio.Group defaultValue="all">
              <Stack gap="xs" mt={4}>
                <Radio value="all" label="All resources" description="Agents can read and act on everything." />
                <Radio value="these" label="Only these resources" description="Restrict access to a named set." />
              </Stack>
            </Radio.Group>
          )}
        </Field>

        <Checkbox label="Allow background runs when I am away" defaultChecked />
        <Switch label="Follow this provider live" defaultChecked />

        <Group justify="flex-end" mt="sm">
          <Button variant="subtle">Cancel</Button>
          <Button>Connect</Button>
        </Group>
      </Stack>
    </Preview>
  );
}
