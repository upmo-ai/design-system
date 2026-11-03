import { DateInput as MantineDateInput, type DateInputProps as MantineDateInputProps } from '@mantine/dates';
import clsx from 'clsx';
import { FieldErrorMessage, fieldErrorProps } from '../Field/Field.tsx';
import { Icon } from '../icon/Icon.tsx';

export interface DateInputProps extends MantineDateInputProps {
  /**
   * Required is the default and carries no mark (the forms spec). Set
   * `optional` to append "(optional)" to the label, as Field does.
   */
  optional?: boolean;
}

/**
 * A date field: a Mantine DateInput (type a date or pick one from the
 * calendar) with the Upmo field anatomy and control feel. The label sits
 * above, the description under it, the error below with the danger icon, and
 * `optional` appends "(optional)" to the label. Defaults: the "D MMM YYYY"
 * format, a calendar icon on the right, the shared emerald focus edge, and in
 * the calendar, today marked by an outline and underline and weekends in the
 * danger tone.
 * Pass `minDate` / `maxDate` to bound the choice.
 *
 * Imported from `@upmo-ai/components/dates`, so only apps that use it need
 * the `@mantine/dates` and `dayjs` peers and `@mantine/dates/styles.css`.
 */
export function DateInput({
  optional,
  label,
  error,
  errorProps,
  classNames,
  valueFormat = 'D MMM YYYY',
  rightSection,
  rightSectionPointerEvents,
  ...rest
}: DateInputProps) {
  // Mantine renders a message only for a non-boolean error; `true` still marks
  // the input invalid with no message, as in Mantine.
  const message = error && typeof error !== 'boolean';
  return (
    <MantineDateInput
      valueFormat={valueFormat}
      // Field's error line: the danger icon and the message, announced as an
      // alert. Mantine keeps the id and the aria-describedby wiring.
      error={message ? <FieldErrorMessage>{error}</FieldErrorMessage> : error}
      errorProps={{
        component: 'div',
        role: fieldErrorProps.role,
        ...errorProps,
        className: clsx(fieldErrorProps.className, (errorProps as { className?: string } | undefined)?.className),
      }}
      label={
        label && optional ? (
          <>
            {label}
            <span className="upmo-field__hint"> (optional)</span>
          </>
        ) : (
          label
        )
      }
      rightSection={rightSection ?? <Icon concept="object.calendar" size={16} />}
      rightSectionPointerEvents={rightSectionPointerEvents ?? (rightSection ? undefined : 'none')}
      {...rest}
      classNames={{
        ...classNames,
        input: clsx('upmo-input', (classNames as Record<string, string>)?.input),
        day: clsx('upmo-date-input__day', (classNames as Record<string, string>)?.day),
      }}
    />
  );
}
