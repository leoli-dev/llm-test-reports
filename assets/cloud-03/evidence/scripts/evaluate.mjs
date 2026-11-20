const scratchRoot=process.env.SCRATCH_ROOT||process.cwd();
const baseURL=process.env.BASE_URL||'http://127.0.0.1:8462';
import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
const root=scratchRoot+'/evidence';
const browser=await chromium.launch({executablePath:(process.env.BROWSER_PATH||'/Applications/Thorium.app/Contents/MacOS/Thorium'),headless:true,args:['--enable-gpu','--ignore-gpu-blocklist','--use-angle=metal','--disable-background-timer-throttling']});
const results={browser:browser.version(),started:new Date().toISOString(),apps:{}};
async function shot(p,n){await p.screenshot({path:root+'/'+n+'.jpg',quality:88,fullPage:false});}
async function range(p,s,v){await p.locator(s).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));},v);}
async function sample(p,ms=3000){return p.evaluate(ms=>new Promise(ok=>{const a=[];let start,last;function tick(t){start??=t;if(last)a.push(t-last);last=t;if(t-start<ms)requestAnimationFrame(tick);else{const b=[...a].sort((x,y)=>x-y);ok({n:a.length,durationMs:t-start,fps:1000*a.length/(t-start),p50:b[Math.floor(b.length*.5)],p95:b[Math.floor(b.length*.95)],over33:a.filter(x=>x>33.34).length});}}requestAnimationFrame(tick);}),ms);}
async function info(p){return p.evaluate(()=>{const c=document.querySelector('canvas'),g=c.getContext('webgl2'),e=g.getExtension('WEBGL_debug_renderer_info');return {viewport:[innerWidth,innerHeight],canvas:[c.width,c.height],canvasRect:JSON.parse(JSON.stringify(c.getBoundingClientRect())),scrollWidth:document.documentElement.scrollWidth,renderer:e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):'unknown',sg:window.SG?{stats:SG.stats,pixelRatio:SG.renderer.getPixelRatio(),memory:SG.renderer.info.memory,weather:SG.atmos.weatherKey,mini:SG.miniature,dist:SG.controls.dist}:null};});}
for(const name of ['snowglobe-park','noel-globe']){
 const sg=name==='snowglobe-park',r=results.apps[name]={errors:[],warnings:[],requests:[],checks:[]};
 const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,acceptDownloads:true});const p=await ctx.newPage();
 p.on('pageerror',e=>r.errors.push(e.message));p.on('console',m=>{if(m.type()==='warning'||m.type()==='error')r.warnings.push(m.text());});p.on('requestfailed',q=>r.requests.push({url:q.url(),error:q.failure()?.errorText}));
 const t=Date.now();await p.goto(baseURL+'/'+name+'/dist/index.html',{waitUntil:'load'});await p.waitForFunction(sg?()=>window.SG?.ready:()=>document.querySelector('#loading').hidden);r.loadMs=Date.now()-t;await p.waitForTimeout(3500);
 r.default=await info(p);await shot(p,name+'-default');r.defaultPerf=await sample(p);
 // All weather UI controls, then shared daytime conditions.
 r.weather=[];for(const w of await p.locator('[data-w]').evaluateAll(a=>a.map(x=>x.dataset.w))){await p.locator('[data-w="'+w+'"]').click();await p.waitForTimeout(250);r.weather.push({key:w,state:await p.locator('[data-w="'+w+'"]').getAttribute('aria-pressed')});}
 await p.locator('[data-w="'+(sg?'clear':'sun')+'"]').click();if(sg)await p.locator('#playBtn').click();await range(p,sg?'#hour':'#time',720);await p.waitForTimeout(1400);await shot(p,name+'-day');
 await range(p,sg?'#hour':'#time',1320);await p.waitForTimeout(1400);await shot(p,name+'-night');
 await p.locator(sg?'#guideBtn':'#guide').click();r.attractions=await p.locator(sg?'#guideList button.g-item':'.catalog button').count();r.guideText=await p.locator(sg?'#guideList':'.catalog').innerText();
 await p.locator(sg?'#tabC':'#cTab').click();r.characters=await p.locator(sg?'#guideList button.g-item':'.catalog button').count();r.characterText=await p.locator(sg?'#guideList':'.catalog').innerText();
 await p.locator(sg?'#guideSearch':'#find').fill('米奇');r.searchText=await p.locator(sg?'#guideList':'.catalog').innerText();await shot(p,name+'-guide');
 await p.locator(sg?'#guideClose':'#dialog .close').click();
 // Continuous wheel zoom produces a visibly different image.
 const canvas=p.locator('canvas').first(),b=await canvas.boundingBox();await p.mouse.move(b.x+b.width*.5,b.y+b.height*.5);await p.mouse.wheel(0,-600);await p.waitForTimeout(900);r.zoom=await info(p);await shot(p,name+'-zoom');
 await p.locator(sg?'#home':'#resetView').click();await p.waitForTimeout(1000);
 await p.locator(sg?'#miniBtn':'#mini').click();await p.waitForTimeout(1700);r.mini=await info(p);await shot(p,name+'-mini');
 if(!sg){await p.keyboard.down('w');await p.waitForTimeout(900);await p.keyboard.up('w');await shot(p,name+'-walk');}
 await p.locator('#shutter').click();await p.waitForTimeout(900);
 if(sg)await p.locator('#gallery button').first().click();
 const down=p.waitForEvent('download');await p.locator(sg?'#lbSave':'.download').first().click();const d=await down;await d.saveAs(root+'/'+name+'-photo.jpg');r.download={suggested:d.suggestedFilename(),bytes:(await fs.stat(root+'/'+name+'-photo.jpg')).size};
 if(sg){await p.locator('#lbClose').click();await p.locator('#miniExit').click();}else{await p.locator('#dialog .close').click();await p.locator('#leave').click();}
 await p.reload();await p.waitForFunction(sg?()=>window.SG?.ready:()=>document.querySelector('#loading').hidden);await p.waitForTimeout(800);
 if(sg){await p.locator('#miniBtn').click();r.photoCountAfterReload=await p.locator('#gallery button').count();await p.locator('#miniExit').click();}else{await p.locator('#album').click();await p.waitForTimeout(600);r.photoCountAfterReload=await p.locator('.gallery figure').count();await p.locator('#dialog .close').click();}
 // Mobile viewport and miniature control reachability.
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(1300);r.mobile=await info(p);await shot(p,name+'-mobile');
 await p.locator(sg?'#miniBtn':'#mini').click();await p.waitForTimeout(1000);r.mobileMini=await info(p);r.mobileMini.shutter=await p.locator('#shutter').boundingBox();await shot(p,name+'-mobile-mini');
 await ctx.close();await fs.writeFile(root+'/functional.json',JSON.stringify(results,null,2));console.log(name,r.loadMs,r.attractions,r.characters,r.defaultPerf,r.photoCountAfterReload);
}
await browser.close();
