import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SearchSelect } from './SearchSelect.tsx';

const meta: Meta<typeof SearchSelect> = {
  title: 'Forms/SearchSelect',
  component: SearchSelect,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof SearchSelect>;

const countries = [
  'Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa', 'Andorra',
  'Angola', 'Anguilla', 'Antarctica', 'Antigua & Barbuda', 'Argentina', 'Armenia',
  'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Netherlands',
].map((c) => ({ value: c, label: c }));

export const Country: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('Netherlands');
    return (
      <div style={{ maxWidth: 420 }}>
        <SearchSelect
          label="Country"
          data={countries}
          value={value}
          onChange={setValue}
          searchPlaceholder="Search"
        />
      </div>
    );
  },
};
