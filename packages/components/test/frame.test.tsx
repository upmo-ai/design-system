import { DirectionProvider } from '@mantine/core';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { useState, type MouseEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AppFrame,
  Icon,
  NavItem,
  NavSection,
  SideNav,
  useAppFrame,
  Wordmark,
  type NavItemProps,
} from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

// The setup stub answers every media query with false (phone width). Wide
// screens answer true to both the sm and md queries.
function atWidth(wide: boolean | 'medium') {
  const original = window.matchMedia;
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    ...original(query),
    // Medium: at least sm, below md.
    matches: wide === 'medium' ? !query.includes('62em') : wide,
  }));
}

afterEach(() => vi.restoreAllMocks());

// A viewport that can change after mount: tests start at medium width and then
// widen, firing the media query listeners the way a resize does.
function resizableWidth(startWide: boolean) {
  let wide = startWide;
  const listeners = new Set<{ query: string; callback: (event: { matches: boolean }) => void }>();
  const matches = (query: string) => (query.includes('62em') ? wide : true);
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        media: query,
        get matches() {
          return matches(query);
        },
        addEventListener: (_type: string, callback: (event: { matches: boolean }) => void) =>
          listeners.add({ query, callback }),
        removeEventListener: (_type: string, callback: (event: { matches: boolean }) => void) => {
          for (const entry of listeners) if (entry.callback === callback) listeners.delete(entry);
        },
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
  return (next: boolean) => {
    wide = next;
    act(() => {
      for (const { query, callback } of listeners) callback({ matches: matches(query) });
    });
  };
}

function Brand() {
  const { rail } = useAppFrame();
  return <Wordmark compact={rail} />;
}

function frame(props: { onNavigate?: (event: MouseEvent<HTMLElement>) => void; defaultCollapsed?: boolean } = {}) {
  return (
    <AppFrame
      defaultCollapsed={props.defaultCollapsed}
      header={<Brand />}
      footer={<button type="button">Account</button>}
      topBar={<span>Search and bell</span>}
      navigation={
        <SideNav>
          <NavSection>
            <NavItem label="Home" icon={<Icon concept="nav.home" />} href="/" />
            <NavItem label="Tasks" icon={<Icon concept="nav.tasks" />} href="/tasks" active count={3} />
          </NavSection>
          <NavSection label="Workspace">
            <NavItem label="Management" icon={<Icon concept="nav.settings" />} count={2}>
              <NavItem label="Members" href="/admin/members" onClick={props.onNavigate} />
              <NavItem label="Teams" href="/admin/teams" />
              <NavItem label="Access">
                <NavItem label="Roles" href="/admin/roles" />
              </NavItem>
            </NavItem>
          </NavSection>
        </SideNav>
      }
    >
      <h1>Tasks</h1>
    </AppFrame>
  );
}

// The navigation landmarks a screen reader would reach. jsdom does not drop
// inert subtrees from role queries (browsers do), so filter them out here.
function exposedNavigations() {
  return screen.queryAllByRole('navigation').filter((nav) => !nav.closest('[inert]'));
}

describe('AppFrame navigation landmarks', () => {
  it('exposes exactly one navigation, named "Main", in the full sidebar', () => {
    atWidth(true);
    const { container } = renderThemed(frame());
    const navs = exposedNavigations();
    expect(navs).toHaveLength(1);
    expect(navs[0]).toHaveAccessibleName('Main');
    // No unnamed <nav> wrapper around it, and the rail is still a plain container.
    expect(container.querySelectorAll('nav')).toHaveLength(1);
    expect(container.querySelector('.upmo-app-frame__rail')?.tagName).toBe('DIV');
  });

  it('exposes exactly one navigation, named "Main", in the collapsed rail', () => {
    atWidth(true);
    const { container } = renderThemed(frame({ defaultCollapsed: true }));
    const navs = exposedNavigations();
    expect(navs).toHaveLength(1);
    expect(navs[0]).toHaveAccessibleName('Main');
    expect(container.querySelectorAll('nav')).toHaveLength(1);
  });

  it('exposes only the drawer navigation while the drawer is open over an inert rail', async () => {
    atWidth('medium');
    const { container } = renderThemed(frame());
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' });
    expect(container.querySelector('.upmo-app-frame__rail')).toHaveAttribute('inert');
    const navs = exposedNavigations();
    expect(navs).toHaveLength(1);
    expect(navs[0]).toHaveAccessibleName('Main');
    expect(drawer).toContainElement(navs[0]!);
  });
});

describe('AppFrame drawer classes', () => {
  // Mantine copies a plain `className` onto both the dialog and its
  // full-viewport `inner` wrapper. The layout class on the wrapper made it a
  // column whose height `flex: 0 0 var(--sidebar)` collapsed to ~248px, so the
  // layout class must sit on the dialog alone. The measured version of this
  // check is app-frame-drawer.browser.test.ts.
  it('puts the drawer layout class on the dialog and leaves the wrapper neutral', async () => {
    atWidth('medium');
    renderThemed(frame());
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const dialog = await screen.findByRole('dialog', { name: 'Navigation' });
    expect(dialog).toHaveClass('upmo-app-frame__drawer');
    const wrapper = dialog.closest('.mantine-Drawer-inner');
    expect(wrapper).not.toBeNull();
    expect(wrapper).not.toBe(dialog);
    expect(wrapper).not.toHaveClass('upmo-app-frame__drawer');
    expect(document.querySelectorAll('.upmo-app-frame__drawer')).toHaveLength(1);
  });
});

describe('AppFrame on a wide screen', () => {
  it('renders the rail slots, the navigation landmark, the top bar and the main region', () => {
    atWidth(true);
    renderThemed(frame());
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('img', { name: 'Upmo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('Search and bell')).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Tasks' }));
  });

  it('links "Skip to content" to the main region', () => {
    atWidth(true);
    renderThemed(frame());
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip.getAttribute('href')).toBe(`#${screen.getByRole('main').id}`);
  });

  it('marks the active item as the current page and shows its count', () => {
    atWidth(true);
    renderThemed(frame());
    const tasks = screen.getByRole('link', { name: /Tasks/ });
    expect(tasks).toHaveAttribute('aria-current', 'page');
    expect(tasks).toHaveTextContent('3');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('names a section with its label', () => {
    atWidth(true);
    renderThemed(frame());
    expect(screen.getByRole('group', { name: 'Workspace' })).toBeInTheDocument();
  });

  it('opens and closes a nested group', () => {
    atWidth(true);
    renderThemed(frame());
    const group = screen.getByRole('button', { name: /Management/ });
    expect(group).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Members' })).toBeInTheDocument();
  });

  it('collapses to the icon rail, keeping labels as accessible names and going compact', async () => {
    atWidth(true);
    const { container } = renderThemed(frame());
    const toggle = screen.getByRole('button', { name: 'Collapse navigation' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('link', { name: /Tasks/ })).toHaveAttribute('aria-current', 'page');
    expect(container.querySelector('.upmo-wordmark--compact')).toBeTruthy();
    // The count becomes a dot on the icon.
    expect(container.querySelector('.upmo-nav-item__dot')).toBeTruthy();
  });

  it('opens a group as a flyout menu in the icon rail, with menu semantics on the button', async () => {
    atWidth(true);
    renderThemed(frame({ defaultCollapsed: true }));
    const trigger = screen.getByRole('button', { name: /Management/ });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(await screen.findByRole('menuitem', { name: 'Members' })).toHaveAttribute('href', '/admin/members');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu').id).toBe(trigger.getAttribute('aria-controls'));
  });

  it('keeps a group count on the rail trigger: a dot, and in the accessible name', () => {
    atWidth(true);
    renderThemed(frame({ defaultCollapsed: true }));
    const trigger = screen.getByRole('button', { name: 'Management, 2' });
    expect(trigger.querySelector('.upmo-nav-item__dot')).toBeTruthy();
  });

  it('shows a group count beside its label on the full sidebar', () => {
    atWidth(true);
    renderThemed(frame());
    expect(screen.getByRole('button', { name: /Management/ })).toHaveTextContent('Management2');
  });

  it('opens a nested group as a submenu in the rail flyout, so no item is lost', async () => {
    atWidth(true);
    renderThemed(frame({ defaultCollapsed: true }));
    fireEvent.click(screen.getByRole('button', { name: /Management/ }));
    const access = await screen.findByRole('menuitem', { name: 'Access' });
    expect(access).toHaveAttribute('aria-haspopup', 'menu');
    fireEvent.keyDown(access, { key: 'ArrowRight' });
    expect(await screen.findByRole('menuitem', { name: 'Roles' })).toHaveAttribute('href', '/admin/roles');
  });

  it('reports collapse changes when controlled', () => {
    atWidth(true);
    const onCollapsedChange = vi.fn();
    renderThemed(
      <AppFrame collapsed={false} onCollapsedChange={onCollapsedChange} navigation={<SideNav>{null}</SideNav>}>
        <p>Body</p>
      </AppFrame>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Collapse navigation' }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it('renders in all three themes', () => {
    atWidth(true);
    for (const theme of themes) {
      const { unmount } = renderThemed(frame(), theme);
      expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
      unmount();
    }
  });
});

describe('AppFrame rail group', () => {
  function railGroup(props: Partial<NavItemProps> = {}) {
    return (
      <AppFrame
        defaultCollapsed
        navigation={
          <SideNav>
            <NavItem label="Management" icon={<Icon concept="nav.settings" />} count={2} {...props}>
              <NavItem label="Members" href="/admin/members" active />
              <NavItem label="Access" opened={false} onOpenedChange={props.onOpenedChange}>
                <NavItem label="Roles" href="/admin/roles" />
              </NavItem>
            </NavItem>
          </SideNav>
        }
      >
        <h1>Tasks</h1>
      </AppFrame>
    );
  }

  it('names the trigger with the label and the count, kept apart', () => {
    atWidth(true);
    renderThemed(railGroup());
    expect(screen.getByRole('button', { name: 'Management, 2' })).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('shows the label tooltip on hover and on focus, and hides it while the flyout is open', async () => {
    atWidth(true);
    renderThemed(railGroup());
    const trigger = screen.getByRole('button', { name: 'Management, 2' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.mouseEnter(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Management');
    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    fireEvent.focus(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Management');
    fireEvent.click(trigger);
    await screen.findByRole('menu');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('calls onClick from the flyout trigger, and keeps the flyout out of the expanded state', async () => {
    atWidth(true);
    const onClick = vi.fn();
    const onOpenedChange = vi.fn();
    // A controlled, collapsed sidebar group: the flyout still opens on demand.
    renderThemed(railGroup({ onClick, opened: false, onOpenedChange }));
    const trigger = screen.getByRole('button', { name: 'Management, 2' });
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('menuitem', { name: 'Members' })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // A nested group held closed in the sidebar still opens as a submenu.
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Access' }), { key: 'ArrowRight' });
    expect(await screen.findByRole('menuitem', { name: 'Roles' })).toBeInTheDocument();
    expect(onOpenedChange).not.toHaveBeenCalled();
  });

  it('reports expand and collapse of the same group in the full sidebar', () => {
    atWidth(true);
    const onOpenedChange = vi.fn();
    renderThemed(
      <AppFrame
        navigation={
          <SideNav>
            <NavItem label="Management" onOpenedChange={onOpenedChange}>
              <NavItem label="Members" href="/admin/members" />
            </NavItem>
          </SideNav>
        }
      >
        <h1>Tasks</h1>
      </AppFrame>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Management' }));
    expect(onOpenedChange).toHaveBeenCalledWith(true);
  });

  it('marks the current page in the flyout with aria-current and the active styling', async () => {
    atWidth(true);
    renderThemed(railGroup());
    fireEvent.click(screen.getByRole('button', { name: 'Management, 2' }));
    const members = await screen.findByRole('menuitem', { name: 'Members' });
    expect(members).toHaveAttribute('aria-current', 'page');
    expect(members).toHaveAttribute('data-active');
  });

  it('opens the flyout at the inline end: right, and left in right-to-left', async () => {
    atWidth(true);
    const { unmount } = renderThemed(railGroup());
    fireEvent.click(screen.getByRole('button', { name: 'Management, 2' }));
    expect((await screen.findByRole('menu')).closest('[data-position]')).toHaveAttribute('data-position', 'right-start');
    unmount();
    renderThemed(
      <DirectionProvider initialDirection="rtl" detectDirection={false}>
        {railGroup()}
      </DirectionProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Management, 2' }));
    expect((await screen.findByRole('menu')).closest('[data-position]')).toHaveAttribute('data-position', 'left-start');
  });
});

describe('AppFrame at medium width', () => {
  it('shows the full header in the drawer while the rail behind it stays compact', async () => {
    atWidth('medium');
    const { container } = renderThemed(frame());
    const railHeader = container.querySelector('.upmo-app-frame__rail-header');
    expect(railHeader?.querySelector('.upmo-wordmark--compact')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog');
    const wordmark = within(drawer).getByRole('img', { name: 'Upmo' });
    expect(wordmark).not.toHaveClass('upmo-wordmark--compact');
  });

  it('shows the rail, and takes it out of the accessibility tree while the drawer is open', async () => {
    atWidth('medium');
    const { container } = renderThemed(frame());
    expect(screen.getAllByRole('navigation', { name: 'Main' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    await screen.findByRole('dialog');
    // jsdom does not drop inert subtrees from role queries; browsers do.
    expect(container.querySelector('.upmo-app-frame__rail')).toHaveAttribute('inert');
  });
});

describe('AppFrame controlled drawer', () => {
  const navigation = (
    <SideNav>
      <NavItem label="Home" href="/" onClick={(event) => event.preventDefault()} />
    </SideNav>
  );

  it('opens the drawer from a controlled drawerOpened at medium width', async () => {
    atWidth('medium');
    renderThemed(
      <AppFrame drawerOpened navigation={navigation}>
        <h1>Tasks</h1>
      </AppFrame>,
    );
    expect(await screen.findByRole('dialog', { name: 'Navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the drawer closed while drawerOpened is false, and asks to open it from the toggle', () => {
    atWidth('medium');
    const onDrawerOpenedChange = vi.fn();
    renderThemed(
      <AppFrame drawerOpened={false} onDrawerOpenedChange={onDrawerOpenedChange} navigation={navigation}>
        <h1>Tasks</h1>
      </AppFrame>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(onDrawerOpenedChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('starts open from defaultDrawerOpened and reports a close when uncontrolled', async () => {
    atWidth('medium');
    const onDrawerOpenedChange = vi.fn();
    renderThemed(
      <AppFrame defaultDrawerOpened onDrawerOpenedChange={onDrawerOpenedChange} navigation={navigation}>
        <h1>Tasks</h1>
      </AppFrame>,
    );
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' });
    fireEvent.click(within(drawer).getByRole('button', { name: 'Close navigation' }));
    expect(onDrawerOpenedChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('reports Escape, the close button and a chosen item through onDrawerOpenedChange(false)', async () => {
    atWidth('medium');
    const onDrawerOpenedChange = vi.fn();
    renderThemed(
      <AppFrame drawerOpened onDrawerOpenedChange={onDrawerOpenedChange} navigation={navigation}>
        <h1>Tasks</h1>
      </AppFrame>,
    );
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' });

    fireEvent.keyDown(drawer, { key: 'Escape' });
    expect(onDrawerOpenedChange).toHaveBeenCalledTimes(1);
    expect(onDrawerOpenedChange).toHaveBeenLastCalledWith(false);

    fireEvent.click(within(drawer).getByRole('button', { name: 'Close navigation' }));
    expect(onDrawerOpenedChange).toHaveBeenCalledTimes(2);
    expect(onDrawerOpenedChange).toHaveBeenLastCalledWith(false);

    fireEvent.click(within(drawer).getByRole('link', { name: 'Home' }));
    expect(onDrawerOpenedChange).toHaveBeenCalledTimes(3);
    expect(onDrawerOpenedChange).toHaveBeenLastCalledWith(false);
  });

  it('follows a parent that holds the state', async () => {
    atWidth('medium');
    function Parent() {
      const [opened, setOpened] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpened((o) => !o)}>
            Shortcut
          </button>
          <AppFrame drawerOpened={opened} onDrawerOpenedChange={setOpened} navigation={navigation}>
            <h1>Tasks</h1>
          </AppFrame>
        </>
      );
    }
    renderThemed(<Parent />);
    fireEvent.click(screen.getByRole('button', { name: 'Shortcut' }));
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' });
    fireEvent.click(within(drawer).getByRole('button', { name: 'Close navigation' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('ignores drawerOpened from md and keeps one exposed navigation', () => {
    atWidth(true);
    const { container } = renderThemed(
      <AppFrame drawerOpened navigation={navigation}>
        <h1>Tasks</h1>
      </AppFrame>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('.upmo-app-frame__rail')).not.toHaveAttribute('inert');
    const navs = exposedNavigations();
    expect(navs).toHaveLength(1);
    expect(navs[0]).toHaveAccessibleName('Main');
    expect(screen.getByRole('button', { name: 'Collapse navigation' })).toBeInTheDocument();
  });

  it('releases the inert rail when the viewport widens with the drawer open', async () => {
    const resizeTo = resizableWidth(false);
    const { container } = renderThemed(frame());
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    await screen.findByRole('dialog', { name: 'Navigation' });
    const rail = container.querySelector('.upmo-app-frame__rail');
    expect(rail).toHaveAttribute('inert');

    resizeTo(true);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(container.querySelector('.upmo-app-frame__rail')).not.toHaveAttribute('inert');
    expect(exposedNavigations()).toHaveLength(1);

    // Narrowing again does not bring the old drawer back.
    resizeTo(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('moves focus to the navigation toggle when the viewport widens with focus inside the drawer', async () => {
    const resizeTo = resizableWidth(false);
    renderThemed(frame());
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' });
    const home = within(drawer).getByRole('link', { name: 'Home' });
    home.focus();
    expect(home).toHaveFocus();

    resizeTo(true);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Collapse navigation' })).toHaveFocus();
  });

  it('leaves focus alone when the viewport widens with the drawer closed', () => {
    const resizeTo = resizableWidth(false);
    renderThemed(
      <>
        <button type="button">Elsewhere</button>
        {frame()}
      </>,
    );
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    elsewhere.focus();
    resizeTo(true);
    expect(elsewhere).toHaveFocus();
  });

  it('tells a controlling parent the drawer closed when the viewport widens', async () => {
    const resizeTo = resizableWidth(false);
    const onDrawerOpenedChange = vi.fn();
    renderThemed(
      <AppFrame drawerOpened onDrawerOpenedChange={onDrawerOpenedChange} navigation={navigation}>
        <h1>Tasks</h1>
      </AppFrame>,
    );
    await screen.findByRole('dialog', { name: 'Navigation' });
    expect(onDrawerOpenedChange).not.toHaveBeenCalled();
    resizeTo(true);
    await waitFor(() => expect(onDrawerOpenedChange).toHaveBeenCalledWith(false));
  });
});

describe('AppFrame fill', () => {
  it('leaves the main region alone by default', () => {
    atWidth(true);
    renderThemed(frame());
    expect(screen.getByRole('main')).not.toHaveAttribute('data-fill');
  });

  it('marks main as a fill column and applies mainClassName', () => {
    atWidth(true);
    renderThemed(
      <AppFrame fill mainClassName="chat-main" navigation={<SideNav>{null}</SideNav>}>
        <p>Alert</p>
        <section>Chat</section>
      </AppFrame>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('data-fill', 'true');
    expect(main).toHaveClass('upmo-app-frame__main', 'chat-main');
    expect(main).toContainElement(screen.getByText('Chat'));
  });

  it('applies mainClassName without fill', () => {
    atWidth(true);
    renderThemed(
      <AppFrame mainClassName="chat-main" navigation={<SideNav>{null}</SideNav>}>
        <p>Body</p>
      </AppFrame>,
    );
    expect(screen.getByRole('main')).toHaveClass('chat-main');
    expect(screen.getByRole('main')).not.toHaveAttribute('data-fill');
  });
});

describe('AppFrame at phone width', () => {
  it('hides the rail and opens the navigation in a drawer', async () => {
    renderThemed(frame());
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
    const open = screen.getByRole('button', { name: 'Open navigation' });
    expect(open).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(open);
    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(within(drawer).getByRole('button', { name: 'Close navigation' })).toBeInTheDocument();
    // Full labels in the drawer, not the rail.
    expect(within(drawer).getByRole('button', { name: /Management/ })).toHaveAttribute('aria-expanded');
  });

  it('closes the drawer when an item is chosen', async () => {
    const onNavigate = vi.fn((event: MouseEvent<HTMLElement>) => event.preventDefault());
    renderThemed(frame({ onNavigate }));
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog');
    fireEvent.click(within(drawer).getByRole('button', { name: /Management/ }));
    fireEvent.click(await within(drawer).findByRole('link', { name: 'Members' }));
    expect(onNavigate).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Wordmark', () => {
  it('renders the full wordmark as a named image with token-coloured parts', () => {
    const { container } = renderThemed(<Wordmark />);
    expect(screen.getByRole('img', { name: 'Upmo' })).toBeInTheDocument();
    for (const part of ['up', 'mo', 'caret']) {
      expect(container.querySelector(`.upmo-wordmark__${part}`), part).toBeTruthy();
    }
  });

  it('renders the caret mark alone when compact, as a square', () => {
    const { container } = renderThemed(<Wordmark compact height={20} label="Upmo home" />);
    const svg = screen.getByRole('img', { name: 'Upmo home' });
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('hides a decorative wordmark from assistive tech, leaving the link its own name', () => {
    const { container } = renderThemed(
      <a href="/">
        <Wordmark decorative label="Ignored" />
        <span>Home</span>
      </a>,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName('Home');
    const svg = container.querySelector('svg.upmo-wordmark');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg).not.toHaveAttribute('aria-label');
  });

  it('hides a decorative compact mark too', () => {
    const { container } = renderThemed(<Wordmark compact decorative />);
    expect(container.querySelector('svg.upmo-wordmark--compact')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps the artwork ratio when sized by height', () => {
    renderThemed(<Wordmark height={28} />);
    const width = Number(screen.getByRole('img').getAttribute('width'));
    expect(width).toBeGreaterThan(28 * 1.8);
  });
});
