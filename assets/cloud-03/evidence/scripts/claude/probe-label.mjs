const scratchRoot=process.env.SCRATCH_ROOT||process.cwd();
const baseURL=process.env.BASE_URL||'http://127.0.0.1:8462';
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: (process.env.BROWSER_PATH||'/Applications/Thorium.app/Contents/MacOS/Thorium'), headless: true, args: ['--enable-gpu','--ignore-gpu-blocklist','--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(baseURL+'/snowglobe-park/dist/index.html');
await p.waitForFunction(() => document.body.classList.contains('ready'), null, { timeout: 90000 });
await p.click('#playBtn');
await p.evaluate(() => { const el = document.getElementById('hour'); el.value = 720; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
const box = await p.locator('#scene').boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height * 0.55;
await p.mouse.move(cx, cy);
const rows = [];
for (let i = 1; i <= 30; i++) {
  await p.mouse.wheel(0, -260); await p.waitForTimeout(300);
  const r = await p.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return { dist: +window.SG.controls.dist.toFixed(1), under: el ? (el.id || el.className || el.tagName) + (el.textContent && el.className === 'lbl' ? ':' + el.textContent : '') : null }; }, [cx, cy]);
  rows.push(`${i}: dist=${r.dist} under=${r.under}`);
}
console.log(rows.join('\n'));
await b.close();
