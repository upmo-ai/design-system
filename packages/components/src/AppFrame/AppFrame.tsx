import { AppShell, Drawer, useMantineTheme } from '@mantine/core';
import { useMediaQuery, useUncontrolled } from '@mantine/hooks';
import clsx from 'clsx';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
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
  /** Controlled drawer state below md. Ignored from md, where the toggle collapses the rail. */
  drawerOpened?: boolean;
  /** Initial drawer state below md, when uncontrolled. Default false. */
  defaultDrawerOpened?: boolean;
  /**
   * Called when the drawer opens or closes: the toggle, Escape, the scrim, a
   * NavItem, `closeDrawer()`, or the viewport widening to md with the drawer open.
   */
  onDrawerOpenedChange?: (opened: boolean) => void;
  /**
   * Makes the main region a viewport-tall column without padding: the last
   * child grows to fill it and the region scrolls on overflow. For pages that
   * own their height, such as a chat. Default false.
   */
  fill?: boolean;
  /** Extra class on the main region. */
  mainClassName?: string;
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
 * when a NavItem is chosen. Hold the drawer state yourself with `drawerOpened`
 * and `onDrawerOpenedChange`, for example to open it from a keyboard shortcut.
 * If the viewport widens to md while focus is inside the open drawer, focus
 * moves to the navigation toggle in the top bar instead of falling to the page.
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
  drawerOpened: drawerOpenedProp,
  defaultDrawerOpened = false,
  onDrawerOpenedChange,
  fill = false,
  mainClassName,
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
  const [drawerOpenedState, setDrawerOpened] = useUncontrolled({
    value: drawerOpenedProp,
    defaultValue: defaultDrawerOpened,
    finalValue: false,
    onChange: onDrawerOpenedChange,
  });
  // useUncontrolled returns a new setter on every render; context consumers
  // need a closeDrawer that stays the same.
  const setDrawerOpenedRef = useRef(setDrawerOpened);
  setDrawerOpenedRef.current = setDrawerOpened;
  const closeDrawer = useCallback(() => setDrawerOpenedRef.current(false), []);

  const mobile = !atLeastSm;
  const rail = !mobile && (!wide || userCollapsed);
  // Below md the rail is forced, so the toggle opens the drawer instead.
  const usesDrawer = !wide;
  const drawerOpened = usesDrawer && drawerOpenedState;

  const topBarRef = useRef<HTMLElement>(null);
  const focusWasInDrawerRef = useRef(false);
  const rememberDrawerFocus = useCallback((hadFocus: boolean) => {
    focusWasInDrawerRef.current = hadFocus;
  }, []);

  // The drawer unmounts from md. Without this the state would stay open: the
  // rail behind it would stay inert, and narrowing again would reopen the drawer.
  // A focused element that is removed leaves focus on the body, so when focus
  // was inside the drawer it moves to the navigation toggle.
  useEffect(() => {
    if (usesDrawer) return;
    if (drawerOpenedState) setDrawerOpenedRef.current(false);
    if (!focusWasInDrawerRef.current) return;
    focusWasInDrawerRef.current = false;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    topBarRef.current?.querySelector<HTMLElement>('[data-nav-toggle]')?.focus();
  }, [usesDrawer, drawerOpenedState]);
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
        <AppShell.Header ref={topBarRef} className="upmo-app-frame__top-bar">
          {usesDrawer ? (
            <IconButton
              aria-label="Open navigation"
              aria-expanded={drawerOpened}
              data-nav-toggle
              size="lg"
              onClick={() => setDrawerOpened(true)}
            >
              <Icon concept="nav.menu" />
            </IconButton>
          ) : (
            <IconButton
              aria-label={userCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-expanded={!userCollapsed}
              data-nav-toggle
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

        <AppShell.Main
          id={contentId}
          tabIndex={-1}
          className={clsx('upmo-app-frame__main', mainClassName)}
          data-fill={fill || undefined}
        >
          {children}
        </AppShell.Main>
      </AppShell>

      {usesDrawer ? (
        // The compound Drawer: its stock header is a <header> element, which
        // would read as a second banner landmark beside the top bar. Every
        // slot in it, the header included, sees the full layout (rail false).
        <AppFrameContext value={drawerState}>
          <DrawerFocusProbe onRemove={rememberDrawerFocus} />
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

/**
 * Rendered ahead of the drawer, so its layout cleanup runs as the drawer is
 * removed and before the drawer's nodes leave the document. That is the last
 * moment `document.activeElement` still says whether focus was inside it.
 */
function DrawerFocusProbe({ onRemove }: { onRemove: (hadFocus: boolean) => void }) {
  useLayoutEffect(
    () => () => onRemove(Boolean(document.activeElement?.closest('.upmo-app-frame__drawer'))),
    [onRemove],
  );
  return null;
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
