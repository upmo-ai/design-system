// Browser entry for app-frame-fill.browser.test.ts. It is bundled by esbuild
// and loaded into a real Chromium page; it is not imported by jsdom tests.
//
// `window.upmoFillScene` ('chat' | 'overflow' | 'plain') is read when the script
// runs: a chat-like page under an alert, a last child taller than the viewport
// (with a button at its top to scroll to), and the same chat page in a frame
// without `fill`. `window.upmoFillMotion` ('reduce' | 'no-preference', default
// 'reduce') sets the provider's reduced motion, so a test can see transitions.
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '../../src/styles.css';
import { createRoot } from 'react-dom/client';
import { AppFrame, Icon, NavItem, NavSection, SideNav, StatusAlert, UpmoProvider, Wordmark } from '../../src/index.ts';

declare global {
  interface Window {
    upmoFillScene?: 'chat' | 'overflow' | 'plain';
    upmoFillMotion?: 'reduce' | 'no-preference';
  }
}

function Chat() {
  return (
    <section className="chat-page" aria-label="Messages" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="chat-thread" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
        {Array.from({ length: 60 }, (_, i) => (
          <p key={i}>Message {i + 1}</p>
        ))}
      </div>
      <div className="chat-composer" style={{ padding: 12 }}>
        <button type="button">Send</button>
      </div>
    </section>
  );
}

function Page() {
  const scene = window.upmoFillScene ?? 'chat';
  return (
    <UpmoProvider theme="light" reducedMotion={window.upmoFillMotion ?? 'reduce'}>
      <AppFrame
        fill={scene !== 'plain'}
        mainClassName="app-main"
        header={<Wordmark />}
        topBar={<span>Search</span>}
        navigation={
          <SideNav>
            <NavSection>
              <NavItem label="Home" icon={<Icon concept="nav.home" />} href="/" />
              <NavItem label="Chat" icon={<Icon concept="nav.chats" />} href="/chat" active />
            </NavSection>
          </SideNav>
        }
      >
        <StatusAlert tone="attention" title="Read only">
          This workspace is paused.
        </StatusAlert>
        {scene === 'overflow' ? (
          <div className="tall" style={{ height: 3000 }}>
            <button type="button" className="tall-target">
              Target
            </button>
            Tall page
          </div>
        ) : (
          <Chat />
        )}
      </AppFrame>
    </UpmoProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
