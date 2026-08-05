import { Radio, type RadioGroupProps } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface RadioCardOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioCardGroupProps extends Omit<RadioGroupProps, 'children'> {
  /** The options, each rendered as a selectable bordered card. */
  options: RadioCardOption[];
  /** Lay the cards out in a row (wrapping) rather than stacked. Default false. */
  horizontal?: boolean;
}

/**
 * RadioCardGroup renders a radio group as bordered selectable cards (a label, an
 * optional description, and the radio control), the pattern for "one of a few"
 * where each option benefits from a sentence of explanation. The selected card
 * gets the emerald edge and the selected ground. Built on Mantine Radio.Card so
 * the whole card is the click and keyboard target.
 */
export function RadioCardGroup({ options, horizontal, className, ...rest }: RadioCardGroupProps) {
  return (
    <Radio.Group {...rest}>
      <div className={clsx('upmo-radio-cards', horizontal && 'upmo-radio-cards--row', className)}>
        {options.map((opt) => (
          <Radio.Card
            key={opt.value}
            value={opt.value}
            className="upmo-radio-card"
            disabled={opt.disabled}
          >
            <div className="upmo-radio-card__row">
              <Radio.Indicator />
              <div className="upmo-radio-card__text">
                <span className="upmo-radio-card__label">{opt.label}</span>
                {opt.description ? (
                  <span className="upmo-radio-card__desc">{opt.description}</span>
                ) : null}
              </div>
            </div>
          </Radio.Card>
        ))}
      </div>
    </Radio.Group>
  );
}
