import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const browser=await chromium.launch({headless:true});
const out=path.resolve('comparison/modal');await fs.mkdir(out,{recursive:true});
const results=[];
for(const [width,height] of [[1366,768],[390,844]]){
  const mobile=width<600;
  const contexts=await Promise.all([0,1].map(()=>browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1})));
  const pages=await Promise.all(contexts.map(c=>c.newPage()));
  await Promise.all([pages[0].goto('https://20-10-vuive.kazvndc-edu.workers.dev/'),pages[1].goto('http://127.0.0.1:5173/')]);
  await Promise.all(pages.map(p=>p.evaluate(()=>{document.querySelector('#tiny-shop-scene').classList.add('shop-visible');document.querySelector('#tiny-shop-scene').setAttribute('aria-hidden','false')})));
  await Promise.all(pages.map(p=>p.waitForTimeout(2200)));
  if(!mobile){await Promise.all(pages.map(p=>p.locator('.shop-product').first().hover()));await Promise.all(pages.map(p=>p.waitForTimeout(300)));}
  for(let i=0;i<2;i++) await pages[i].screenshot({path:path.join(out,`${width}x${height}-${i?'local':'reference'}-shop.png`)});
  await Promise.all(pages.map(p=>p.locator('.shop-product').first().click()));
  await Promise.all(pages.map(p=>p.waitForTimeout(900)));
  for(let i=0;i<2;i++) await pages[i].screenshot({path:path.join(out,`${width}x${height}-${i?'local':'reference'}-modal.png`)});
  results.push({viewport:[width,height],modal:await Promise.all(pages.map(p=>p.locator('#shop-product-modal').getAttribute('class')))});
  await Promise.all(pages.map(p=>p.keyboard.press('Escape')));
  results.at(-1).afterEscape=await Promise.all(pages.map(p=>p.locator('#shop-product-modal').getAttribute('class')));
  await Promise.all(contexts.map(c=>c.close()));
}
await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
await browser.close();
