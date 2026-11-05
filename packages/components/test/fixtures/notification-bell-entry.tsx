// Browser entry for notification-bell.browser.test.ts. It is bundled by esbuild
// and loaded into a real Chromium page; it is not imported by jsdom tests.
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '../../src/styles.css';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ApprovalCard, NotificationBell, NotificationItem, UpmoProvider } from '../../src/index.ts';

function Page() {
  const [approved, setApproved] = useState(0);
  return (
    <UpmoProvider theme="light">
      <NotificationBell count={1}>
        <NotificationItem title="Needs an answer" unread>
          <ApprovalCard action="Use the Q3 workbook?" onApprove={() => setApproved((n) => n + 1)} />
        </NotificationItem>
      </NotificationBell>
      <output aria-label="Approvals">{approved}</output>
    </UpmoProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
