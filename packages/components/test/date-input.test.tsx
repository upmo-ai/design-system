import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DateInput } from '../src/dates.ts';
import { Field } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('DateInput', () => {
  it('labels the input from above and shows the description', () => {
    renderThemed(<DateInput label="Expiry" description="Europe/London" />);
    const input = screen.getByRole('textbox', { name: 'Expiry' });
    expect(input).toHaveClass('upmo-input');
    expect(screen.getByText('Europe/London')).toBeInTheDocument();
  });

  it('marks an optional field with "(optional)" and nothing when required', () => {
    const { unmount } = renderThemed(<DateInput label="Expiry" />);
    expect(screen.queryByText('(optional)')).not.toBeInTheDocument();
    unmount();
    renderThemed(<DateInput label="Expiry" optional />);
    expect(screen.getByRole('textbox', { name: 'Expiry (optional)' })).toBeInTheDocument();
  });

  it('shows the error and marks the input invalid', () => {
    renderThemed(<DateInput label="Expiry" error="Pick a date within the next year." />);
    expect(screen.getByRole('textbox', { name: 'Expiry' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Pick a date within the next year.')).toBeInTheDocument();
  });

  it("shows the error as Field does: the danger icon, then the message, as an alert", () => {
    const message = 'Pick a date within the next year.';
    const { container, unmount } = renderThemed(
      <Field label="Expiry" error={message}>
        {(props) => <input {...props} />}
      </Field>,
    );
    const fieldError = screen.getByRole('alert');
    const fieldShape = { className: fieldError.className, tag: fieldError.tagName, html: fieldError.innerHTML };
    expect(container.querySelector('.upmo-field__error svg[aria-hidden="true"]')).toBeTruthy();
    unmount();

    renderThemed(<DateInput label="Expiry" error={message} />);
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(message);
    expect(error).toHaveClass(fieldShape.className);
    expect(error.tagName).toBe(fieldShape.tag);
    expect(error.innerHTML).toBe(fieldShape.html);
    expect(screen.getByRole('textbox', { name: 'Expiry' })).toHaveAccessibleDescription(message);
  });

  it('marks the input invalid with no message line for a boolean error', () => {
    renderThemed(<DateInput label="Expiry" error />);
    expect(screen.getByRole('textbox', { name: 'Expiry' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('takes and reports dates as YYYY-MM-DD strings', () => {
    const onChange = vi.fn();
    renderThemed(<DateInput label="Expiry" defaultDate="2027-01-01" onChange={onChange} popoverProps={{ opened: true }} />);
    fireEvent.click(screen.getByRole('button', { name: '15 January 2027' }));
    expect(onChange).toHaveBeenCalledWith('2027-01-15');
  });

  it('describes the input with its description and its error', () => {
    renderThemed(<DateInput label="Expiry" description="Europe/London" error="Pick a date within the next year." />);
    const input = screen.getByRole('textbox', { name: 'Expiry' });
    expect(input).toHaveAccessibleDescription(/Europe\/London/);
    expect(input).toHaveAccessibleDescription(/Pick a date within the next year\./);
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids).toContain(screen.getByText('Europe/London').id);
    expect(ids).toContain(screen.getByText('Pick a date within the next year.').closest('[id]')?.id);
  });

  it('marks today and weekends with the Upmo calendar day class', () => {
    renderThemed(<DateInput label="Expiry" popoverProps={{ opened: true }} />);
    const today = document.querySelector('[data-today]');
    expect(today).toHaveClass('upmo-date-input__day');
  });

  it('formats a value as "D MMM YYYY" by default', () => {
    renderThemed(<DateInput label="Expiry" value="2027-01-15" onChange={() => {}} />);
    expect(screen.getByRole('textbox', { name: 'Expiry' })).toHaveValue('15 Jan 2027');
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<DateInput label="Expiry" />, theme);
      expect(screen.getByRole('textbox', { name: 'Expiry' })).toBeInTheDocument();
      unmount();
    }
  });
});
