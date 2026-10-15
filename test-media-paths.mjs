import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const html = await fs.readFile('index.html');
const config = JSON.parse(await fs.readFile('public/content.json', 'utf8'));
config.images = {
  twoPeople: '/media/two.svg',
  womanDesktop: '/media/desktop.svg',
  womanMobile: '/media/mobile.svg',
};
config.music = '/media/song.wav';

const server = createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(html);
  } else {
    response.writeHead(404);
    response.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

const wav = Buffer.alloc(44 + 800, 128);
wav.write('RIFF', 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(8000, 24);
wav.writeUInt32LE(8000, 28);
wav.writeUInt16LE(1, 32);
wav.writeUInt16LE(8, 34);
wav.write('data', 36);
wav.writeUInt32LE(800, 40);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/public/content.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(config) }));
  await page.route('**/public/media/**', route => {
    if (route.request().url().endsWith('.wav')) return route.fulfill({ status: 200, contentType: 'audio/wav', body: wav });
    return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="red"/></svg>' });
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => ['anh-hai-nguoi', 'woman-complete-mobile'].every(id => document.getElementById(id)?.naturalWidth === 2));
  const result = await page.evaluate(() => ({
    twoPeople: document.getElementById('anh-hai-nguoi').src,
    womanDesktop: getComputedStyle(document.getElementById('woman-scene')).backgroundImage,
    womanMobile: document.getElementById('woman-complete-mobile').src,
    music: document.getElementById('tiny-soundtrack').src,
  }));
  for (const [key, file] of Object.entries({ twoPeople: 'two.svg', womanDesktop: 'desktop.svg', womanMobile: 'mobile.svg', music: 'song.wav' })) {
    if (!result[key].includes(`/public/media/${file}`)) throw new Error(`${key}: ${result[key]}`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({ result, errors }, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
