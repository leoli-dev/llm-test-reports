const scratchRoot=process.env.SCRATCH_ROOT||process.cwd();
const baseURL=process.env.BASE_URL||'http://127.0.0.1:8462';
// Claude-mbp re-checks after the shared perf run (one browser at a time).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
const OUT = scratchRoot+'/claude-shots';
const B = await chromium.launch({ executablePath: (process.env.BROWSER_PATH||'/Applications/Thorium.app/Contents/MacOS/Thorium'), headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const res = { browser: B.version(), at: new Date().toISOString() };
const page = async (url) => { const p = await B.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.goto(url); return [p, errs]; };
const shot = (p, name) => p.screenshot({ path: path.join(OUT, name), type: 'jpeg', quality: 82 });
const SG = baseURL+'/snowglobe-park/dist/index.html', NOEL = baseURL+'/noel-globe/dist/index.html';

// 1. SG: label swallows wheel, with an adjacent-canvas control
{
  const [p, errs] = await page(SG);
  await p.waitForFunction(() => document.body.classList.contains('ready'), null, { timeout: 90000 });
  await p.click('#playBtn');
  await p.evaluate(() => { const el = document.getElementById('hour'); el.value = 720; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
  const box = await p.locator('#scene').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height * 0.55;
  const probe = (x, y) => p.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return { dist: +window.SG.controls.dist.toFixed(2), under: el ? (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + el.className) + (el.classList?.contains('lbl') ? ' "' + el.textContent + '"' : '') : null }; }, [x, y]);
  await p.mouse.move(cx, cy);
  const trace = [];
  for (let i = 1; i <= 14; i++) { await p.mouse.wheel(0, -260); await p.waitForTimeout(300); trace.push(await probe(cx, cy)); }
  const stuck = trace[trace.length - 1];
  await shot(p, 'recheck-sg-label-stuck.jpg');
  // find a nearby point that is plain canvas
  let alt = null;
  for (const [dx, dy] of [[0, 60], [0, -60], [90, 0], [-90, 0], [0, 120], [140, 40]]) {
    const r = await probe(cx + dx, cy + dy);
    if (r.under === '#scene') { alt = [cx + dx, cy + dy, dx, dy]; break; }
  }
  const after = [];
  if (alt) {
    await p.mouse.move(alt[0], alt[1]);
    for (let i = 1; i <= 5; i++) { await p.mouse.wheel(0, -260); await p.waitForTimeout(300); after.push(await probe(alt[0], alt[1])); }
  }
  await shot(p, 'recheck-sg-label-control.jpg');
  res.sgLabel = { cursor: [Math.round(cx), Math.round(cy)], trace, stuck, control: alt ? { offset: [alt[2], alt[3]], after } : 'no plain-canvas point found nearby', errors: errs };
  await p.close();
}

// 2. SG parade capture (set time before 14:00 so the button starts it)
{
  const [p, errs] = await page(SG);
  await p.waitForFunction(() => document.body.classList.contains('ready'), null, { timeout: 90000 });
  await p.click('#playBtn');
  await p.evaluate(() => { const el = document.getElementById('hour'); el.value = Math.round(13.9 * 60); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); document.getElementById('hint').classList.add('gone'); });
  await p.click('#paradeBtn');
  for (const s of [12, 20, 28]) { await p.waitForTimeout(s === 12 ? 12000 : 8000); await shot(p, `recheck-sg-parade-${s}s.jpg`); }
  res.sgParade = { running: await p.evaluate(() => window.SG.parade.running), errors: errs };
  await p.close();
}

// 3. Noël: settled focus views + fireworks and parade bursts
{
  const [p, errs] = await page(NOEL);
  await p.waitForFunction(() => document.querySelector('#loading')?.hidden === true, null, { timeout: 90000 });
  await p.waitForTimeout(1500);
  const go = async (tab, name) => {
    if (!(await p.evaluate(() => document.getElementById('dialog').open))) { await p.click('#guide'); await p.waitForTimeout(400); }
    await p.click(tab === 'a' ? '#pTab' : '#cTab');
    await p.fill('#find', name); await p.waitForTimeout(200);
    return p.evaluate((name) => { const b = [...document.querySelectorAll('[data-idx]')].find(x => x.querySelector('strong').textContent === name); if (b) { b.click(); return true; } return false; }, name);
  };
  res.noelFocus = {};
  for (const [tab, name, file] of [['a', '灰熊山极速矿车', 'grizzly'], ['a', '小小世界', 'smallworld'], ['a', '疯帽子旋转杯', 'teacups'], ['c', '米妮', 'minnie']]) {
    const ok = await go(tab, name);
    await p.waitForTimeout(5000);
    await shot(p, `recheck-noel-${file}-5s.jpg`);
    res.noelFocus[name] = { found: ok, zoom: await p.evaluate(() => document.getElementById('zoom').textContent) };
  }
  await p.click('#resetView'); await p.waitForTimeout(1500);
  const f = await go('a', '城堡夜空烟花');
  await p.waitForTimeout(2500);
  for (let i = 1; i <= 3; i++) { await shot(p, `recheck-noel-fireworks-${i}.jpg`); await p.waitForTimeout(1300); }
  const pr = await go('a', '圣诞星光巡游');
  await p.waitForTimeout(2500);
  for (let i = 1; i <= 3; i++) { await shot(p, `recheck-noel-parade-${i}.jpg`); await p.waitForTimeout(2000); }
  res.noelShows = { fireworksEntry: f, paradeEntry: pr, clock: await p.evaluate(() => document.getElementById('clock').textContent), errors: errs };
  await p.close();
}
fs.writeFileSync(path.join(OUT, 'recheck-log.json'), JSON.stringify(res, null, 2));
console.log(JSON.stringify(res, null, 1));
await B.close();
