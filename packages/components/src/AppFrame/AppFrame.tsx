import { AppShell, Drawer, useMantineTheme } from '@mantine/core';
import { useMediaQuery, useUncontrolled } from '@mantine/hooks';
import clsx from 'clsx';
import { createContext, useCallback, useContext, useId, useMemo, useState, type ReactNode } from 'react';
import { Icon } from '../icon/Icon.tsx';
import { IconButton } from '../IconButton/IconButton.tsx';

export interface AppFrameState {
  /** The side navigation shows as the icon rail (labels in tooltips). */
  rail: boolean;
  /** Phone width: the navigation lives in a drawer opened from the top bar. */
  mobile: boolean;
  /** Closes the phone drawer. NavItem calls it on navigate. */
  closeDrawer: () => void;
}

const AppFrameContext = createContext<AppFrameState>({ rail: false, mobile: false, closeDrawer: () => {} });

/** The layout state of the nearest AppFrame, for slots that adapt (e.g. `<Wordmark compact={rail} />`). */
export function useAppFrame(): AppFrameState {
  return useContext(AppFrameContext);
}

export interface AppFrameProps {
  /** Top of the side rail: the wordmark and workspace name. Read `useAppFrame().rail` to go compact. */
  header?: ReactNode;
  /** The side navigation, usually a SideNav. */
  navigation: ReactNode;
  /** Bottom of the side rail: the account menu and the theme switch. */
  footer?: ReactNode;
  /** Top bar content after the navigation toggle: breadcrumbs, search, the notifications bell. */
  topBar?: ReactNode;
  /** The page, usually a PageShell. */
  children: ReactNode;
  /** Controlled rail state on wide screens. */
  collapsed?: boolean;
  /** Initial rail state on wide screens, when uncontrolled. Default false. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

/**
 * AppFrame is the product frame around PageShell, built on Mantine AppShell:
 * a side rail (header slot, navigation, footer slot), a top bar, and the main
 * region with a "Skip to content" link.
 *
 * Layout follows the size tokens: from md the full sidebar (`--sidebar`),
 * which the top bar toggle collapses to the icon rail (`--rail`); between sm
 * and md the icon rail, with the toggle opening the full navigation as a
 * drawer; below sm no rail, and the toggle opens the drawer. The drawer is a
 * Mantine Drawer (focus trapped, Escape and the scrim close it) and closes
 * when a NavItem is chosen.
 */
export function AppFrame({
  header,
  navigation,
  footer,
  topBar,
  children,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
}: AppFrameProps) {
  const theme = useMantineTheme();
  const options = { getInitialValueInEffect: false };
  const wide = useMediaQuery(`(min-width: ${theme.breakpoints.md})`, true, options);
  const atLeastSm = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`, true, options);
  const [userCollapsed, setUserCollapsed] = useUncontrolled({
    value: collapsed,
    defaultValue: defaultCollapsed,
    finalValue: false,
    onChange: onCollapsedChange,
  });
  const [drawerOpened, setDrawerOpened] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpened(false), []);

  const mobile = !atLeastSm;
  const rail = !mobile && (!wide || userCollapsed);
  // Below md the rail is forced, so the toggle opens the drawer instead.
  const usesDrawer = !wide;
  const contentId = `${useId()}-content`;

  const railState = useMemo(() => ({ rail, mobile, closeDrawer }), [rail, mobile, closeDrawer]);
  const drawerState = useMemo(() => ({ rail: false, mobile, closeDrawer }), [mobile, closeDrawer]);

  return (
    <AppFrameContext value={railState}>
      <AppShell
        layout="alt"
        padding={{ base: 'md', sm: 'lg' }}
        header={{ height: 'var(--topbar)' }}
        navbar={{
          width: rail ? 'var(--rail)' : 'var(--sidebar)',
          breakpoint: 'sm',
          collapsed: { mobile: true },
        }}
        className={clsx('upmo-app-frame', className)}
      >
        <a className="upmo-app-frame__skip" href={`#${contentId}`}>
          Skip to content
        </a>
        <AppShell.Header className="upmo-app-frame__top-bar">
          {usesDrawer ? (
            <IconButton
              aria-label="Open navigation"
              aria-expanded={drawerOpened}
              size="lg"
              onClick={() => setDrawerOpened(true)}
            >
              <Icon concept="nav.menu" />
            </IconButton>
          ) : (
            <IconButton
              aria-label={userCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-expanded={!userCollapsed}
              size="lg"
              onClick={() => setUserCollapsed(!userCollapsed)}
            >
              <Icon concept="nav.sidebar" />
            </IconButton>
          )}
          {topBar ? <div className="upmo-app-frame__top-bar-content">{topBar}</div> : null}
        </AppShell.Header>

        {mobile ? null : (
          <AppShell.Navbar
            // Mantine renders this as a <nav> by default. SideNav is already
            // the "Main" navigation landmark, so the wrapper must not be one.
            // The Navbar spreads its props over its Box after choosing "nav",
            // so `component` wins at runtime; its typings just do not list it.
            {...polymorphicDiv}
            className="upmo-app-frame__rail"
            data-rail={rail || undefined}
            // While the drawer is open the rail behind it leaves the
            // accessibility tree, so only one "Main" navigation is exposed.
            inert={drawerOpened || undefined}
          >
            <RailContent header={header} navigation={navigation} footer={footer} />
          </AppShell.Navbar>
        )}

        <AppShell.Main id={contentId} tabIndex={-1} className="upmo-app-frame__main">
          {children}
        </AppShell.Main>
      </AppShell>

      {usesDrawer ? (
        // The compound Drawer: its stock header is a <header> element, which
        // would read as a second banner landmark beside the top bar. Every
        // slot in it, the header included, sees the full layout (rail false).
        <AppFrameContext value={drawerState}>
          <Drawer.Root opened={drawerOpened} onClose={closeDrawer} size="var(--sidebar)" zIndex="var(--z-modal)">
            <Drawer.Overlay zIndex="var(--z-overlay)" />
            {/* Mantine puts `className` on both the content and its full-viewport
                `inner` wrapper. The layout class belongs on the content only, so
                it goes through `classNames`, which targets one selector. */}
            <Drawer.Content aria-label="Navigation" classNames={{ content: 'upmo-app-frame__drawer' }}>
              <div className="upmo-app-frame__drawer-header">
                {header}
                <Drawer.CloseButton aria-label="Close navigation" />
              </div>
              <Drawer.Body className="upmo-app-frame__drawer-body">
                <RailContent navigation={navigation} footer={footer} />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Root>
        </AppFrameContext>
      ) : null}
    </AppFrameContext>
  );
}

/** `component="div"` for AppShell.Navbar, which supports it but does not type it. */
const polymorphicDiv: object = { component: 'div' };

function RailContent({ header, navigation, footer }: Pick<AppFrameProps, 'header' | 'navigation' | 'footer'>) {
  return (
    <>
      {header ? <div className="upmo-app-frame__rail-header">{header}</div> : null}
      <div className="upmo-app-frame__rail-nav">{navigation}</div>
      {footer ? <div className="upmo-app-frame__rail-footer">{footer}</div> : null}
    </>
  );
}
