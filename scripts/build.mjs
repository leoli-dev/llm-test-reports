import fs from 'node:fs/promises';
import path from 'node:path';
import {marked} from 'marked';
import sanitizeHtml from 'sanitize-html';
const root=path.resolve(import.meta.dirname,'..');
const catalog=JSON.parse(await fs.readFile(path.join(root,'data/catalog.json'),'utf8'));
const documentIds=new Map(catalog.documents.map(d=>[d.path,d.id]));
export function renderMarkdown(markdown,sourcePath='reports/originals/report.md'){
  const body=markdown.replace(/^---\n[\s\S]*?\n---\n/,'');
  const relocate=(value)=>{
    if(!value || /^(?:[a-z]+:|#|\/\/)/i.test(value))return value;
    const url=new URL(value,'https://archive.invalid/'+sourcePath);
    const p=decodeURIComponent(url.pathname.slice(1));
    return documentIds.has(p)?'#doc='+encodeURIComponent(documentIds.get(p)):url.pathname.slice(1)+url.search+url.hash;
  };
  return sanitizeHtml(marked.parse(body,{gfm:true}),{
    allowedTags:sanitizeHtml.defaults.allowedTags.concat(['img','figure','figcaption','details','summary','kbd','s','del','input']),
    allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,a:['href','title','rel'],img:['src','alt','title','width','height','loading'],code:['class'],input:['type','checked','disabled'],th:['align'],td:['align']},
    allowedSchemes:['http','https','mailto'],allowProtocolRelative:false,
    transformTags:{
      a:(name,attrs)=>({tagName:name,attribs:{...attrs,href:relocate(attrs.href),...(/^https?:/.test(attrs.href||'')?{rel:'noreferrer'}:{})}}),
      img:(name,attrs)=>({tagName:name,attribs:{...attrs,src:relocate(attrs.src),loading:'lazy'}}),
      input:()=>({tagName:'input',attribs:{type:'checkbox',disabled:'disabled'}})
    }
  });
}
if(process.argv[1]===import.meta.filename){
  const dist=path.join(root,'dist');await fs.rm(dist,{recursive:true,force:true});await fs.mkdir(dist,{recursive:true});
  for(const dir of ['site','reports','assets']){
    await fs.cp(path.join(root,dir),dir==='site'?dist:path.join(dist,dir),{recursive:true});
  }
  for(const doc of catalog.documents){
    const md=await fs.readFile(path.join(root,doc.path),'utf8');doc.html=renderMarkdown(md,doc.path);
    doc.readingMinutes=Math.max(1,Math.round(md.length/900));
  }
  await fs.mkdir(path.join(dist,'data'),{recursive:true});
  await fs.writeFile(path.join(dist,'data/catalog.json'),JSON.stringify(catalog));
  await fs.writeFile(path.join(dist,'.nojekyll'),'');
  await fs.copyFile(path.join(root,'data/provenance.json'),path.join(dist,'data/provenance.json'));
  console.log(`Built ${catalog.experiments.length} experiments and ${catalog.documents.length} Markdown documents.`);
}
