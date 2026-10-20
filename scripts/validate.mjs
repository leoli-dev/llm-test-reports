import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {renderMarkdown} from './build.mjs';
const root=path.resolve(import.meta.dirname,'..');
const c=JSON.parse(await fs.readFile(path.join(root,'dist/data/catalog.json'),'utf8'));
assert.equal(new Set(c.experiments.map(r=>r.id)).size,c.experiments.length);
const docs=new Map(c.documents.map(d=>[d.path,d]));
for(const r of c.experiments){
 assert(r.documents.length,`${r.id}: missing report`);
 for(const p of [r.markdown,...r.documents])await fs.access(path.join(root,p));
 for(const p of r.documents)assert(docs.has(p));
}
for(const d of c.documents){
 assert(!/<script\b|\son\w+=|javascript:/i.test(d.html),d.id);
 for(const m of d.html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const target=m[1].replaceAll('&amp;','&');
  if(/^(?:https?:|mailto:|#)/.test(target))continue;
  assert(!target.startsWith('/'),`${d.id}: root-absolute link ${target}`);
  await fs.access(path.join(root,'dist',decodeURIComponent(target.split('#')[0].split('?')[0]))).catch(()=>assert.fail(`${d.id}: missing asset ${target}`));
 }
}
// An imported Markdown/HTML report must never gain script execution in the reader.
const attack=renderMarkdown('<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">bad</a>');
assert(!/<script|onerror|javascript:/i.test(attack));
console.log(`Validated ${c.experiments.length} experiments, ${c.documents.length} reports, all local reader links and Markdown sanitization.`);
