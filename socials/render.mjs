// Renders the social covers from banner.html into this folder.
//   pnpm --filter @upmo-ai/tokens build && node socials/render.mjs
// Needs Google Chrome (playwright-core drives it) and the token build for
// the colours and fonts.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../packages/components/package.json', import.meta.url));
const { chromium } = require('playwright-core');

const formats = {
  linkedin: [1584, 396],
  facebook: [1640, 624],
  twitter: [1500, 500],
  instagram: [1080, 1350],
};
const page_ = fileURLToPath(new URL('banner.html', import.meta.url));

const browser = await chromium.launch({ channel: 'chrome' });
for (const [name, [width, height]] of Object.entries(formats)) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`file://${page_}?f=${name}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, import.meta.url)) });
  await page.close();
}
await browser.close();
console.log(`socials: wrote ${Object.keys(formats).length} covers`);
