import { Menu, NavLink, Tooltip, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useAppFrame } from './AppFrame.tsx';

// NavLink and Menu.Item are polymorphic with very large prop unions; for a
// data-driven item with an optional router `component`, treat them as loose
// elements (as Breadcrumbs does) and keep NavItemProps strict.
const Link = NavLink as unknown as (props: Record<string, unknown>) => ReactNode;
const MenuLink = Menu.Item as unknown as (props: Record<string, unknown>) => ReactNode;
const SubMenuItem = Menu.Sub.Item as unknown as (props: Record<string, unknown>) => ReactNode;

// True inside a collapsed group's flyout menu: nested NavItems render as menu items.
const InMenuContext = createContext(false);

export interface SideNavProps {
  /** The accessible name of the navigation landmark. Default "Main". */
  label?: string;
  /** NavSections, or NavItems directly. */
  children: ReactNode;
  className?: string;
}

/**
 * SideNav is the navigation landmark inside AppFrame's side rail: a `<nav>`
 * holding NavSections and NavItems. It scrolls on its own when the list is
 * longer than the rail.
 */
export function SideNav({ label = 'Main', children, className }: SideNavProps) {
  const { rail } = useAppFrame();
  return (
    <nav aria-label={label} className={clsx('upmo-side-nav', className)} data-rail={rail || undefined}>
      {children}
    </nav>
  );
}

export interface NavSectionProps {
  /** An optional group label (e.g. "Workspace"). In the icon rail it becomes a divider. */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A group of NavItems with an optional overline label. */
export function NavSection({ label, children, className }: NavSectionProps) {
  const id = useId();
  return (
    <div
      role={label ? 'group' : undefined}
      aria-labelledby={label ? id : undefined}
      className={clsx('upmo-nav-section', className)}
    >
      {label ? (
        <div id={id} className="upmo-nav-section__label">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export interface NavItemProps {
  /** The visible label. In the icon rail it becomes the tooltip, and stays the accessible name. */
  label: string;
  /** The item icon (e.g. `<Icon concept="nav.tasks" />`). Decorative. */
  icon?: ReactNode;
  /** Href for a plain link. */
  href?: string;
  /** Polymorphic component for router links (e.g. TanStack Router Link). */
  component?: ElementType;
  /** Extra props forwarded to the link component (e.g. `to`). */
  linkProps?: Record<string, unknown>;
  /** The current page: selected styling and `aria-current="page"`. */
  active?: boolean;
  /** A count shown at the end of the row (e.g. tasks needing approval). Hidden when 0. */
  count?: number;
  /** A badge shown at the end of the row instead of the count (e.g. a StatusBadge). */
  badge?: ReactNode;
  /**
   * Called when the item is clicked: a link before it navigates, a group when
   * it toggles, and in the icon rail when the group's flyout trigger is
   * clicked.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Nested NavItems. The item becomes a collapsible group (a flyout menu in the icon rail). */
  children?: ReactNode;
  /**
   * Initial expanded state of a group in the full sidebar and the drawer.
   * Default false. Not used by the icon rail flyout or a flyout submenu,
   * which open on demand and keep their own state.
   */
  defaultOpened?: boolean;
  /**
   * Controlled expanded state of a group in the full sidebar and the drawer.
   * Not used by the icon rail flyout or a flyout submenu.
   */
  opened?: boolean;
  /**
   * Called when a group expands or collapses in the full sidebar or the
   * drawer. Opening or closing the icon rail flyout does not call it, so a
   * persisted expanded state is not overwritten by a transient menu.
   */
  onOpenedChange?: (opened: boolean) => void;
}

/**
 * A side navigation entry: icon, label, active state, an optional count or
 * badge, and optional nested items. Wraps Mantine NavLink. In the icon rail
 * the label moves to a tooltip (and stays in the accessible name), a count or
 * badge becomes a dot on the icon, and a group opens as a flyout menu.
 * Choosing an item closes AppFrame's phone drawer.
 */
export function NavItem({
  label,
  icon,
  href,
  component,
  linkProps,
  active,
  count,
  badge,
  onClick,
  children,
  defaultOpened,
  opened,
  onOpenedChange,
}: NavItemProps) {
  const { rail, closeDrawer } = useAppFrame();
  const inMenu = useContext(InMenuContext);
  const group = Boolean(children);
  const end = badge ?? (count ? <span className="upmo-nav-item__count">{count}</span> : null);
  const target = component ? { component, ...linkProps } : { href, ...linkProps };
  const current = active ? { 'aria-current': 'page' as const } : {};
  const choose = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    closeDrawer();
  };

  if (inMenu && group) {
    // A group inside a flyout opens as a submenu, so no nested item is lost.
    // The submenu keeps its own state: `opened` is the sidebar expanded state.
    return (
      <Menu.Sub>
        <Menu.Sub.Target>
          <SubMenuItem
            leftSection={icon}
            data-active={active || undefined}
            className="upmo-nav-item__menu-item"
            onClick={onClick}
          >
            <span className="upmo-nav-item__label-row">
              {label}
              {end}
            </span>
          </SubMenuItem>
        </Menu.Sub.Target>
        <Menu.Sub.Dropdown>{children}</Menu.Sub.Dropdown>
      </Menu.Sub>
    );
  }

  if (inMenu) {
    return (
      <MenuLink
        {...(component ? target : { component: href ? 'a' : undefined, ...target })}
        {...current}
        leftSection={icon}
        rightSection={end}
        data-active={active || undefined}
        className="upmo-nav-item__menu-item"
        onClick={choose}
      >
        {label}
      </MenuLink>
    );
  }

  if (rail && group) {
    return (
      <RailGroup label={label} icon={icon} active={active} end={end} onClick={onClick}>
        {children}
      </RailGroup>
    );
  }

  const link = (
    <Link
      {...(group ? { component: 'button', type: 'button' } : target)}
      {...(group ? {} : current)}
      label={
        group && end ? (
          <span className="upmo-nav-item__label-row">
            <span className="upmo-nav-item__label">{label}</span>
            {end}
          </span>
        ) : (
          <span className="upmo-nav-item__label">{label}</span>
        )
      }
      leftSection={
        icon ? (
          <span className="upmo-nav-item__icon">
            {icon}
            {rail && end ? <span className="upmo-nav-item__dot" aria-hidden="true" /> : null}
          </span>
        ) : undefined
      }
      rightSection={group ? undefined : end ?? undefined}
      active={active}
      opened={opened}
      defaultOpened={defaultOpened}
      onChange={onOpenedChange}
      onClick={group ? onClick : choose}
      childrenOffset={0}
      className={clsx('upmo-nav-item', rail && 'upmo-nav-item--rail', group && 'upmo-nav-item--group')}
      classNames={{ children: 'upmo-nav-item__children' }}
    >
      {children}
    </Link>
  );

  if (!rail) return link;
  return (
    <Tooltip label={label} position="right">
      {link}
    </Tooltip>
  );
}

// A group in the icon rail: the button is the Menu target itself, so it
// carries aria-haspopup, aria-expanded and aria-controls. Its label tooltip is
// attached by ref and driven by hover and focus, rather than wrapping the
// button (a wrapping Tooltip would take the menu props instead of the button).
// The flyout keeps its own open state: the group's `opened` is the sidebar
// expanded state, and the flyout must not write a transient menu into it.
function RailGroup({
  label,
  icon,
  active,
  end,
  onClick,
  children,
}: {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  end: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const [menuOpened, setMenuOpened] = useState(false);
  const [hinting, setHinting] = useState(false);
  // "right" here, and on the tooltips, means the inline end: Mantine flips it
  // to "left" inside a DirectionProvider set to rtl.
  return (
    <>
      <Menu opened={menuOpened} onChange={setMenuOpened} position="right-start" offset={8} width={200} withinPortal>
        <Menu.Target>
          <UnstyledButton
            ref={button}
            className="upmo-nav-item upmo-nav-item--rail"
            data-active={active || undefined}
            onMouseEnter={() => setHinting(true)}
            onMouseLeave={() => setHinting(false)}
            onFocus={() => setHinting(true)}
            onBlur={() => setHinting(false)}
            onClick={onClick}
          >
            <span className="upmo-nav-item__icon">
              {icon}
              {end ? <span className="upmo-nav-item__dot" aria-hidden="true" /> : null}
            </span>
            {/* The name, and any count, stay readable to assistive tech; the
                comma keeps them apart ("Management, 2"). */}
            <span className="upmo-nav-item__hidden">
              {label}
              {end ? <>, {end}</> : null}
            </span>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{label}</Menu.Label>
          <InMenuContext value>{children}</InMenuContext>
        </Menu.Dropdown>
      </Menu>
      <Tooltip label={label} position="right" target={button} opened={hinting && !menuOpened} />
    </>
  );
}
