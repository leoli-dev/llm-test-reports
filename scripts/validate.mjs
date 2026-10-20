import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {marked} from 'marked';
import {renderMarkdown} from './build.mjs';
const root=path.resolve(import.meta.dirname,'..');
const catalogs=[];
for(const suffix of ['','_CN']){
 const c=JSON.parse(await fs.readFile(path.join(root,`dist/data/catalog${suffix}.json`),'utf8'));catalogs.push(c);
 assert.equal(c.locale,suffix?'cn':'en');
 assert.equal(c.localizationComplete,true,'Incomplete localization must not be published.');
 if(!suffix)for(const r of c.experiments)for(const key of ['title','date','model','category','summary','caveat'])assert(!/[\u3400-\u9fff]/.test(r[key]||''),`${r.id}: untranslated ${key}`);
 assert.equal(new Set(c.experiments.map(r=>r.id)).size,c.experiments.length);
 assert.equal(new Set(c.documents.map(d=>d.id)).size,c.documents.length);
 const docs=new Map(c.documents.map(d=>[d.path,d]));
 for(const r of c.experiments){
  assert(r.documents.length,`${r.id}: missing report`);assert(r.environment,`${r.id}: missing environment context`);
  for(const p of [r.markdown,...r.documents])await fs.access(path.join(root,p));
  for(const p of r.documents)assert(docs.has(p),`${r.id}: unknown document ${p}`);
 }
 for(const d of c.documents){
  assert.equal(d.path.endsWith('_CN.md'),!!suffix,`${d.id}: wrong language suffix`);
  assert(d.environment,`${d.id}: missing environment context`);
  assert(!/<script\b|\son\w+=|javascript:/i.test(d.html),d.id);
  await checkLinks(d.html,d.id);
  const md=await fs.readFile(path.join(root,d.path),'utf8');
  if(!d.source.startsWith('new-report/'))assert(md.includes('137438953472'),`${d.id}: missing workstation reference`);
  assert(md.includes(suffix?'实验时系统':'Test-time OS'),`${d.id}: missing historical OS status`);
  if(!suffix){
   const prose=md.replace(/^---\n[\s\S]*?\n---\n/,'').replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`|https?:\/\/[^\s)<>；，。→\u3400-\u9fff]+/g,'').replace(/\[简体中文\]\([^)]*\)/g,'').replace(/\["[^\n|]*?"\]|\{[^{}\n|]*[\u3400-\u9fff][^{}\n|]*\}/g,'');
   assert(!/[\u3400-\u9fff]/.test(prose),`${d.id}: untranslated Chinese prose`);
  }
 }
 for(const p of [`README${suffix}.md`,`CONTRIBUTING${suffix}.md`,`environment${suffix}.md`,`docs/design${suffix}.md`,`docs/publication-checks${suffix}.md`,`templates/report${suffix}.md`])await checkLinks(renderMarkdown(await fs.readFile(path.join(root,p),'utf8'),p),p);
 const readme=await fs.readFile(path.join(root,`README${suffix}.md`),'utf8');
 assert.equal((readme.match(/^\|[^\n]+reports\/experiments\//gm)||[]).length,c.experiments.length,'README index row count');
 const index=marked.lexer(readme).find(t=>t.type==='table'&&t.header.length===4&&t.rows.some(row=>row.some(cell=>cell.text.includes('reports/experiments/'))));
 assert(index,'README experiment index must parse as a four-column Markdown table.');
 assert.equal(index.rows.length,c.experiments.length,'Parsed README index row count');
 console.log(`Validated ${c.locale}: ${c.experiments.length} experiments, ${c.documents.length} reports, environment context and local links.`);
}
const [en,cn]=catalogs;
assert.deepEqual(en.experiments.map(r=>r.id),cn.experiments.map(r=>r.id));
assert.deepEqual(en.documents.map(d=>d.id),cn.documents.map(d=>d.id));
for(let i=0;i<en.documents.length;i++)assert.equal(cn.documents[i].path,en.documents[i].path.replace(/\.md$/,'_CN.md'));
const attack=renderMarkdown('<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">bad</a>');
assert(!/<script|onerror|javascript:/i.test(attack));
const checklist=renderMarkdown('- [x] Completed\n- [ ] Pending');
assert.equal((checklist.match(/ checked=/g)||[]).length,1,'Historical checklist completion must survive rendering.');
const audit=JSON.parse(await fs.readFile(path.join(root,'data/translation-audit.json'),'utf8'));
assert.equal(audit.documents.length,en.documents.filter(d=>!d.source.startsWith('new-report/')).length);
for(const d of audit.documents)for(const lang of ['english','chinese']){
 const rel=lang==='chinese'?d.path.replace(/\.md$/,'_CN.md'):d.path;
 const text=(await fs.readFile(path.join(root,rel),'utf8')).replace(/<!-- environment-context:start -->[\s\S]*?<!-- environment-context:end -->/,'');
 const fences=text.match(/```[\s\S]*?```|~~~[\s\S]*?~~~/g)||[];
 const inline=(text.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g,'').match(/`[^`\n]+`/g)||[]).sort();
 const rows=text.split('\n').filter(line=>line.startsWith('|'));
 assert.equal(rows.length,d.source.tableStructure.length,`${rel}: table row count changed`);
 for(let n=0;n<rows.length;n++){
  const cells=rows[n].split('|'),expected=d.source.tableStructure[n];
  assert.equal(cells.length,expected.numericCells.length,`${rel}: table columns changed`);
  assert.equal(/^\|[ \t:|\-]+\|?\s*$/.test(rows[n]),expected.separator,`${rel}: table separator moved`);
  for(let k=0;k<cells.length;k++){
   const counts=new Map();for(const token of cells[k].match(/\d+(?:[.,]\d+)*/g)||[])counts.set(token,(counts.get(token)||0)+1);
   for(const [token,count] of Object.entries(expected.numericCells[k]))assert((counts.get(token)||0)>=count,`${rel}: numeric table cell changed`);
   const signed=new Map();for(const raw of cells[k].match(/[-−]?\d+(?:[.,]\d+)*/g)||[]){const token=raw.replace('−','-');signed.set(token,(signed.get(token)||0)+1);}
   for(const [token,count] of Object.entries(expected.signedNumericCells[k]))assert((signed.get(token)||0)>=count,`${rel}: signed numeric table cell changed`);
  }
 }
 const diagnostics=text.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g,'').match(/\["[^\n|]*?"\]|\{[^{}\n|]*[\u3400-\u9fff][^{}\n|]*\}/g)||[];
 const numbers=new Map();for(const token of text.match(/\d+(?:[.,]\d+)*/g)||[])numbers.set(token,(numbers.get(token)||0)+1);
 for(const [token,count] of Object.entries(d.source.numericLiterals))assert((numbers.get(token)||0)>=count,`${rel}: missing numeric literal ${token}`);
 const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
 assert.equal(digest(diagnostics),d.source.rawDiagnosticsSha256,`${rel}: raw JSON diagnostics changed`);
 assert.equal(digest(fences),d.source.codeBlocksSha256,`${rel}: current fenced source code changed`);
 assert.equal(digest(inline),d.source.inlineLiteralsSha256,`${rel}: current inline evidence changed`);
 assert.equal(d[lang].codeBlocksSha256,d.source.codeBlocksSha256,`${d.path}: changed fenced source code (${lang})`);
 assert.equal(d[lang].inlineLiteralsSha256,d.source.inlineLiteralsSha256,`${d.path}: changed inline literals (${lang})`);
}
for(let i=0;i<en.documents.length;i++)if(en.documents[i].source.startsWith('new-report/')){
 const [a,b]=await Promise.all([en.documents[i].path,cn.documents[i].path].map(p=>fs.readFile(path.join(root,p),'utf8')));
 assert.deepEqual(a.match(/```[\s\S]*?```|~~~[\s\S]*?~~~/g)||[],b.match(/```[\s\S]*?```|~~~[\s\S]*?~~~/g)||[],`${en.documents[i].id}: translated source code changed`);
}
console.log('Validated language pairs, Markdown sanitization, README indexes and immutable source-code audit.');
async function checkLinks(html,label){
 for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const target=m[1].replaceAll('&amp;','&');
  if(/^(?:https?:|mailto:|#)/.test(target))continue;
  assert(!target.startsWith('/'),`${label}: root-absolute link ${target}`);
  await fs.access(path.join(root,'dist',decodeURIComponent(target.split('#')[0].split('?')[0]))).catch(()=>assert.fail(`${label}: missing asset ${target}`));
 }
}
