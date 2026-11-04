import '@testing-library/jest-dom/vitest';

// Files that opt into the node environment (the real-browser tests) have no DOM
// to stub.
if (typeof window !== 'undefined') {
  // jsdom lacks matchMedia, which Mantine reads for colour scheme / reduced motion.
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }

  // jsdom lacks ResizeObserver, which Mantine's Select (ScrollArea) and Textarea
  // (Autosize) rely on. A no-op stub lets those components mount in tests.
  if (!('ResizeObserver' in globalThis)) {
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserver;
  }

  // jsdom lacks Element.scrollIntoView. EventStream no longer calls it (it scrolls
  // only its own list), but a test spies on it to prove that, which needs a stub.
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function scrollIntoView() {};
  }

  // jsdom lacks window.visualViewport and document.fonts, which Mantine's
  // autosizing Textarea (used by the chat Composer) subscribes to. Minimal
  // event-target stubs let autosize mount in tests.
  if (!window.visualViewport) {
    (window as unknown as { visualViewport: unknown }).visualViewport = {
      width: 1024,
      height: 768,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  }
  if (!('fonts' in document)) {
    (document as unknown as { fonts: unknown }).fonts = {
      addEventListener: () => {},
      removeEventListener: () => {},
      ready: Promise.resolve(),
    };
  }
}
