import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const browser = await chromium.launch({headless:true});
const out = path.resolve('comparison');
await fs.mkdir(out,{recursive:true});
const viewports = [[1920,1080],[1366,768],[390,844],[360,800]];
const results=[];
for(const [width,height] of viewports){
  const mobile=width<600;
  const contexts=await Promise.all([0,1].map(()=>browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile})));
  const pages=await Promise.all(contexts.map(c=>c.newPage()));
  const errors=[[],[]], failed=[[],[]];
  pages.forEach((p,i)=>{p.on('pageerror',e=>errors[i].push(String(e)));p.on('requestfailed',r=>failed[i].push({url:r.url(),failure:r.failure()}));});
  await Promise.all([pages[0].goto('https://20-10-vuive.kazvndc-edu.workers.dev/',{waitUntil:'domcontentloaded'}),pages[1].goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'})]);
  await Promise.all(pages.map(p=>p.evaluate(()=>document.fonts.ready)));
  await Promise.all(pages.map((p,i)=>p.screenshot({path:path.join(out,`${width}x${height}-${i?'local':'reference'}-initial.png`)})));
  await Promise.all(pages.map(p=>mobile?p.touchscreen.tap(width/2,height/2):p.mouse.click(width/2,height/2)));
  await Promise.all(pages.map(p=>p.waitForTimeout(1100)));
  await Promise.all(pages.map((p,i)=>p.screenshot({path:path.join(out,`${width}x${height}-${i?'local':'reference'}-first.png`)})));
  const state=await Promise.all(pages.map(p=>p.evaluate(()=>({title:document.title,text:[...document.querySelectorAll('.text-layer.hien-thi')].map(e=>e.innerText),audio:(()=>{const a=document.querySelector('audio');return {paused:a.paused,time:a.currentTime,duration:a.duration}})(),sizes:[document.documentElement.scrollWidth,document.documentElement.scrollHeight]}))));
  results.push({viewport:[width,height],state,errors,failed});
  await Promise.all(contexts.map(c=>c.close()));
}
await browser.close();
await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
