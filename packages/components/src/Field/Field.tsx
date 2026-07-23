import { IconExclamationCircle } from '@tabler/icons-react';
import clsx from 'clsx';
import { useId, type ReactNode } from 'react';

export interface FieldControlProps {
  /** Wire onto the control: links the label to it. */
  id: string;
  /** Wire onto the control: points at the description and error text. */
  'aria-describedby'?: string;
  /** Wire onto the control: true when the field is in error. */
  'aria-invalid'?: boolean;
}

export interface FieldProps {
  /** The field label. Always visible, always above the control. */
  label: ReactNode;
  /**
   * The control. Either a ready element, or a render function that receives the
   * accessibility props to spread onto the control (preferred, so label/error
   * are correctly associated).
   */
  children: ReactNode | ((props: FieldControlProps) => ReactNode);
  /** What the value is for, or where to find it. Sits under the control. */
  description?: ReactNode;
  /** Error message. When set, the field reads as invalid and shows the message. */
  error?: ReactNode;
  /**
   * Required is the DEFAULT (forms.md). Set optional to append "(optional)" to
   * the label. If a form mixes both, the caller can also force required marks.
   */
  optional?: boolean;
  /** Force a "(required)" mark on the label (for forms that mix optional fields). */
  requiredMark?: boolean;
  className?: string;
}

/**
 * Field is the form field anatomy from the Upmo forms spec: a label above the
 * control, an optional description under it, and an error message below that,
 * all associated with the control for assistive tech (label htmlFor, control
 * aria-describedby pointing at description + error, aria-invalid when errored).
 *
 * Required is the default and carries no mark; pass `optional` for "(optional)".
 *
 * Use Field to wrap NATIVE or custom controls, passing the render-prop form so
 * the aria wiring lands on the control. Mantine inputs (Input, Textarea,
 * Select) already implement the full anatomy via their own label/description/
 * error props, so prefer those props directly rather than wrapping them in a
 * Field.
 */
export function Field({
  label,
  children,
  description,
  error,
  optional,
  requiredMark,
  className,
}: FieldProps) {
  const id = useId();
  const controlId = `${id}-control`;
  const descId = `${id}-desc`;
  const errId = `${id}-err`;

  const describedBy =
    [description ? descId : null, error ? errId : null].filter(Boolean).join(' ') || undefined;

  const controlProps: FieldControlProps = {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
  };

  return (
    <div className={clsx('upmo-field', className)}>
      <label className="upmo-field__label" htmlFor={controlId}>
        {label}
        {optional ? <span className="upmo-field__hint"> (optional)</span> : null}
        {requiredMark ? <span className="upmo-field__hint"> (required)</span> : null}
      </label>

      {typeof children === 'function' ? children(controlProps) : children}

      {description ? (
        <div className="upmo-field__description" id={descId}>
          {description}
        </div>
      ) : null}

      {error ? (
        <div className="upmo-field__error" id={errId} role="alert">
          <IconExclamationCircle size={14} stroke={2.2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
