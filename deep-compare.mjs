import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const browser=await chromium.launch({headless:true});
const out=path.resolve('comparison/deep');await fs.mkdir(out,{recursive:true});
const results=[];
for(const [width,height] of [[1366,768],[390,844]]){
  const mobile=width<600;
  const contexts=await Promise.all([0,1].map(()=>browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile})));
  const pages=await Promise.all(contexts.map(c=>c.newPage()));
  const errors=[[],[]];pages.forEach((p,i)=>p.on('pageerror',e=>errors[i].push(String(e))));
  await Promise.all([pages[0].goto('https://20-10-vuive.kazvndc-edu.workers.dev/'),pages[1].goto('http://127.0.0.1:5173/')]);
  const click=async p=>mobile?p.touchscreen.tap(Math.floor(width/2),Math.floor(height/2)):p.mouse.click(Math.floor(width/2),Math.floor(height/2));
  const record=async label=>{
    const states=await Promise.all(pages.map(async(p,i)=>{
      await p.screenshot({path:path.join(out,`${width}x${height}-${i?'local':'reference'}-${label}.png`)});
      return p.evaluate(()=>({visibleText:[...document.querySelectorAll('.text-layer.hien-thi')].map(e=>({id:e.id,text:e.innerText})),active:[...document.querySelectorAll('[id]')].filter(e=>e.classList.contains('hien-thi')||e.classList.contains('reality-visible')||e.classList.contains('show')).map(e=>e.id).filter(x=>/stage|scene|shop|share|modal/.test(x)),audio:Math.round(document.querySelector('audio').currentTime*10)/10,shop:document.getElementById('tiny-shop-scene')?.className,modal:document.getElementById('shop-product-modal')?.className}));
    }));
    results.push({viewport:[width,height],label,states});
  };
  await Promise.all(pages.map(click));
  await Promise.all(pages.map(p=>p.waitForFunction(()=>document.querySelector('audio').currentTime>=9.69,{timeout:18000})));
  for(let step=2;step<=13;step++){
    await Promise.all(pages.map(click));
    await Promise.all(pages.map(p=>p.waitForTimeout(step===5?2500:1600)));
    if([4,7,10,13].includes(step)) await record(`step-${step}`);
  }
  await Promise.all(pages.map(p=>p.locator('#share-fuel-button').click({timeout:5000})));
  await Promise.all(pages.map(p=>p.waitForTimeout(5500)));
  await record('after-fuel');
  for(let i=0;i<2;i++){
    await Promise.all(pages.map(click));
    await Promise.all(pages.map(p=>p.waitForTimeout(1200)));
  }
  await record('end');
  for(let i=0;i<2;i++){
    const product=pages[i].locator('.shop-product').first();
    if(await product.isVisible()) await product.click({timeout:5000});
  }
  await record('product-modal');
  results.push({viewport:[width,height],errors});
  await Promise.all(contexts.map(c=>c.close()));
}
await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
await browser.close();
