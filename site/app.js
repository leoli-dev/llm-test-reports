const $=s=>document.querySelector(s);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={scope:'all',engine:'all',search:'',catalog:null};
const scopeName={local:'本机',lan:'内网 PC',cloud:'云端'};
function list(){
 const query=state.search.toLocaleLowerCase().trim();
 const rows=state.catalog.experiments.filter(r=>(state.scope==='all'||r.scope===state.scope)&&(state.engine==='all'||r.engines.includes(state.engine))&&(!query||[r.title,r.model,r.summary,r.id,r.category].join(' ').toLocaleLowerCase().includes(query))).sort((a,b)=>b.sortDate.localeCompare(a.sortDate)||a.id.localeCompare(b.id));
 $('#result-count').textContent=`${rows.length} / ${state.catalog.experiments.length} 项记录`;
 $('#reset').hidden=state.scope==='all'&&state.engine==='all'&&!query;
 $('#empty').hidden=!!rows.length;
 $('#experiments').innerHTML=rows.map(r=>`<tr><td class="date-cell"><time>${escape(r.date.replace(/（.*$/,''))}</time></td><td><a class="experiment-title" href="#test=${r.id}">${escape(r.title)}</a><p>${escape(r.summary)}</p></td><td class="model-cell"><span class="scope-tag scope-${r.scope}">${scopeName[r.scope]}</span><span>${escape(r.engines.join(' / '))}</span><small>${escape(r.model.replace(/^[^；]+；/,''))}</small></td><td class="record-cell"><a href="#test=${r.id}">${r.documents.length} 份报告</a><small>${r.artifact?'作品已发布':r.sourceStatus==='located'?'已定位源码 / 脚本':'报告 / 会话证据'}</small></td></tr>`).join('');
}
function route(){
 const params=new URLSearchParams(location.hash.slice(1));
 let test=state.catalog.experiments.find(r=>r.id===params.get('test'));
 const requested=state.catalog.documents.find(d=>d.id===params.get('doc'));
 if(!test&&requested)test=state.catalog.experiments.find(r=>r.documents.includes(requested.path));
 const isReader=!!(test||requested);
 $('#overview').hidden=isReader;$('#reader').hidden=!isReader;
 $('#current-view').textContent=isReader?(test?.id||'原始报告'):'全部记录';
 if(!isReader){document.title='LLM Test Reports · Leo 的模型实验档案';if(location.hash==='#artifacts'||location.hash==='#about')setTimeout(()=>$(location.hash)?.scrollIntoView({behavior:'instant'}),0);return;}
 const doc=requested||state.catalog.documents.find(d=>d.path===test.documents[0]);
 const paths=test?.documents||[doc.path];
 $('#document').innerHTML=paths.map(p=>{const d=state.catalog.documents.find(d=>d.path===p);return `<option value="${escape(d.id)}">${escape(d.title)}</option>`}).join('');
 if(!paths.includes(doc.path))$('#document').insertAdjacentHTML('beforeend',`<option value="${escape(doc.id)}">${escape(doc.title)}</option>`);
 $('#document').value=doc.id;
 $('#reader-summary').innerHTML=test?`<div class="report-meta"><span>${escape(test.date)}</span><span class="scope-tag scope-${test.scope}">${scopeName[test.scope]}推理</span><span>${escape(test.id)}</span></div><h1>${escape(test.title)}</h1><p class="model-description">${escape(test.model)}</p><div class="summary-box"><strong>历史结果</strong><p>${escape(test.summary)}</p>${test.caveat?`<p class="caveat">${escape(test.caveat)}</p>`:''}</div>`:`<h1>${escape(doc.title)}</h1>`;
 $('#reader-actions').innerHTML=`<a href="${escape(doc.path)}" download>下载 Markdown</a><a href="https://github.com/leoli-dev/llm-test-reports/blob/main/${encodeURI(doc.path)}">GitHub 原文</a>${test?.artifact?`<a class="action-primary" href="${test.artifact.url}">作品仓库 ↗</a>`:''}`;
 $('#report-body').innerHTML=doc.html;
 let index=0;const headings=[...$('#report-body').querySelectorAll('h2,h3')];
 headings.forEach(h=>h.id='section-'+index++);
 $('#toc').innerHTML=`<p>本页内容</p><nav>${headings.map(h=>`<a href="#${h.id}" data-heading="${h.id}" class="toc-${h.tagName.toLowerCase()}">${escape(h.textContent)}</a>`).join('')}</nav><small>约 ${doc.readingMinutes} 分钟阅读<br>保留历史报告与失败记录</small>`;
 $('#toc').querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById(a.dataset.heading)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
 $('#report-body').querySelectorAll('table').forEach(t=>{const wrap=document.createElement('div');wrap.className='prose-table';t.replaceWith(wrap);wrap.append(t);});
 document.title=(test?.title||doc.title)+' · LLM Test Reports';window.scrollTo(0,0);
}
$('#search').addEventListener('input',e=>{state.search=e.target.value;list();});
$('#engine').addEventListener('change',e=>{state.engine=e.target.value;list();});
$('#scope-controls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.scope=b.dataset.scope;$('#scope-controls').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if($('#overview').hidden)location.hash='';list();});
$('#reset').addEventListener('click',()=>{state.scope='all';state.engine='all';state.search='';$('#search').value='';$('#engine').value='all';$('#scope-controls').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.scope==='all')));list();});
$('#document').addEventListener('change',e=>{const params=new URLSearchParams(location.hash.slice(1));params.set('doc',e.target.value);location.hash=params.toString();});
window.addEventListener('hashchange',()=>state.catalog&&route());
try{
 const response=await fetch('data/catalog.json');if(!response.ok)throw new Error('catalog '+response.status);state.catalog=await response.json();
 $('#total-count').textContent=state.catalog.experiments.length;$('#experiment-count').textContent=state.catalog.experiments.length;$('#document-count').textContent=state.catalog.documents.length;$('#updated').textContent=state.catalog.updated;
 const engines=[...new Set(state.catalog.experiments.flatMap(r=>r.engines))].sort();$('#engine').innerHTML+=[...engines].map(e=>`<option value="${escape(e)}">${escape(e)}</option>`).join('');
 list();route();
}catch(error){console.error(error);$('#overview').hidden=true;$('#load-error').hidden=false;}
