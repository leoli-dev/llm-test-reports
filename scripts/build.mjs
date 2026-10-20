import fs from 'node:fs/promises';
import path from 'node:path';
import {marked} from 'marked';
import sanitizeHtml from 'sanitize-html';
const root=path.resolve(import.meta.dirname,'..');
const catalogs=await Promise.all(['catalog.json','catalog_CN.json'].map(async file=>({file,...JSON.parse(await fs.readFile(path.join(root,'data',file),'utf8'))})));
const documents=new Map(catalogs.flatMap(c=>c.documents.map(d=>[d.path,{id:d.id,locale:c.locale}])));
export function renderMarkdown(markdown,sourcePath='reports/originals/report.md'){
 const locale=sourcePath.endsWith('_CN.md')?'cn':'en';
 const body=markdown.replace(/^---\n[\s\S]*?\n---\n/,'');
 const relocate=value=>{
  if(!value || /^(?:[a-z]+:|#|\/\/)/i.test(value))return value;
  const url=new URL(value,'https://archive.invalid/'+sourcePath);
  const p=decodeURIComponent(url.pathname.slice(1));
  const doc=documents.get(p);
  if(doc)return (locale===doc.locale?'':doc.locale==='cn'?'index_CN.html':'index.html')+'#doc='+encodeURIComponent(doc.id);
  if(/^environment(?:_CN)?\.md$/.test(p))return p.replace(/\.md$/,'.html')+url.hash;
  return url.pathname.slice(1)+url.search+url.hash;
 };
 return sanitizeHtml(marked.parse(body,{gfm:true}),{
  allowedTags:sanitizeHtml.defaults.allowedTags.concat(['img','figure','figcaption','details','summary','kbd','s','del','input']),
  allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,a:['href','title','rel'],img:['src','alt','title','width','height','loading'],code:['class'],input:['type','checked','disabled'],th:['align'],td:['align']},
  allowedSchemes:['http','https','mailto'],allowProtocolRelative:false,
  transformTags:{
   a:(name,attrs)=>({tagName:name,attribs:{...attrs,href:relocate(attrs.href),...(/^https?:/.test(attrs.href||'')?{rel:'noreferrer'}:{})}}),
   img:(name,attrs)=>({tagName:name,attribs:{...attrs,src:relocate(attrs.src),loading:'lazy'}}),
   input:(name,attrs)=>({tagName:'input',attribs:{type:'checkbox',disabled:'disabled',...('checked' in attrs?{checked:'checked'}:{})}})
  }
 });
}
if(process.argv[1]===import.meta.filename){
 const dist=path.join(root,'dist');await fs.rm(dist,{recursive:true,force:true});await fs.mkdir(dist,{recursive:true});
 for(const dir of ['site','reports','assets','docs','templates'])await fs.cp(path.join(root,dir),dir==='site'?dist:path.join(dist,dir),{recursive:true});
 await fs.mkdir(path.join(dist,'data'),{recursive:true});
 for(const catalog of catalogs){
  const {file,...data}=catalog;
  for(const r of data.experiments)r.searchAliases=catalogs.flatMap(c=>{const pair=c.experiments.find(x=>x.id===r.id);return pair?[pair.title,pair.summary,pair.category]:[];});
  for(const doc of data.documents){
   const md=await fs.readFile(path.join(root,doc.path),'utf8');doc.html=renderMarkdown(md,doc.path);
   doc.readingMinutes=Math.max(1,Math.round(md.length/(data.locale==='cn'?900:1400)));
  }
  await fs.writeFile(path.join(dist,'data',file),JSON.stringify(data));
  console.log(`Built ${data.locale}: ${data.experiments.length} experiments and ${data.documents.length} full Markdown reports.`);
 }
 for(const suffix of ['','_CN']){
  for(const name of ['README','CONTRIBUTING','environment'])await fs.copyFile(path.join(root,name+suffix+'.md'),path.join(dist,name+suffix+'.md'));
  for(const name of ['environment','environment-history','provenance','translation-audit'])await fs.copyFile(path.join(root,'data',name+suffix+'.json'),path.join(dist,'data',name+suffix+'.json'));
  const file='environment'+suffix+'.md';const cn=!!suffix;
  const body=renderMarkdown(await fs.readFile(path.join(root,file),'utf8'),file);
  await fs.writeFile(path.join(dist,file.replace('.md','.html')),`<!doctype html><html lang="${cn?'zh-CN':'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${cn?'本机配置与系统':'Workstation and system'} · LLM Test Reports</title><link rel="stylesheet" href="styles.css"></head><body><main style="max-width:1000px;margin:auto;padding:32px"><a href="index${suffix}.html">‹ LLM Test Reports</a><article class="prose">${body}</article></main></body></html>`);
 }
 await fs.writeFile(path.join(dist,'.nojekyll'),'');
}
