// Browser entry for app-frame-drawer.browser.test.ts. It is bundled by esbuild
// and loaded into a real Chromium page; it is not imported by jsdom tests.
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '../../src/styles.css';
import { createRoot } from 'react-dom/client';
import { AppFrame, Icon, NavItem, NavSection, SideNav, UpmoProvider, Wordmark } from '../../src/index.ts';

function Page() {
  return (
    <UpmoProvider theme="light" reducedMotion="reduce">
      <AppFrame
        header={<Wordmark />}
        footer={<button type="button">Account</button>}
        topBar={<span>Search and bell</span>}
        navigation={
          <SideNav>
            <NavSection>
              <NavItem label="Home" icon={<Icon concept="nav.home" />} href="/" />
              <NavItem label="Tasks" icon={<Icon concept="nav.tasks" />} href="/tasks" active />
              <NavItem label="Agents" icon={<Icon concept="nav.agents" />} href="/agents" />
            </NavSection>
            <NavSection label="Workspace">
              <NavItem label="Connections" icon={<Icon concept="object.connector" />} href="/connections" />
              <NavItem label="Settings" icon={<Icon concept="nav.settings" />} href="/settings" />
            </NavSection>
          </SideNav>
        }
      >
        <h1>Tasks</h1>
      </AppFrame>
    </UpmoProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
