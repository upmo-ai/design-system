import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import faviconSource from '../../../packages/brand/assets/web/favicon.svg?raw';

// The brand kit files from @upmo-ai/brand, resolved to URLs by Vite.
const svg = import.meta.glob('../../../packages/brand/assets/svg/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const web = import.meta.glob('../../../packages/brand/assets/web/*.{svg,png}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const urlFor = (files: Record<string, string>, name: string): string => {
  const hit = Object.entries(files).find(([path]) => path.endsWith(`/${name}`));
  if (!hit) throw new Error(`The brand kit has no file named ${name}`);
  return hit[1];
};

type Ground = 'light' | 'dark';

// Each tile fixes its own theme so a dark-ground variant always shows on a dark
// ground. Forced colours would repaint the ground with the system canvas and
// hide a white mark on it, so the tile opts out and keeps its own ground.
function Frame({ name, ground, children }: { name: string; ground: Ground; children: ReactNode }) {
  return (
    <figure style={{ margin: 0, width: 240 }}>
      <div
        data-theme={ground}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 120,
          background: 'var(--surface-000)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          forcedColorAdjust: 'none',
        }}
      >
        {children}
      </div>
      <figcaption style={{ marginTop: 'var(--space-2)', color: 'var(--ink-muted)' }}>{name}</figcaption>
    </figure>
  );
}

function Tile({ name, ground, src, width }: { name: string; ground: Ground; src: string; width: number }) {
  return (
    <Frame name={name} ground={ground}>
      <img src={src} width={width} alt={`Upmo ${name}`} />
    </Frame>
  );
}

// favicon.svg recolours itself with prefers-color-scheme, which an <img> takes
// from the system and never from the tile around it. This preview draws the
// file's own geometry inline and takes its stroke from the tile's theme, so
// the light and dark tiles show the two colours the favicon switches between.
function faviconAttribute(name: string): string {
  const value = faviconSource.match(new RegExp(`\\s${name}="([^"]+)"`))?.[1];
  if (!value) throw new Error(`favicon.svg has no ${name} attribute`);
  return value;
}

function FaviconTile({ name, ground, size }: { name: string; ground: Ground; size: number }) {
  return (
    <Frame name={name} ground={ground}>
      <svg width={size} height={size} viewBox={faviconAttribute('viewBox')} role="img" aria-label={`Upmo ${name}`}>
        <path
          d={faviconAttribute('d')}
          fill="none"
          strokeWidth={faviconAttribute('stroke-width')}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: 'var(--emerald)' }}
        />
      </svg>
    </Frame>
  );
}

const grid = { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' } as const;

const meta: Meta = {
  title: 'Brand/Asset kit',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

export const Wordmark: Story = {
  render: () => (
    <div style={grid}>
      <Tile name="light" ground="light" src={urlFor(svg, 'wordmark-light.svg')} width={160} />
      <Tile name="dark" ground="dark" src={urlFor(svg, 'wordmark-dark.svg')} width={160} />
      <Tile name="mono black" ground="light" src={urlFor(svg, 'wordmark-mono-black.svg')} width={160} />
      <Tile name="mono white" ground="dark" src={urlFor(svg, 'wordmark-mono-white.svg')} width={160} />
    </div>
  ),
};

export const Caret: Story = {
  render: () => (
    <div style={grid}>
      <Tile name="light" ground="light" src={urlFor(svg, 'caret-light.svg')} width={64} />
      <Tile name="dark" ground="dark" src={urlFor(svg, 'caret-dark.svg')} width={64} />
      <Tile name="mono black" ground="light" src={urlFor(svg, 'caret-mono-black.svg')} width={64} />
      <Tile name="mono white" ground="dark" src={urlFor(svg, 'caret-mono-white.svg')} width={64} />
    </div>
  ),
};

export const AppIcons: Story = {
  render: () => (
    <div style={grid}>
      <FaviconTile name="favicon.svg" ground="light" size={32} />
      <FaviconTile name="favicon.svg on dark" ground="dark" size={32} />
      <Tile name="apple-touch-icon.png" ground="light" src={urlFor(web, 'apple-touch-icon.png')} width={90} />
      <Tile name="icon-192.png" ground="light" src={urlFor(web, 'icon-192.png')} width={96} />
      <Tile name="icon-512.png" ground="light" src={urlFor(web, 'icon-512.png')} width={96} />
      <Tile name="icon-512-maskable.png" ground="light" src={urlFor(web, 'icon-512-maskable.png')} width={96} />
    </div>
  ),
};

export const ShareImage: Story = {
  render: () => (
    <img
      src={urlFor(web, 'og.png')}
      width={600}
      height={315}
      alt="Upmo share image: the wordmark on the light ground"
      style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
    />
  ),
};
