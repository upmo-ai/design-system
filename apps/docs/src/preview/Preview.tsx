import { MantineProvider, SegmentedControl } from '@mantine/core';
import { cssVariablesResolver, upmoTheme } from '@upmo-ai/theme';
import { useState, type ReactNode } from 'react';
import classes from './Preview.module.css';

import '@mantine/core/styles.css';

// Upmo has three token themes (light, dark, high contrast); Mantine knows only
// light and dark. High contrast is an Upmo token scope layered on Mantine's
// light base. Each preview theme maps to a Mantine colour scheme plus a
// data-theme value.
//
// The provider is scoped to this island only: getRootElement + cssVariablesSelector
// point Mantine at the wrap element, and the colour scheme is written onto that
// same element with data-mantine-color-scheme. Nothing touches the document root,
// so the surrounding Starlight docs chrome keeps its own theme.
type PreviewTheme = 'light' | 'dark' | 'hc';

const options: { label: string; value: PreviewTheme }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'High contrast', value: 'hc' },
];

const mantineScheme: Record<PreviewTheme, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  hc: 'light',
};

export interface PreviewProps {
  children: ReactNode;
  initial?: PreviewTheme;
  label?: string;
}

export function Preview({ children, initial = 'light', label }: PreviewProps) {
  const [theme, setTheme] = useState<PreviewTheme>(initial);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setRoot}
      className={classes.wrap}
      data-theme={theme}
      data-mantine-color-scheme={mantineScheme[theme]}
    >
      <MantineProvider
        theme={upmoTheme}
        cssVariablesResolver={cssVariablesResolver}
        getRootElement={() => root ?? undefined}
        cssVariablesSelector={`.${classes.wrap}`}
      >
        <div className={classes.toolbar}>
          <SegmentedControl
            size="xs"
            value={theme}
            onChange={(v) => setTheme(v as PreviewTheme)}
            data={options}
            aria-label="Preview theme"
          />
        </div>
        <div className={classes.surface}>{children}</div>
        {label ? <div className={classes.caption}>{label}</div> : null}
      </MantineProvider>
    </div>
  );
}
