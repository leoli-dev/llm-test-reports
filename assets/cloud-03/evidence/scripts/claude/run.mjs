const scratchRoot=process.env.SCRATCH_ROOT||process.cwd();
const baseURL=process.env.BASE_URL||'http://127.0.0.1:8462';
// Claude-mbp visual review harness: same scenarios for both candidates, driven through each UI.
// usage: node run.mjs <sg|noel> [mobile]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const cand = process.argv[2];
const mobile = process.argv[3] === 'mobile';
const OUT = scratchRoot+'/claude-shots';
const URL = { sg: baseURL+'/snowglobe-park/dist/index.html', noel: baseURL+'/noel-globe/dist/index.html' }[cand];
const vp = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const log = { cand, url: URL, viewport: vp, started: new Date().toISOString(), steps: [], console: [], pageerrors: [] };
const browser = await chromium.launch({ executablePath: (process.env.BROWSER_PATH||'/Applications/Thorium.app/Contents/MacOS/Thorium'), headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
log.browser = browser.version();
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, acceptDownloads: true });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.console.push(`[${m.type()}] ${m.text()}`.slice(0, 300)); });
page.on('pageerror', (e) => log.pageerrors.push(e.message.slice(0, 300)));
let n = 0;
const tag = mobile ? 'm-' : '';
const shot = async (name, note = '') => {
  n++;
  const file = `${cand}-${tag}${String(n).padStart(2, '0')}-${name}.jpg`;
  await page.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 82 });
  log.steps.push({ file, note });
  console.log(file, note);
};
const wait = (ms) => page.waitForTimeout(ms);
const t0 = Date.now();
await page.goto(URL);
const canvasSel = cand === 'sg' ? '#scene' : '#world';
if (cand === 'sg') await page.waitForFunction(() => document.body.classList.contains('ready'), null, { timeout: 90000 });
else await page.waitForFunction(() => document.querySelector('#loading')?.hidden === true, null, { timeout: 90000 });
log.readyMs = Date.now() - t0;
await wait(1500);
await shot('first-frame', `ready after ${log.readyMs} ms`);
await wait(4000);
await shot('default');

if (mobile) {
  // tap the main controls that exist on a phone and stop
  if (cand === 'sg') { await page.click('#dockToggle'); await wait(800); await shot('controls-open'); }
  else { await page.mouse.wheel(0, 700); await wait(800); await shot('scrolled-controls'); }
  log.finished = new Date().toISOString();
  fs.writeFileSync(path.join(OUT, `${cand}-${tag}log.json`), JSON.stringify(log, null, 2));
  await browser.close();
  process.exit(0);
}

// ---------- pause time where it auto-advances so lighting stays comparable ----------
if (cand === 'sg') { await page.click('#playBtn'); }
const setHour = async (h) => {
  if (cand === 'sg') await page.evaluate((h) => { const el = document.getElementById('hour'); el.value = Math.round(h * 60); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, h);
  else await page.evaluate((h) => { const el = document.getElementById('time'); el.value = Math.round(h * 60); el.dispatchEvent(new Event('input', { bubbles: true })); }, h);
};
const weather = async (w) => page.click(cand === 'sg' ? `#wx button[data-w="${w}"]` : `[data-w="${w}"]`);
const home = async () => { await page.click(cand === 'sg' ? '#home' : '#resetView'); await wait(3500); };

// ---------- weather (common four) at noon, default view ----------
await setHour(12);
const W = cand === 'sg' ? [['clear', 'sun'], ['snow', 'snow'], ['rain', 'rain'], ['cloudy', 'cloud']] : [['sun', 'sun'], ['snow', 'snow'], ['rain', 'rain'], ['cloud', 'cloud']];
for (const [w, label] of W) { await weather(w); await wait(4500); await shot(`weather-${label}`, `noon, weather ${w}`); }
if (cand === 'sg') for (const w of ['blizzard', 'storm', 'fog']) { await weather(w); await wait(5000); await shot(`weather-${w}`, `noon, extra weather ${w}`); }
await weather(cand === 'sg' ? 'snow' : 'snow');

// ---------- time of day ----------
for (const [h, label] of [[7.5, 'dawn'], [16.9, 'dusk'], [22, 'night']]) { await setHour(h); await wait(3500); await shot(`time-${label}`, `snow, ${h}h`); }
if (cand === 'sg') { await weather('aurora'); await wait(5000); await shot('weather-aurora', 'aurora at night'); await weather('snow'); }

// ---------- continuous zoom with the mouse wheel over the canvas center ----------
await setHour(12);
await home();
const box = await page.locator(canvasSel).boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height * 0.55;
await page.mouse.move(cx, cy);
const zoomInfo = async () => cand === 'sg' ? page.evaluate(() => +window.SG.controls.dist.toFixed(2)) : page.evaluate(() => document.getElementById('zoom').textContent);
log.zoom = [{ step: 0, v: await zoomInfo() }];
for (let i = 1; i <= 24; i++) {
  await page.mouse.wheel(0, -260);
  await wait(260);
  if (i % 6 === 0) { await wait(900); log.zoom.push({ step: i, v: await zoomInfo() }); await shot(`zoom-in-${i}`, `after ${i} wheel notches (-260)`); }
}
for (let i = 1; i <= 6; i++) { await page.mouse.wheel(0, -400); await wait(250); }
await wait(1200);
log.zoom.push({ step: 'max', v: await zoomInfo() });
await shot('zoom-max', 'kept zooming toward the center');
for (let i = 1; i <= 40; i++) { await page.mouse.wheel(0, 400); await wait(120); }
await wait(1500);
log.zoom.push({ step: 'out', v: await zoomInfo() });
await shot('zoom-out', 'zoomed all the way out');
await home();

// ---------- guide: counts + representative spot checks ----------
const spots = cand === 'sg'
  ? { a: ['童话城堡', '皮克斯米奇摩天轮', '疯帽子旋转茶杯', '巨雷山矿山车', '太空山', '小小世界'], c: ['米奇', '米妮', '艾莎', '胡迪', '玲娜贝儿', '史迪奇'] }
  : { a: ['奇妙梦想城堡', '米奇摩天轮', '疯帽子旋转杯', '灰熊山极速矿车', '星战极速穿梭', '小小世界'], c: ['米奇', '米妮', '艾莎', '胡迪', '玲娜贝儿', '史迪奇'] };
if (cand === 'sg') {
  await page.click('#guideBtn'); await wait(600);
  log.guideCounts = await page.evaluate(() => ({ attractions: document.getElementById('countA').textContent, characters: document.getElementById('countC').textContent }));
  await shot('guide-open');
  const go = async (tab, name) => {
    await page.click(tab === 'a' ? '#tabA' : '#tabC');
    await page.fill('#guideSearch', name);
    await wait(200);
    const ok = await page.evaluate((name) => { const b = [...document.querySelectorAll('.g-item')].find(x => x.querySelector('.zh').textContent.replace(/^◎ /, '') === name); if (b) { b.click(); return true; } return false; }, name);
    return ok;
  };
  for (const tab of ['a', 'c']) for (const name of spots[tab]) {
    if (!(await page.isVisible('#guide'))) { await page.click('#guideBtn'); await wait(300); }
    const ok = await go(tab, name);
    await page.waitForFunction(() => !window.SG.controls.flight, null, { timeout: 8000 }).catch(() => {});
    await wait(1500);
    await shot(`spot-${tab}-${name}`, ok ? 'guide fly-to' : 'NOT FOUND in guide');
  }
  await page.click('#guideClose');
} else {
  await page.click('#guide'); await wait(800);
  log.guideCounts = await page.evaluate(() => document.getElementById('matches')?.textContent);
  await shot('guide-open');
  await page.click('#cTab'); await wait(300);
  log.guideCountsPeople = await page.evaluate(() => document.getElementById('matches')?.textContent);
  await page.keyboard.press('Escape');
  const go = async (tab, name) => {
    if (!(await page.evaluate(() => document.getElementById('dialog').open))) { await page.click('#guide'); await wait(500); }
    await page.click(tab === 'a' ? '#pTab' : '#cTab');
    await page.fill('#find', name);
    await wait(200);
    return page.evaluate((name) => { const b = [...document.querySelectorAll('[data-idx]')].find(x => x.querySelector('strong').textContent === name); if (b) { b.click(); return true; } return false; }, name);
  };
  for (const tab of ['a', 'c']) for (const name of spots[tab]) {
    const ok = await go(tab, name);
    await wait(4200);
    await shot(`spot-${tab}-${name}`, ok ? 'guide fly-to' : 'NOT FOUND in guide');
  }
}
await home();

// ---------- shows: fireworks + parade ----------
if (cand === 'sg') {
  await page.click('#fireBtn'); await wait(9000); await shot('fireworks', 'fireworks button');
  await setHour(14); await page.click('#paradeBtn'); await wait(24000); await shot('parade', 'parade button, 24 s later');
} else {
  const go = async (name) => { await page.click('#guide'); await wait(500); await page.fill('#find', name); await wait(200); return page.evaluate((name) => { const b = [...document.querySelectorAll('[data-idx]')].find(x => x.querySelector('strong').textContent === name); if (b) { b.click(); return true; } return false; }, name); };
  const f = await go('城堡夜空烟花'); await wait(9000); await shot('fireworks', f ? 'guide → 城堡夜空烟花' : 'fireworks entry not found');
  await setHour(14); const p = await go('圣诞星光巡游'); await wait(9000); await shot('parade', p ? 'guide → 圣诞星光巡游' : 'parade entry not found');
}
await home();

// ---------- miniature / photo flow ----------
await setHour(15.5); await weather(cand === 'sg' ? 'clear' : 'sun'); await wait(2000);
if (cand === 'sg') {
  await page.click('#miniBtn'); await wait(4500); await shot('mini-enter', 'miniature mode');
  await page.click('#shutter'); await wait(2500);
  log.photo = await page.evaluate(() => ({ thumbs: document.querySelectorAll('#gallery img').length }));
  await page.click('#gallery button'); await wait(1200);
  log.photo.size = await page.evaluate(() => { const i = document.querySelector('#lbImgWrap img'); return i ? `${i.naturalWidth}x${i.naturalHeight}` : null; });
  await shot('mini-photo', 'lightbox after shutter');
  const dl = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
  await page.click('#lbSave');
  const d = await dl; log.photo.download = d ? d.suggestedFilename() : 'no download event';
  await page.click('#lbClose'); await page.click('#miniExit');
} else {
  await page.click('#mini'); await wait(4500); await shot('mini-enter', 'miniature walk mode');
  await page.keyboard.down('w'); await wait(1500); await page.keyboard.up('w'); await wait(800);
  await shot('mini-walk', 'held W for 1.5 s');
  await page.click('#shutter'); await wait(2500);
  log.photo = await page.evaluate(() => { const i = document.querySelector('img.shot'); return { size: i ? `${i.naturalWidth}x${i.naturalHeight}` : null, hasDownload: !!document.querySelector('a.download') }; });
  await shot('mini-photo', 'dialog after shutter');
  const dl = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
  await page.click('a.download').catch(() => {});
  const d = await dl; log.photo.download = d ? d.suggestedFilename() : 'no download event';
  await page.keyboard.press('Escape'); await wait(400);
  await page.click('#album'); await wait(1500);
  log.photo.albumCount = await page.evaluate(() => document.querySelectorAll('.gallery figure').length);
  await shot('album', 'album dialog');
  await page.keyboard.press('Escape');
}

// ---------- quick static accessibility probe ----------
log.a11y = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button, [role=button], input, select')].filter(b => b.offsetParent !== null);
  const unnamed = btns.filter(b => !((b.getAttribute('aria-label') || b.getAttribute('title') || b.textContent || '').trim()) && !b.labels?.length).length;
  return { visibleControls: btns.length, unnamed, lang: document.documentElement.lang || '(none)', reducedMotionRule: [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.conditionText?.includes('prefers-reduced-motion')); } catch { return false; } }) };
});
log.finished = new Date().toISOString();
fs.writeFileSync(path.join(OUT, `${cand}-log.json`), JSON.stringify(log, null, 2));
console.log(JSON.stringify({ ready: log.readyMs, zoom: log.zoom, guide: log.guideCounts, guideP: log.guideCountsPeople, photo: log.photo, a11y: log.a11y, errors: log.pageerrors.length, console: log.console.length }));
await browser.close();
