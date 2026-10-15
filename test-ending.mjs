import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.TEST_URL || 'http://127.0.0.1:4173/';
const output = 'comparison/personal-ending';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const [width, height] of [[1920, 1080], [1366, 768], [390, 844], [360, 800]]) {
  const mobile = width < 600;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', response => {
    if (response.status() >= 400 && !response.url().endsWith('/content.json')) failedRequests.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const scene = document.getElementById('tiny-shop-scene');
    const frame = document.getElementById('khung-mat');
    const host = document.getElementById('shop-tiny-host');
    document.getElementById('tiny-reality-scene')?.classList.remove('reality-visible');
    scene.classList.add('shop-visible');
    scene.setAttribute('aria-hidden', 'false');
    host.appendChild(frame);
  });
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `${output}/${width}x${height}.png`, fullPage: false });
  const details = await page.evaluate(() => {
    const scene = document.getElementById('tiny-shop-scene');
    const panel = document.querySelector('.creator-panel');
    const links = [...document.querySelectorAll('.creator-link')];
    const rect = panel.getBoundingClientRect();
    return {
      title: document.querySelector('.shop-heading')?.innerText,
      panel: { left: Math.round(rect.left), top: Math.round(rect.top), right: Math.round(rect.right), bottom: Math.round(rect.bottom) },
      layoutViewport: { innerWidth, sceneWidth: Math.round(scene.getBoundingClientRect().width), visualWidth: Math.round(visualViewport.width) },
      links: links.map(a => ({ text: a.innerText, href: a.href, visible: a.getBoundingClientRect().width > 0 })),
      oldAds: scene.querySelectorAll('.shop-product,.dalabs-footer,#shop-product-modal').length,
      oldBrand: /DA Labs|dalabs28|Shopee/.test(scene.textContent),
      horizontalOverflow: scene.scrollWidth > scene.clientWidth + 1,
      font: getComputedStyle(panel).fontFamily,
      eyesInEnding: !!document.querySelector('#shop-tiny-host #khung-mat'),
    };
  });
  if (errors.length || failedRequests.length || details.oldAds || details.oldBrand || details.horizontalOverflow || !details.eyesInEnding || details.links.length !== 2 || details.links.some(x => !x.visible)) {
    throw new Error(JSON.stringify({ viewport: [width, height], errors, failedRequests, details }));
  }
  results.push({ viewport: [width, height], errors, failedRequests, ...details });
  await context.close();
}
const custom = JSON.parse(await fs.readFile('public/content.json', 'utf8'));
custom.ending.message = 'lời nhắn tùy chỉnh';
custom.ending.titleSuffix = 'của bạn ✦';
custom.ending.tiktokLabel = '@tenmoi';
custom.ending.tiktokUrl = 'https://www.tiktok.com/@tenmoi';
custom.ending.githubLabel = 'du-an-moi';
custom.ending.githubUrl = 'https://github.com/du-an-moi';
const configContext = await browser.newContext();
await configContext.route(/\/(?:public\/)?content\.json$/, route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(custom) }));
const configPage = await configContext.newPage();
await configPage.goto(base, { waitUntil: 'domcontentloaded' });
const customResult = await configPage.evaluate(() => ({
  message: document.getElementById('ending-message')?.textContent,
  titleSuffix: document.getElementById('ending-title-suffix')?.textContent,
  tiktok: document.getElementById('ending-tiktok')?.href,
  tiktokLabel: document.getElementById('ending-tiktok-label')?.textContent,
  github: document.getElementById('ending-github')?.href,
  githubLabel: document.getElementById('ending-github-label')?.textContent,
}));
if (customResult.message !== custom.ending.message || customResult.titleSuffix !== custom.ending.titleSuffix || customResult.tiktok !== custom.ending.tiktokUrl || customResult.tiktokLabel !== custom.ending.tiktokLabel || customResult.github !== custom.ending.githubUrl || customResult.githubLabel !== custom.ending.githubLabel) {
  throw new Error(`Ending config did not apply: ${JSON.stringify(customResult)}`);
}
results.push({ customConfig: customResult });
await configContext.close();
await browser.close();
await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
