const cn=location.pathname.endsWith('index_CN.html');
const {default:t}=await import(cn?'./i18n_CN.js':'./i18n.js');
const $=s=>document.querySelector(s);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const queryParams=new URLSearchParams(location.search);
const state={scope:queryParams.get('scope')||'all',engine:queryParams.get('engine')||'all',search:queryParams.get('q')||'',catalog:null};
if(!['all','local','lan','cloud'].includes(state.scope))state.scope='all';
function languageLink(){
 const params=new URLSearchParams();
 if(state.scope!=='all')params.set('scope',state.scope);
 if(state.engine!=='all')params.set('engine',state.engine);
 if(state.search)params.set('q',state.search);
 $('#language-switch').href=t.otherFile+(params.size?'?'+params:'')+location.hash;
}
function list(){
 const query=state.search.toLocaleLowerCase().trim();
 const rows=state.catalog.experiments.filter(r=>(state.scope==='all'||r.scope===state.scope)&&(state.engine==='all'||r.engines.includes(state.engine))&&(!query||[r.title,r.model,r.summary,r.id,r.category,...(r.searchAliases||[])].join(' ').toLocaleLowerCase().includes(query))).sort((a,b)=>b.sortDate.localeCompare(a.sortDate)||a.id.localeCompare(b.id));
 $('#result-count').textContent=t.count(rows.length,state.catalog.experiments.length);
 $('#reset').hidden=state.scope==='all'&&state.engine==='all'&&!query;
 $('#empty').hidden=!!rows.length;
 $('#experiments').innerHTML=rows.map(r=>`<tr><td class="date-cell"><time>${escape(r.date.replace(/[（(].*$/,''))}</time></td><td><a class="experiment-title" href="#test=${r.id}">${escape(r.title)}</a><p>${escape(r.summary)}</p></td><td class="model-cell"><span class="scope-tag scope-${r.scope}">${t.scope[r.scope]}</span><span>${escape(r.engines.join(' / '))}</span><small>${escape(r.model)}</small></td><td class="record-cell"><a href="#test=${r.id}">${t.reports(r.documents.length)}</a><small>${r.artifact?t.availability.published:r.sourceStatus==='located'?t.availability.located:t.availability.reportOnly}</small></td></tr>`).join('');
 languageLink();
}
function environment(test,doc){
 const env=doc.environment||test?.environment||{};
 const scope=test?.scope||env.scope||'local';
 return `<section class="environment-box" aria-label="${t.environment}"><h2>${t.environment}</h2><p><strong>${escape(env.originUnverified?t.unverifiedHost:t.host[scope])}</strong></p><p><strong>${t.reference}</strong><br>${escape(t.hardware)}<br>${escape(t.os)}</p>${env.testHardware?`<p>${t.testHardware}: <strong>${escape(env.testHardware)}</strong></p>`:''}${env.inferenceHardware?`<p>${escape(env.inferenceHardware)}</p>`:''}<p>${escape(t.recordedOS)}: <strong>${escape(env.testOS||t.notRecorded)}</strong></p><small>${escape(t.snapshot)} ${escape(scope==='local'?t.historicReference:t.remote)}</small><a href="${cn?'environment_CN.html':'environment.html'}">${t.profile} ↗</a></section>`;
}
function route(){
 languageLink();
 const params=new URLSearchParams(location.hash.slice(1));
 let test=state.catalog.experiments.find(r=>r.id===params.get('test'));
 const requested=state.catalog.documents.find(d=>d.id===params.get('doc')||d.legacyIds?.includes(params.get('doc')));
 if(!test&&requested)test=state.catalog.experiments.find(r=>r.documents.includes(requested.path));
 const isReader=!!(test||requested);
 $('#overview').hidden=isReader;$('#reader').hidden=!isReader;
 $('#current-view').textContent=isReader?(test?.id||t.originalReport):t.allRecords;
 if(!isReader){document.title=t.siteTitle;if(location.hash==='#artifacts'||location.hash==='#about')setTimeout(()=>$(location.hash)?.scrollIntoView({behavior:'instant'}),0);return;}
 const doc=requested||state.catalog.documents.find(d=>d.path===test.documents[0]);
 const paths=test?.documents||[doc.path];
 $('#document').innerHTML=paths.map(p=>{const d=state.catalog.documents.find(d=>d.path===p);return `<option value="${escape(d.id)}">${escape(d.title)}</option>`}).join('');
 if(!paths.includes(doc.path))$('#document').insertAdjacentHTML('beforeend',`<option value="${escape(doc.id)}">${escape(doc.title)}</option>`);
 $('#document').value=doc.id;
 $('#reader-summary').innerHTML=(test?`<div class="report-meta"><span>${escape(test.date)}</span><span class="scope-tag scope-${test.scope}">${t.scope[test.scope]} ${t.inference}</span><span>${escape(test.id)}</span></div><h1>${escape(test.title)}</h1><p class="model-description">${escape(test.model)}</p><div class="summary-box"><strong>${t.result}</strong><p>${escape(test.summary)}</p>${test.caveat?`<p class="caveat">${escape(test.caveat)}</p>`:''}</div>`:`<h1>${escape(doc.title)}</h1>`)+environment(test,doc);
 $('#reader-actions').innerHTML=`<a href="${escape(doc.path)}" download>${t.download}</a><a href="https://github.com/leoli-dev/llm-test-reports/blob/main/${encodeURI(doc.path)}">${t.github}</a>${test?.artifact?`<a class="action-primary" href="${test.artifact.url}">${t.artifact} ↗</a>`:''}`;
 $('#report-body').innerHTML=doc.html;
 if(test)$('#report-body').querySelectorAll('a').forEach(a=>{
  const href=a.getAttribute('href');if(!href)return;const target=new URL(href,location.href);const hash=new URLSearchParams(target.hash.slice(1));
  if(target.origin===location.origin&&hash.get('doc')===doc.id){hash.set('test',test.id);target.hash=hash.toString();a.href=target.href;}
 });
 let index=0;const headings=[...$('#report-body').querySelectorAll('h2,h3')];
 headings.forEach(h=>h.id='section-'+index++);
 $('#toc').innerHTML=`<p>${t.contents}</p><nav>${headings.map(h=>`<a href="#${h.id}" data-heading="${h.id}" class="toc-${h.tagName.toLowerCase()}">${escape(h.textContent)}</a>`).join('')}</nav><small>${t.reading(doc.readingMinutes)}<br>${t.evidence}</small>`;
 $('#toc').querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById(a.dataset.heading)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
 $('#report-body').querySelectorAll('table').forEach(table=>{const wrap=document.createElement('div');wrap.className='prose-table';table.replaceWith(wrap);wrap.append(table);});
 document.title=(test?.title||doc.title)+' · LLM Test Reports';window.scrollTo(0,0);
}
$('#search').addEventListener('input',e=>{state.search=e.target.value;list();});
$('#engine').addEventListener('change',e=>{state.engine=e.target.value;list();});
$('#scope-controls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.scope=b.dataset.scope;$('#scope-controls').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if($('#overview').hidden)location.hash='';list();});
$('#reset').addEventListener('click',()=>{state.scope='all';state.engine='all';state.search='';$('#search').value='';$('#engine').value='all';$('#scope-controls').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.scope==='all')));list();});
$('#document').addEventListener('change',e=>{const params=new URLSearchParams(location.hash.slice(1));params.set('doc',e.target.value);location.hash=params.toString();});
window.addEventListener('hashchange',()=>state.catalog&&route());
try{
 const response=await fetch(t.catalog);if(!response.ok)throw new Error('catalog '+response.status);state.catalog=await response.json();
 $('#total-count').textContent=state.catalog.experiments.length;$('#experiment-count').textContent=state.catalog.experiments.length;$('#document-count').textContent=state.catalog.documents.length;$('#updated').textContent=state.catalog.updated;
 const engines=[...new Set(state.catalog.experiments.flatMap(r=>r.engines))].sort();$('#engine').innerHTML+=engines.map(e=>`<option value="${escape(e)}">${escape(e)}</option>`).join('');
 if(!engines.includes(state.engine))state.engine='all';
 $('#search').value=state.search;$('#engine').value=state.engine;
 $('#scope-controls').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.scope===state.scope)));
 list();route();
}catch(error){console.error(error);$('#overview').hidden=true;$('#load-error').hidden=false;}
