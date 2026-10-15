import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const deep=process.argv.includes('--deep');
const modal=process.argv.includes('--modal');
const out=path.resolve(modal?'comparison/modal':deep?'comparison/deep':'comparison');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const results=[];
for(const size of (deep||modal?['1366x768','390x844']:['1920x1080','1366x768','390x844','360x800'])) for(const state of (modal?['shop','modal']:deep?['step-4','step-7','step-10','step-13','after-fuel','end','product-modal']:['initial','first'])) {
  const images=await Promise.all(['reference','local'].map(name=>fs.readFile(path.join(out,`${size}-${name}-${state}.png`)).then(b=>`data:image/png;base64,${b.toString('base64')}`)));
  const result=await page.evaluate(async ([a,b])=>{
    async function load(src){const img=new Image();img.src=src;await img.decode();return img;}
    const [ia,ib]=await Promise.all([load(a),load(b)]);
    const w=ia.width,h=ia.height;
    const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');
    ctx.drawImage(ia,0,0);const p=ctx.getImageData(0,0,w,h);
    ctx.clearRect(0,0,w,h);ctx.drawImage(ib,0,0);const q=ctx.getImageData(0,0,w,h);
    let total=0,changed=0;const diff=ctx.createImageData(w,h);
    for(let i=0;i<p.data.length;i+=4){
      let d=0;
      for(let j=0;j<3;j++){const x=Math.abs(p.data[i+j]-q.data[i+j]);d+=x;diff.data[i+j]=Math.min(255,x*3);}
      diff.data[i+3]=255;total+=d;if(d>60)changed++;
    }
    ctx.putImageData(diff,0,0);
    return {width:w,height:h,meanAbsoluteDifference:total/(w*h*3*255),changedPixelRatio:changed/(w*h),differenceImage:c.toDataURL('image/png')};
  },images);
  await fs.writeFile(path.join(out,`${size}-${state}-diff.png`),Buffer.from(result.differenceImage.split(',')[1],'base64'));
  delete result.differenceImage;
  results.push({size,state,...result});
}
await fs.writeFile(path.join(out,'metrics.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
await browser.close();
