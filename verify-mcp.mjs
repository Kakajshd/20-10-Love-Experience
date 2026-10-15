import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
const command=process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe';
const child=spawn(command,['/d','/s','/c','npx -y @playwright/mcp@latest --headless'],{stdio:['pipe','pipe','pipe'],windowsHide:true});
let nextId=1,buffer='',stderr='';
const pending=new Map();
child.stderr.on('data',chunk=>{stderr+=chunk.toString();});
child.stdout.on('data',chunk=>{
  buffer+=chunk.toString();
  for(let cut;(cut=buffer.indexOf('\n'))!==-1;){
    const line=buffer.slice(0,cut).trim();buffer=buffer.slice(cut+1);
    if(!line.startsWith('{'))continue;
    let message;try{message=JSON.parse(line)}catch{continue}
    const item=pending.get(message.id);if(item){pending.delete(message.id);item.resolve(message)}
  }
});
function request(method,params={}){
  const id=nextId++;
  const promise=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`MCP timeout: ${method}; ${stderr.slice(-500)}`))},40000);
    pending.set(id,{resolve:message=>{clearTimeout(timer);resolve(message)}});
  });
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
  return promise;
}
try{
  const init=await request('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'codex-playwright-check',version:'1.0'}});
  if(init.error)throw new Error(JSON.stringify(init.error));
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
  const list=await request('tools/list');
  if(list.error)throw new Error(JSON.stringify(list.error));
  const names=list.result.tools.map(t=>t.name);
  const navigate=await request('tools/call',{name:'browser_navigate',arguments:{url:'https://20-10-vuive.kazvndc-edu.workers.dev/'}});
  const consoleResult=await request('tools/call',{name:'browser_console_messages',arguments:{level:'error'}});
  const screenshot=await request('tools/call',{name:'browser_take_screenshot',arguments:{}});
  const screenshotBlock=screenshot.result?.content?.find(x=>x.type==='image');
  if(screenshotBlock?.data)await fs.writeFile('reference/mcp-screenshot.png',Buffer.from(screenshotBlock.data,'base64'));
  const report={server:init.result.serverInfo,tools:names,navigationError:navigate.error||null,navigationContent:navigate.result?.content?.filter(x=>x.type==='text').map(x=>x.text.slice(0,1000)),console:consoleResult.result?.content?.filter(x=>x.type==='text').map(x=>x.text),screenshotError:screenshot.error||null,screenshotSaved:!!screenshotBlock};
  await fs.writeFile('reference/mcp-verification.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({server:report.server,toolCount:names.length,hasNavigate:names.includes('browser_navigate'),hasScreenshot:names.includes('browser_take_screenshot'),navigationError:report.navigationError,navigationPreview:report.navigationContent?.[0]?.slice(0,350),console:report.console,screenshotSaved:report.screenshotSaved,screenshotError:report.screenshotError},null,2));
  if(names.includes('browser_close'))await request('tools/call',{name:'browser_close',arguments:{}}).catch(()=>{});
}finally{child.kill();}
