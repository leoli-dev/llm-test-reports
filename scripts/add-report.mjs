import fs from 'node:fs/promises';
import path from 'node:path';
const options={};
for(let i=2;i<process.argv.length;i+=2){
 const key=process.argv[i];const value=process.argv[i+1];
 if(!key.startsWith('--')||!value||value.startsWith('--'))throw new Error('Use --option value pairs.');
 options[key.slice(2)]=value;
}
for(const key of ['id','title','title-cn','date','model','engine','scope','file','summary','summary-cn','hardware','test-os','test-os-cn'])if(!options[key])throw new Error(`Missing --${key}`);
if(!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(options.id))throw new Error('Use a URL-safe report id.');
if(!/^\d{4}-\d{2}-\d{2}$/.test(options.date))throw new Error('Date must be YYYY-MM-DD.');
if(!['local','lan','cloud'].includes(options.scope))throw new Error('Scope must be local, lan or cloud.');
if(!!options.caveat!==!!options['caveat-cn'])throw new Error('Supply both --caveat and --caveat-cn.');
if(options.repo&&!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(options.repo))throw new Error('--repo must be a GitHub repository HTTPS URL.');
const root=path.resolve(import.meta.dirname,'..');
const file=options.file.replaceAll('\\','/');
if(!/^reports\/originals\/[A-Za-z0-9][A-Za-z0-9_-]*\.md$/.test(file)||file.endsWith('_CN.md'))throw new Error('--file must be an English base file in reports/originals/.');
const pair=p=>p.replace(/\.md$/,'_CN.md');
for(const p of [file,pair(file)])await fs.access(path.join(root,p));
const catalogs=await Promise.all(['catalog.json','catalog_CN.json'].map(async f=>JSON.parse(await fs.readFile(path.join(root,'data',f),'utf8'))));
const docId=path.basename(file,'.md');const markdown='reports/experiments/'+options.id.toLowerCase()+'.md';
for(const c of catalogs){
 if(c.experiments.some(r=>r.id===options.id))throw new Error('Experiment id already exists.');
 if(c.documents.some(d=>d.id===docId||d.path===file||d.path===pair(file)))throw new Error('Document already registered.');
}
for(const p of [markdown,pair(markdown)]){
 try{await fs.access(path.join(root,p));throw new Error(`Refusing to overwrite ${p}`);}catch(e){if(e.code!=='ENOENT')throw e;}
}
const cell=s=>s.replaceAll('|','\\|').replaceAll('\n',' ');
const outputs=[];
const readmes=await Promise.all(['README.md','README_CN.md'].map(p=>fs.readFile(path.join(root,p),'utf8')));
for(const [i,c] of catalogs.entries()){
 const cn=i===1;const title=options[cn?'title-cn':'title'];const summary=options[cn?'summary-cn':'summary'];const caveat=options[cn?'caveat-cn':'caveat']||'';
 const report=cn?pair(file):file;const entry=cn?pair(markdown):markdown;
 const environment={scope:options.scope,testOS:options[cn?'test-os-cn':'test-os'],inferenceHardware:options[cn?'hardware-cn':'hardware']||options.hardware,hardwareStatus:'author-recorded',testOSSource:report};
 c.documents.push({id:docId,title,path:report,format:'markdown',source:'new-report/'+options.id,environment});
 c.experiments.push({id:options.id,title,date:options.date,sortDate:options.date,model:options.model,engines:options.engine.split(',').map(s=>s.trim()).filter(Boolean),scope:options.scope,category:options[cn?'category-cn':'category']||(cn?'新增实验':'New experiment'),summary,caveat,sourceStatus:'report-only',documents:[report],markdown:entry,environment,artifact:options.repo?{url:options.repo,name:title}:null});
 c.updated=new Date().toISOString().slice(0,10);
 const headings=cn?['日期','模型','引擎','推理位置','推理主机硬件','实验时系统']:['Date','Model','Engine','Inference location','Inference hardware','Test-time OS'];
 const values=[options.date,options.model,options.engine,options.scope,environment.inferenceHardware,environment.testOS];
 const text=`# ${title}\n\n[English](${path.basename(markdown)}) | [简体中文](${path.basename(pair(markdown))})\n\n| ${cn?'项目 | 记录':'Item | Record'} |\n|---|---|\n${headings.map((h,j)=>`| ${h} | ${cell(values[j])} |`).join('\n')}\n\n${summary}\n\n[${cn?'完整报告':'Full report'}](../originals/${path.basename(report)})\n${caveat?'\n'+caveat+'\n':''}`;
 const readmeName=cn?'README_CN.md':'README.md';
 const row=`| ${options.date} | ${cell(title)} | ${cell(options.model)} | [${options.id}](${entry}) |\n`;
 const readme=readmes[i].replace(/(\|[^\n]+\|[^\n]+\|[^\n]+\|[^\n]+\|\n\|---\|---\|---\|---\|\n)/,m=>m+row).replace(/\*\*\d+(?= experiment| 项实验)/,`**${c.experiments.length}`).replace(/(?<=and )\d+(?= reports)/,String(c.documents.length)).replace(/(?<=记录，)\d+(?= 份报告)/,String(c.documents.length));
 if(readme===readmes[i])throw new Error(`Cannot locate the four-column index in ${readmeName}`);
 outputs.push([readmeName,readme],[entry,text],['data/'+(cn?'catalog_CN.json':'catalog.json'),JSON.stringify(c,null,2)+'\n']);
}
// Validate both editions and prepare all content before touching maintained files.
for(const [p,text] of outputs)await fs.writeFile(path.join(root,p+'.tmp'),text,{flag:'wx'});
for(const [p] of outputs)await fs.rename(path.join(root,p+'.tmp'),path.join(root,p));
console.log(`Registered ${options.id} in both languages. Run npm run build && npm run check before publishing.`);
