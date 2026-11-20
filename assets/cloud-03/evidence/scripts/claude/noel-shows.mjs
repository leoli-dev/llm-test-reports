const scratchRoot=process.env.SCRATCH_ROOT||process.cwd();
const baseURL=process.env.BASE_URL||'http://127.0.0.1:8462';
import { chromium } from 'playwright-core';
import path from 'node:path';
const OUT = scratchRoot+'/claude-shots';
const B = await chromium.launch({ executablePath: (process.env.BROWSER_PATH||'/Applications/Thorium.app/Contents/MacOS/Thorium'), headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const p = await B.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await p.goto(baseURL+'/noel-globe/dist/index.html');
await p.waitForFunction(() => document.querySelector('#loading')?.hidden === true, null, { timeout: 90000 });
const rm = await p.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
await p.waitForTimeout(2000); // default state is 20:00, snow, home view
const box = await p.locator('#world').boundingBox();
for (let i = 1; i <= 8; i++) { await p.screenshot({ path: path.join(OUT, `recheck-noel-home-night-${i}.jpg`), type: 'jpeg', quality: 82, clip: box }); await p.waitForTimeout(500); }
console.log(JSON.stringify({ reducedMotion: rm, clip: box }));
await B.close();
