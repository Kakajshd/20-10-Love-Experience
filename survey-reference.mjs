import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const url = 'https://20-10-vuive.kazvndc-edu.workers.dev/';
const out = path.resolve('reference');
const browser = await chromium.launch({ headless: true });
const report = {};
for (const [name, viewport] of Object.entries({ desktop: {width:1366,height:768}, mobile: {width:390,height:844} })) {
  const context = await browser.newContext({ viewport, isMobile:name==='mobile', hasTouch:name==='mobile', deviceScaleFactor:1 });
  const page = await context.newPage();
  const states = [];
  await page.goto(url,{waitUntil:'domcontentloaded'});
  const take = async (label) => {
    const state = await page.evaluate(() => ({
      visibleText: [...document.querySelectorAll('.text-layer')].filter(x=>getComputedStyle(x).opacity !== '0' && x.classList.contains('hien-thi')).map(x=>({id:x.id,text:x.innerText})),
      active: [...document.querySelectorAll('section, [id$="-stage"]')].filter(x=>x.classList.contains('hien-thi') || x.classList.contains('show') || x.classList.contains('is-visible')).map(x=>x.id).filter(Boolean),
      audio: (()=>{ const a=document.querySelector('audio'); return a ? {time:a.currentTime,paused:a.paused,duration:a.duration,src:a.currentSrc.slice(0,40)} : null; })(),
      buttons: [...document.querySelectorAll('button')].filter(x=>{const s=getComputedStyle(x);return s.display!=='none' && s.visibility!=='hidden' && s.opacity!=='0'}).map(x=>({id:x.id,text:x.innerText.slice(0,90)})),
      size:[document.documentElement.scrollWidth,document.documentElement.scrollHeight]
    }));
    states.push({label,...state});
    await page.screenshot({path:path.join(out,`${name}-${label}.png`)});
  };
  await take('start');
  await page.waitForTimeout(10000);
  await take('ready');
  for(let i=1;i<=16;i++) {
    if(name==='mobile') await page.touchscreen.tap(Math.floor(viewport.width/2),Math.floor(viewport.height/2));
    else await page.mouse.click(viewport.width/2, viewport.height/2);
    await page.waitForTimeout(i===3 ? 1700 : 1150);
    await take(`step-${String(i).padStart(2,'0')}`);
  }
  report[name]=states;
  await context.close();
}
await fs.writeFile(path.join(out,'survey.json'),JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([name,states])=>[name,states.map(x=>({label:x.label,visibleText:x.visibleText,active:x.active,audio:x.audio,buttons:x.buttons}))])),null,2));
