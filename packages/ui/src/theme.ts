import { createTheme, rem, type MantineColorsTuple } from '@mantine/core';
import { breakpoint, color, font, radius, spacing, typography as type } from '@upmo-ai/tokens';

interface Style {
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
}

// Mantine wants unitless line heights; tokens hold px pairs (28px on 20px is 1.4).
const ratio = (s: Style) => String(Number((parseFloat(s.lineHeight) / parseFloat(s.fontSize)).toFixed(2)));

const heading = (s: Style) => ({
  fontSize: rem(s.fontSize),
  lineHeight: ratio(s),
  fontWeight: String(s.fontWeight),
});

const emerald: MantineColorsTuple = [
  color['emerald-0'].light,
  color['emerald-1'].light,
  color['emerald-2'].light,
  color['emerald-3'].light,
  color['emerald-4'].light,
  color['emerald-5'].light,
  color['emerald-6'].light,
  color['emerald-7'].light,
  color['emerald-8'].light,
  color['emerald-9'].light,
];

// Colours beyond the emerald scale come from tokens.css at runtime (see content/mantine.md).
export const upmoTheme = createTheme({
  primaryColor: 'emerald',
  primaryShade: { light: 7, dark: 4 },
  colors: { emerald },
  white: color['surface-100'].light,
  black: color.ink.light,
  fontFamily: font.ui,
  fontFamilyMonospace: font.mono,
  headings: {
    fontFamily: font.ui,
    fontWeight: String(type.h2.fontWeight),
    sizes: {
      h1: heading(type.h1),
      h2: heading(type.h2),
      h3: heading(type.h3),
      h4: heading(type.h4),
    },
  },
  fontSizes: {
    xs: rem(type.caption.fontSize),
    sm: rem(type['body-sm'].fontSize),
    md: rem(type.body.fontSize),
    lg: rem(type['body-lg'].fontSize),
    xl: rem(type.h3.fontSize),
  },
  lineHeights: {
    xs: ratio(type.caption),
    sm: ratio(type['body-sm']),
    md: ratio(type.body),
    lg: ratio(type['body-lg']),
    xl: ratio(type.h3),
  },
  spacing: {
    xs: rem(spacing['space-2']),
    sm: rem(spacing['space-3']),
    md: rem(spacing['space-4']),
    lg: rem(spacing['space-5']),
    xl: rem(spacing['space-6']),
  },
  radius: {
    xs: rem(radius['radius-xs']),
    sm: rem(radius['radius-sm']),
    md: rem(radius['radius-md']),
    lg: rem(radius['radius-lg']),
    xl: rem(radius['radius-xl']),
  },
  defaultRadius: 'md',
  shadows: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
  breakpoints: {
    xs: breakpoint['bp-xs'],
    sm: breakpoint['bp-sm'],
    md: breakpoint['bp-md'],
    lg: breakpoint['bp-lg'],
    xl: breakpoint['bp-xl'],
  },
  focusRing: 'auto',
  cursorType: 'pointer',
  respectReducedMotion: true,
  components: {
    Button: { defaultProps: { size: 'sm', radius: 'xs' } },
    TextInput: { defaultProps: { size: 'sm', radius: 'xs' } },
    Select: { defaultProps: { size: 'sm', radius: 'xs', checkIconPosition: 'right' } },
    Card: { defaultProps: { radius: 'sm', withBorder: true, padding: 'sm', shadow: undefined } },
    Modal: { defaultProps: { radius: 'lg', centered: true, overlayProps: { backgroundOpacity: 0.48 } } },
    Badge: { defaultProps: { radius: 'xs', variant: 'light', size: 'sm' } },
    Tooltip: { defaultProps: { openDelay: 400, radius: 'xs' } },
    Notifications: { defaultProps: { position: 'bottom-right', autoClose: 5000, pauseResetOnHover: 'notification' } },
  },
});
