import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Checkbox,
  Field,
  Input,
  Radio,
  Select,
  Switch,
  Textarea,
} from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('Field', () => {
  it('associates the label with the control via htmlFor/id', () => {
    renderThemed(
      <Field label="API key">{(props) => <input type="text" {...props} />}</Field>,
    );
    const input = screen.getByLabelText('API key');
    expect(input).toBeInTheDocument();
  });

  it('marks optional fields and leaves required ones unmarked', () => {
    const { rerender } = renderThemed(
      <Field label="Endpoint" optional>
        {(props) => <input type="text" {...props} />}
      </Field>,
    );
    expect(screen.getByText('(optional)')).toBeInTheDocument();

    rerender(
      <Field label="Endpoint">{(props) => <input type="text" {...props} />}</Field>,
    );
    expect(screen.queryByText('(optional)')).not.toBeInTheDocument();
  });

  it('wires description and error to the control with aria-describedby and marks invalid', () => {
    renderThemed(
      <Field label="API key" description="From the dashboard." error="Enter a key that starts with sk-.">
        {(props) => <input type="text" {...props} />}
      </Field>,
    );
    const input = screen.getByLabelText('API key');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const ids = describedBy!.split(' ');
    expect(ids.length).toBe(2);
    for (const id of ids) {
      expect(document.getElementById(id)).toBeInTheDocument();
    }
  });

  it('shows the error as a live region', () => {
    renderThemed(
      <Field label="Key" error="Required.">
        {(props) => <input type="text" {...props} />}
      </Field>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Required.');
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(
        <Field label="Name">{(props) => <input type="text" {...props} />}</Field>,
        theme,
      );
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      unmount();
    }
  });
});

describe('Input and Textarea', () => {
  it('Input renders with its own Mantine label/description/error anatomy', () => {
    renderThemed(<Input label="Display name" description="Shown to your team." error="Required." />);
    const input = screen.getByLabelText('Display name');
    expect(input).toBeInTheDocument();
    // Mantine wires its own aria-describedby for description + error.
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText('Required.')).toBeInTheDocument();
  });

  it('Textarea renders and is multiline', () => {
    renderThemed(<Textarea label="Goal" autosize={false} />);
    const el = screen.getByLabelText('Goal');
    expect(el.tagName).toBe('TEXTAREA');
  });
});

describe('Select', () => {
  it('renders with its label and the searchable combobox role', () => {
    renderThemed(
      <Select
        label="Plan kind"
        data={[
          { value: 'metered', label: 'Metered' },
          { value: 'subscription', label: 'Subscription' },
        ]}
        defaultValue="metered"
      />,
    );
    // Mantine Select renders a combobox input; assert it is present and labelled.
    const combobox = screen.getByRole('combobox', { name: 'Plan kind' });
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveValue('Metered');
  });
});

describe('Checkbox, Radio, Switch', () => {
  it('Checkbox renders with a label', () => {
    renderThemed(<Checkbox label="Active" />);
    expect(screen.getByRole('checkbox', { name: 'Active' })).toBeInTheDocument();
  });

  it('Radio group renders its options', () => {
    renderThemed(
      <Radio.Group label="Reach" defaultValue="all">
        <Radio value="all" label="All resources" />
        <Radio value="these" label="Only these" />
      </Radio.Group>,
    );
    expect(screen.getByRole('radio', { name: 'All resources' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Only these' })).toBeInTheDocument();
  });

  it('Switch renders with a label and toggles role', () => {
    renderThemed(<Switch label="Follow live" />);
    expect(screen.getByRole('switch', { name: 'Follow live' })).toBeInTheDocument();
  });

  it('all render in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(
        <div>
          <Checkbox label="A" />
          <Radio.Group defaultValue="x">
            <Radio value="x" label="X" />
          </Radio.Group>
          <Switch label="S" />
        </div>,
        theme,
      );
      expect(screen.getByRole('checkbox', { name: 'A' })).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'S' })).toBeInTheDocument();
      unmount();
    }
  });
});
