// Theme and width controls for the live previews. The theme choice is stored and applies to every preview.
(() => {
  const key = 'upmo-ds-preview-theme';
  const themes = ['light', 'dark', 'hc'];
  const stored = () => {
    try {
      const t = localStorage.getItem(key);
      return themes.includes(t) ? t : 'light';
    } catch {
      return 'light';
    }
  };

  const setTheme = (theme) => {
    for (const b of document.querySelectorAll('[data-theme-choice]')) {
      b.setAttribute('aria-pressed', String(b.dataset.themeChoice === theme));
    }
    for (const preview of document.querySelectorAll('.ds-preview')) {
      const frame = preview.querySelector('iframe');
      const src = `${frame.dataset.src}?theme=${theme}`;
      preview.querySelector('.ds-preview-open').href = src;
      const doc = frame.getAttribute('src') ? frame.contentDocument : null;
      // A loaded preview switches in place so its demo state survives; otherwise load it with the theme.
      if (doc && doc.readyState === 'complete' && doc.URL !== 'about:blank') {
        doc.documentElement.setAttribute('data-theme', theme);
      } else {
        frame.src = src;
      }
    }
  };

  // The dsCard height is the minimum; a narrower column than the design card makes content wrap, so grow to fit.
  const fit = (frame) => {
    const doc = frame.contentDocument;
    if (!doc || doc.URL === 'about:blank') return;
    const min = Number(frame.dataset.minHeight);
    frame.style.height = `${min}px`;
    frame.style.height = `${Math.max(min, doc.documentElement.scrollHeight)}px`;
  };

  const setWidth = (preview, width) => {
    const frame = preview.querySelector('iframe');
    const full = preview.dataset.width ? `${preview.dataset.width}px` : '100%';
    frame.style.width = width === 'full' ? full : `${width}px`;
    for (const b of preview.querySelectorAll('[data-width-choice]')) {
      b.setAttribute('aria-pressed', String(b.dataset.widthChoice === width));
    }
    requestAnimationFrame(() => fit(frame));
  };

  document.addEventListener('click', (e) => {
    const theme = e.target.closest('[data-theme-choice]');
    if (theme) {
      try {
        localStorage.setItem(key, theme.dataset.themeChoice);
      } catch {}
      setTheme(theme.dataset.themeChoice);
      return;
    }
    const width = e.target.closest('[data-width-choice]');
    if (width) setWidth(width.closest('.ds-preview'), width.dataset.widthChoice);
  });

  const init = () => {
    if (!document.querySelector('.ds-preview')) return;
    for (const preview of document.querySelectorAll('.ds-preview')) {
      const frame = preview.querySelector('iframe');
      frame.addEventListener('load', () => {
        fit(frame);
        frame.contentDocument?.fonts.ready.then(() => fit(frame));
        // Accordions and other toggles change the content height after load.
        const body = frame.contentDocument?.body;
        if (body) new ResizeObserver(() => fit(frame)).observe(body);
      });
      setWidth(preview, 'full');
    }
    setTheme(stored());
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
