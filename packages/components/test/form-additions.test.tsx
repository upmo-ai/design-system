import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Field, RadioCardGroup, SearchSelect, TagInput } from '../src/index.ts';
import { renderThemed } from './render.tsx';

describe('Field info message', () => {
  it('shows the info note when there is no error', () => {
    renderThemed(
      <Field label="Webhook" info="We will ping after save.">
        {(p) => <input {...p} />}
      </Field>,
    );
    expect(screen.getByText('We will ping after save.')).toBeInTheDocument();
  });

  it('hides info when an error is present (error wins)', () => {
    renderThemed(
      <Field label="Webhook" info="hint" error="bad url">
        {(p) => <input {...p} />}
      </Field>,
    );
    expect(screen.getByText('bad url')).toBeInTheDocument();
    expect(screen.queryByText('hint')).not.toBeInTheDocument();
  });
});

describe('RadioCardGroup', () => {
  it('renders options and selects on click', () => {
    const onChange = vi.fn();
    renderThemed(
      <RadioCardGroup
        label="Autonomy"
        value="ask"
        onChange={onChange}
        options={[
          { value: 'ask', label: 'Ask first', description: 'Pause each step' },
          { value: 'auto', label: 'Automatic' },
        ]}
      />,
    );
    expect(screen.getByText('Ask first')).toBeInTheDocument();
    expect(screen.getByText('Pause each step')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Automatic'));
    expect(onChange).toHaveBeenCalledWith('auto');
  });
});

describe('TagInput', () => {
  it('renders existing tags', () => {
    renderThemed(
      <TagInput label="Interests" value={['Lambda', 'S3']} onChange={() => {}} data={[]} />,
    );
    expect(screen.getByText('Lambda')).toBeInTheDocument();
    expect(screen.getByText('S3')).toBeInTheDocument();
  });
});

describe('SearchSelect', () => {
  it('shows the current selection and opens a search on click', () => {
    renderThemed(
      <SearchSelect
        label="Country"
        value="Netherlands"
        onChange={() => {}}
        data={[
          { value: 'Netherlands', label: 'Netherlands' },
          { value: 'Albania', label: 'Albania' },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: /Country/ });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Netherlands');
    fireEvent.click(trigger);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    // The option list is now visible with both choices.
    expect(screen.getByText('Albania')).toBeInTheDocument();
  });
});
