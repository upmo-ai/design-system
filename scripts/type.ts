// A `font-size:` whose value holds a raw px/rem length outside var(...). Sizes
// come from the --text-* type tokens; a deliberate exception carries an
// `/* off-scale: reason */` comment on the same line.
const fontSize = /font-size\s*:\s*([^;}]*)/g;
const rawLength = /\d*\.?\d+(?:px|rem)\b/;
const varCall = /var\([^()]*\)/g;

export function findRawFontSizes(text: string): { line: number; match: string }[] {
  return text.split('\n').flatMap((line, i) => {
    if (line.includes('/* off-scale:')) return [];
    return [...line.matchAll(fontSize)]
      .filter((m) => rawLength.test(stripVars(m[1])))
      .map((m) => ({ line: i + 1, match: m[0].trim() }));
  });
}

function stripVars(value: string): string {
  let prev: string;
  do {
    prev = value;
    value = value.replace(varCall, '');
  } while (value !== prev);
  return value;
}
