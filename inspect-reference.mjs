import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const base = 'https://20-10-vuive.kazvndc-edu.workers.dev/';
const out = path.resolve('reference');
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { base, pages: [] };

for (const [label, viewport] of Object.entries({ desktop: { width: 1366, height: 768 }, mobile: { width: 390, height: 844 } })) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: label === 'mobile', hasTouch: label === 'mobile' });
  const page = await context.newPage();
  const entry = { label, viewport, responses: [], errors: [], states: [] };
  page.on('response', response => entry.responses.push({ url: response.url(), status: response.status(), type: response.request().resourceType(), mime: response.headers()['content-type'] }));
  page.on('pageerror', error => entry.errors.push(String(error)));
  try {
    const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
    entry.status = response?.status();
    await page.screenshot({ path: path.join(out, `${label}-0.png`), fullPage: true });
    for (const ms of [1000, 3000, 6000, 10000]) {
      await page.waitForTimeout(ms === 1000 ? 1000 : ms - ({ 3000: 1000, 6000: 3000, 10000: 6000 })[ms]);
      await page.screenshot({ path: path.join(out, `${label}-${ms}.png`), fullPage: true });
      entry.states.push({ ms, text: (await page.locator('body').innerText()).slice(0, 3000), dom: await page.evaluate(() => ({ title: document.title, size: [document.documentElement.scrollWidth, document.documentElement.scrollHeight], nodes: [...document.querySelectorAll('button,a,input,canvas,video,audio,svg')].map(e => ({ tag: e.tagName, text: e.textContent?.trim().slice(0, 120), id: e.id, class: e.className?.baseVal ?? e.className, outer: e.outerHTML.slice(0, 350) })) })) });
    }
    await fs.writeFile(path.join(out, `${label}.html`), await page.content());
    const nodes = await page.locator('button, a, [role="button"]').all();
    for (let i = 0; i < nodes.length && i < 25; i++) {
      const node = nodes[i];
      const text = (await node.innerText().catch(() => '')).trim();
      const visible = await node.isVisible().catch(() => false);
      if (!visible) continue;
      try {
        await node.click({ timeout: 3000 });
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(out, `${label}-click-${i}.png`), fullPage: true });
        entry.states.push({ click: i, text, after: (await page.locator('body').innerText()).slice(0, 3000) });
      } catch (error) { entry.states.push({ click: i, text, error: String(error).slice(0, 200) }); }
    }
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, `${label}-scroll.png`), fullPage: true });
    entry.finalUrl = page.url();
  } catch (error) { entry.error = String(error); }
  report.pages.push(entry);
  await context.close();
}
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report.pages.map(p => ({ label: p.label, status: p.status, error: p.error, responseCount: p.responses.length, states: p.states.map(s => s.click !== undefined ? { click: s.click, text: s.text, after: s.after?.slice(0, 150) } : { ms: s.ms, text: s.text?.slice(0, 150) }) })), null, 2));
