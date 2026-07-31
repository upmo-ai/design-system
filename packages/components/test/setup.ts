import '@testing-library/jest-dom/vitest';

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

// jsdom lacks Element.scrollIntoView, which EventStream calls to follow the live
// edge. A no-op stub lets the follow effect run in tests.
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
