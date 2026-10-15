import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.TEST_URL || 'http://127.0.0.1:4173/';
const output = 'comparison/personal-ending';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const [width, height] of [[1366, 768], [390, 844]]) {
  const mobile = width < 600;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await context.route(/^https:\/\/(www\.tiktok\.com|github\.com)\//, route => route.fulfill({ status: 200, contentType: 'text/html', body: 'link opened' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const advance = async () => mobile
    ? page.touchscreen.tap(Math.floor(width / 2), Math.floor(height / 2))
    : page.mouse.click(Math.floor(width / 2), Math.floor(height / 2));

  await advance();
  await page.waitForFunction(() => document.querySelector('audio')?.currentTime >= 9.69, { timeout: 18000 });
  for (let step = 2; step <= 13; step++) {
    await advance();
    await page.waitForTimeout(step === 5 ? 2500 : 1600);
  }
  await page.locator('#share-fuel-button').click({ timeout: 5000 });
  await page.waitForTimeout(5500);
  await advance();
  await page.waitForTimeout(1200);
  await advance();
  await page.locator('#tiny-shop-scene.shop-visible').waitFor({ timeout: 6000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${output}/${width}x${height}-actual-flow.png` });

  const state = await page.evaluate(() => ({
    sceneVisible: document.getElementById('tiny-shop-scene')?.classList.contains('shop-visible'),
    eyesMoved: !!document.querySelector('#shop-tiny-host #khung-mat'),
    butterflyPresent: !!document.getElementById('shop-flying-butterfly'),
    productCount: document.querySelectorAll('#tiny-shop-scene .shop-product').length,
    linkCount: document.querySelectorAll('#tiny-shop-scene .creator-link').length,
  }));
  if (errors.length || !state.sceneVisible || !state.eyesMoved || !state.butterflyPresent || state.productCount || state.linkCount !== 2) {
    throw new Error(JSON.stringify({ viewport: [width, height], errors, state }));
  }

  const opened = [];
  for (const id of ['ending-tiktok', 'ending-github']) {
    const link = page.locator(`#${id}`);
    const [popup] = await Promise.all([page.waitForEvent('popup'), mobile ? link.tap() : link.click()]);
    await popup.waitForLoadState('domcontentloaded');
    opened.push(popup.url());
    await popup.close();
  }
  if (!opened[0].includes('tiktok.com/@congabuon') || !opened[1].includes('github.com/Kakajshd')) {
    throw new Error(JSON.stringify({ viewport: [width, height], opened }));
  }
  results.push({ viewport: [width, height], errors, state, opened });
  await context.close();
}
await browser.close();
await fs.writeFile(`${output}/actual-flow-results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
