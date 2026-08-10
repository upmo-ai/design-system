import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, '../src/styles.css'), 'utf8');

/** The declarations of the rule whose selector list matches exactly. */
function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`No rule for ${selector}`);
  return match[1];
}

describe('styles.css focus', () => {
  it('gives inputs the one focus ring: 2px solid --focus, 2px offset', () => {
    const body = rule('.upmo-input:focus-visible,\n.upmo-input:focus-within');
    expect(body).toContain('outline: 2px solid var(--focus)');
    expect(body).toContain('outline-offset: 2px');
    expect(body).not.toContain('box-shadow');
  });

  it("points Mantine's focus ring at the --focus token", () => {
    expect(rule('.mantine-focus-auto:focus-visible,\n.mantine-focus-always:focus')).toContain(
      'outline-color: var(--focus)',
    );
  });
});

describe('styles.css control heights', () => {
  it.each([
    ['xs', '--control-sm'],
    ['sm', '--control-sm'],
    ['md', '--control-md'],
    ['lg', '--control-lg'],
  ])('pins Button %s to %s', (size, token) => {
    expect(rule(`.upmo-button[data-size='${size}']`)).toContain(`height: var(${token})`);
  });

  it('pins IconButton sizes to the control tokens', () => {
    const body = rule('.upmo-icon-button');
    expect(body).toContain('--ai-size-md: var(--control-sm)');
    expect(body).toContain('--ai-size-lg: var(--control-md)');
    expect(body).toContain('--ai-size-xl: var(--control-lg)');
  });
});
