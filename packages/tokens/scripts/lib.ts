type Value = string | Record<string, string>;

interface Token {
  name: string;
  value: Value;
  usage?: string;
}

interface TypeStyle {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  family?: string;
}

interface Family {
  note?: string;
  tokens: Token[];
}

export interface TokenFile {
  name: string;
  color: { themes: { id: string; name: string }[]; tokens: Token[] };
  shadow?: Family;
  type: {
    families: Record<string, string>;
    groups: { name: string; family: string; styles: TypeStyle[] }[];
  };
  spacing?: Family;
  radius?: Family;
  size?: Family;
  breakpoint?: Family;
  zIndex?: Family;
  motion?: Family;
}

export const scalarFamilies = ['spacing', 'radius', 'size', 'breakpoint', 'zIndex', 'motion'] as const;

// A themed value missing a theme (shadows have no hc) falls back to the first theme.
export function valueFor(token: Token, theme: string, first: string): string {
  const v = token.value;
  if (typeof v === 'string') return v;
  return v[theme] ?? v[first];
}

export function toCss(t: TokenFile): string {
  const themes = t.color.themes.map((th) => th.id);
  const first = themes[0];
  const lines = [`/* ${t.name}, generated from tokens.json */`];
  themes.forEach((theme, i) => {
    lines.push(`${i === 0 ? `:root, [data-theme="${theme}"]` : `[data-theme="${theme}"]`} {`);
    for (const tok of t.color.tokens) {
      let v = valueFor(tok, theme, first);
      if (v.startsWith('{')) v = `var(--${v.slice(1, -1)})`;
      lines.push(`  --${tok.name}: ${v};`);
    }
    for (const tok of t.shadow?.tokens ?? []) lines.push(`  --${tok.name}: ${valueFor(tok, theme, first)};`);
    lines.push('}');
  });
  lines.push(':root {');
  for (const fam of scalarFamilies) {
    for (const tok of t[fam]?.tokens ?? []) lines.push(`  --${tok.name}: ${tok.value};`);
  }
  for (const [k, v] of Object.entries(t.type.families)) lines.push(`  --font-${k}: ${v};`);
  lines.push('}');
  for (const g of t.type.groups) {
    for (const s of g.styles) {
      const decl = [
        `font-family: var(--font-${s.family ?? g.family})`,
        `font-size: ${s.fontSize}`,
        `line-height: ${s.lineHeight}`,
        `font-weight: ${s.fontWeight}`,
      ];
      if (s.letterSpacing !== undefined) decl.push(`letter-spacing: ${s.letterSpacing}`);
      lines.push(`.${s.name} { ${decl.join('; ')}; }`);
    }
  }
  return lines.join('\n') + '\n';
}

// Plain data for the JS module: alias tokens ({name}) resolved to their value in each theme.
export function toData(t: TokenFile) {
  const themes = t.color.themes.map((th) => th.id);
  const first = themes[0];
  const byName = new Map(t.color.tokens.map((tok) => [tok.name, tok]));
  const resolve = (tok: Token, theme: string): string => {
    const v = valueFor(tok, theme, first);
    if (!v.startsWith('{')) return v;
    const target = byName.get(v.slice(1, -1));
    if (!target) throw new Error(`${tok.name} points at unknown token ${v}`);
    return resolve(target, theme);
  };
  const perTheme = (tok: Token, get: (tok: Token, theme: string) => string) =>
    Object.fromEntries(themes.map((theme) => [theme, get(tok, theme)]));
  const scalars = (fam: (typeof scalarFamilies)[number]) =>
    Object.fromEntries((t[fam]?.tokens ?? []).map((tok) => [tok.name, tok.value]));

  return {
    themes,
    color: Object.fromEntries(t.color.tokens.map((tok) => [tok.name, perTheme(tok, resolve)])),
    shadow: Object.fromEntries(
      (t.shadow?.tokens ?? []).map((tok) => [tok.name, perTheme(tok, (x, th) => valueFor(x, th, first))]),
    ),
    spacing: scalars('spacing'),
    radius: scalars('radius'),
    size: scalars('size'),
    breakpoint: scalars('breakpoint'),
    zIndex: scalars('zIndex'),
    motion: scalars('motion'),
    font: { ...t.type.families },
    typography: Object.fromEntries(
      t.type.groups.flatMap((g) =>
        g.styles.map((s) => {
          const style: Record<string, string | number> = {
            family: s.family ?? g.family,
            fontSize: s.fontSize,
            lineHeight: s.lineHeight,
            fontWeight: s.fontWeight,
          };
          if (s.letterSpacing !== undefined) style.letterSpacing = s.letterSpacing;
          return [s.name, style];
        }),
      ),
    ),
  };
}

function literalType(v: unknown, indent = ''): string {
  if (Array.isArray(v)) return `readonly [${v.map((x) => literalType(x)).join(', ')}]`;
  if (v !== null && typeof v === 'object') {
    const inner = indent + '  ';
    const rows = Object.entries(v).map(([k, x]) => `${inner}readonly ${JSON.stringify(k)}: ${literalType(x, inner)};`);
    return `{\n${rows.join('\n')}\n${indent}}`;
  }
  return JSON.stringify(v);
}

export function toModule(t: TokenFile): { js: string; dts: string } {
  const data = toData(t);
  const js = Object.entries(data).map(([k, v]) => `export const ${k} = ${JSON.stringify(v, null, 2)};`);
  const dts = Object.entries(data).map(([k, v]) => `export declare const ${k}: ${literalType(v)};`);
  dts.push(
    'export type Theme = (typeof themes)[number];',
    'export type ColorToken = keyof typeof color;',
    'export type TypeStyle = keyof typeof typography;',
  );
  const head = '// Generated from tokens.json by scripts/build.ts. Do not edit.\n';
  return { js: head + js.join('\n') + '\n', dts: head + dts.join('\n') + '\n' };
}
