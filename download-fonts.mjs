import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ headless:true });
const page = await browser.newPage();
const stylesheet = await page.request.get('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');
if (!stylesheet.ok()) throw new Error(`Font CSS HTTP ${stylesheet.status()}`);
let css = await stylesheet.text();
await fs.mkdir('public/fonts',{recursive:true});
const urls = [...new Set([...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map(x=>x[1]))];
for(let i=0;i<urls.length;i++) {
  const response = await page.request.get(urls[i]);
  if(!response.ok()) throw new Error(`Font HTTP ${response.status()}`);
  const name = `courier-prime-${i+1}.woff2`;
  await fs.writeFile(`public/fonts/${name}`,await response.body());
  css = css.replaceAll(urls[i],`/fonts/${name}`);
}
await fs.writeFile('public/fonts.css',css);
console.log(`Saved ${urls.length} local font files`);
await browser.close();
