"""Import a local retrieval manifest into a portable, publication-ready archive.
Run with uv run --with markdownify python scripts/import_archive.py --inventory PATH.
Only report content and referenced figures are imported. Product code stays separate.
"""
from pathlib import Path
from urllib.parse import unquote, urlparse
from markdownify import markdownify
import argparse, hashlib, json, re, shutil

ap=argparse.ArgumentParser();ap.add_argument('--inventory',type=Path,required=True);args=ap.parse_args()
ROOT=Path(__file__).resolve().parents[1];inventory=json.loads(args.inventory.read_text())
Q=args.inventory.parent.parent;CODE=Q.parent;HOME=CODE.parent
DEV=CODE/'project-devlog';OLD=CODE/'local_llm_testing';BENCH=HOME/'local_llms/mltf/records/history/benchmarks'
PC=HOME/'Documents/Codex/2026-10-06/new-chat'
NEON='https://github.com/leoli-dev/llm-test-2026-09-01-game-neon-bastion'
TANK='https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle'
source_roots=[(DEV,'devlog'),(OLD,'early-tests'),(Q,'qwen-tests'),(BENCH,'engine-tests'),(PC,'lan-pc')]
for d in ['reports/originals','reports/experiments','assets/figures','data']:(ROOT/d).mkdir(parents=True,exist_ok=True)

def source_key(p):
 for root,name in source_roots:
  if p.is_relative_to(root):return name+'/'+str(p.relative_to(root))
 return 'source/'+p.name

def slug(s):
 return re.sub(r'[^a-z0-9-]+','-',s.lower()).strip('-')[:130] or 'report'

def target_for(p):
 key=source_key(p);stem=slug(str(Path(key).with_suffix('')))
 return 'reports/originals/'+stem+'.md'

paths={Path(x['path']) for r in inventory['records'] for x in r['checked_reports'] if x['exists'] and x['path'].endswith(('.md','.html'))}
paths.discard(args.inventory.parent/'SESSIONS.md')
paths.update(p for p in (DEV/'projects/qwen3.8-test/notes').glob('*.md') if 'source-inventory' not in p.name)
# Prefer the canonical Markdown when the same report is available as HTML.
paths={p for p in paths if p.suffix!='.html' or not p.with_suffix('.md').exists()}
registry={p:target_for(p) for p in sorted(paths)}
missing=[];figures={};provenance=[];documents=[]

def resolve(src,dest):
 dest=unquote(dest.strip('<>'))
 if dest.startswith('/projects/'):p=DEV/dest.lstrip('/')
 elif dest.startswith('/Users/'):p=Path(dest)
 elif dest.startswith('~/'):p=HOME/dest[2:]
 elif dest.startswith('/tmp/'):p=Path(dest)
 else:p=src.parent/dest
 # The historical engine folder was migrated intact.
 old=str(HOME/'mlx-dspark/benchmarks')
 if str(p).startswith(old):p=BENCH/str(p)[len(old):].lstrip('/')
 return p.resolve(strict=False)

def figure(src,dest):
 if dest.startswith(('https://','http://','data:')):return dest
 p=resolve(src,dest)
 if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.webp','.gif','.svg'}:
  b=p.read_bytes();digest=hashlib.sha256(b).hexdigest();name=digest[:12]+'-'+slug(p.stem)+p.suffix.lower()
  out=ROOT/'assets/figures'/name
  if not out.exists():out.write_bytes(b)
  figures[str(p)]='assets/figures/'+name
  return '../../assets/figures/'+name
 missing.append({'source':source_key(src),'reference':Path(dest).name,'kind':'figure'})
 return None

def rewrite_links(text,src,outpath):
 def image(m):
  alt=m.group(1);dest=m.group(2).strip();url=figure(src,dest)
  return f'![{alt}]({url})' if url else f'*历史图片未保留：{alt}*'
 text=re.sub(r'!\[([^\]]*)\]\((<[^>]+>|[^)]+)\)',image,text)
 def link(m):
  label,dest=m.group(1),m.group(2).strip()
  if dest.startswith(('http:','https:','mailto:','#','data:')):return m.group(0)
  # Images have already been rewritten.
  if dest.startswith('../../assets/'):return m.group(0)
  anchor='';plain=dest.strip('<>')
  if '#' in plain:plain,anchor=plain.split('#',1);anchor='#'+anchor
  p=resolve(src,plain)
  if p in registry:
   # Both originals live in the same directory.
   return f'[{label}]({Path(registry[p]).name}{anchor})'
  for root,repo in [(Q/'mlx-dspark-27B-8bit-with-pi-3d-team-arena',NEON),(Q/'mltf-27b-pi-tank-battle-2026-10-20/game',TANK+'/tree/main/game')]:
   if p.is_relative_to(root):
    rel=str(p.relative_to(root));return f'[{label}]({repo})' if rel=='.' else f'[{label}]({repo})'
  if p.suffix.lower() in {'.png','.jpg','.jpeg','.svg','.webp'}:
   url=figure(src,plain)
   if url:return f'[{label}]({url})'
  missing.append({'source':source_key(src),'reference':Path(plain).name,'kind':'local-reference'})
  return label+'（历史本机文件，未随本报告发布）'
 text=re.sub(r'(?<!!)\[([^\]]+)\]\((<[^>]+>|[^)]+)\)',link,text)
 # Preserve code/path context without publishing account names or LAN addresses.
 text=re.sub(r'/Users/[^/\s`"<>]+/', '$HOME/',text)
 text=re.sub(r'(?<![\w.])(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?','LAN_MODEL_HOST',text)
 text=text.replace('https://github.com/leoli-dev/neon-bastion','https://github.com/leoli-dev/llm-test-2026-09-01-game-neon-bastion')
 text=text.replace('https://leoli-dev.github.io/neon-bastion/','https://leoli-dev.github.io/llm-test-2026-09-01-game-neon-bastion/')
 return text

for p,outpath in registry.items():
 raw=p.read_text(errors='replace')
 body=markdownify(raw,heading_style='ATX') if p.suffix=='.html' else raw
 body=rewrite_links(body,p,outpath)
 (ROOT/outpath).write_text(body)
 fm=re.search(r'^title:\s*(.+)$',body,re.M);h=re.search(r'^#\s+(.+)$',body,re.M)
 title=(fm.group(1).strip('"') if fm else h.group(1) if h else p.stem)
 documents.append({'id':Path(outpath).stem,'title':title,'path':outpath,'format':'html-converted' if p.suffix=='.html' else 'markdown','source':source_key(p)})
 provenance.append({'path':outpath,'source':source_key(p),'sourceSha256':hashlib.sha256(raw.encode()).hexdigest(),'publishedSha256':hashlib.sha256(body.encode()).hexdigest(),'changes':['local-links-relocated','account-and-LAN-paths-generalized']+(['html-to-markdown'] if p.suffix=='.html' else [])})

def session_doc(name,title,tid,ordinals):
 es=json.loads((args.inventory.parent/'session-excerpts.json').read_text())
 selected=[e for e in es if e['thread_id']==tid and e['ordinal'] in ordinals]
 body='# '+title+'\n\n来源：原会话中保存的独立评审。原报告／源码目录本次未定位；以下是原报告消息摘录，不是重新测评。\n\n'
 for e in selected:body+='## 原评审记录 '+str(e['ordinal'])+'\n\n'+e['text']+'\n\n'
 path='reports/originals/session-'+name+'.md'
 body=rewrite_links(body,args.inventory.parent/'SESSIONS.md',path)
 (ROOT/path).write_text(body);documents.append({'id':Path(path).stem,'title':title,'path':path,'format':'session-recovered','source':'session-recovered/'+name})
 return path

session_paths={}
for c,ordinal in zip('abcde',[847,973,1085,1254,1397]):
 session_paths['HERMES-'+str(ord(c)-ord('a')+2).zfill(2)]=session_doc('cafe-pos-config-'+c,'Hermes Cafe POS / Config '+c.upper(),'019e6765-9208-7981-8316-717ac4568029',[ordinal,1405])
session_paths['HERMES-01']=session_doc('pos-gauntlet','Hermes POS / Cart & Pricing','019e6765-9208-7981-8316-717ac4568029',[573])
session_paths['EARLY-01']=session_doc('boston-map','Boston 地图：测试结果与复制参考的纠正','01a02f57-ee56-7040-9511-cf8c883de3c4',[936,1086,1109,1120])

def classify(r):
 s=(r['model']+' '+r['title']).lower();eng=[]
 for name,token in [('MLTF','mltf'),('mlx-dspark','mlx-dspark'),('mlx-vlm','mlx-vlm'),('MTPLX','mtplx'),('oMLX','omlx')]:
  if token in s:eng.append(name)
 scope='cloud' if r['group']=='云端比较项' else 'lan' if r['group']=='内网 PC 推理服务测试' else 'local'
 return eng or ['其他'],scope

experiments=[]
for r in inventory['records']:
 id=r['id'];docs=[]
 for x in r['checked_reports']:
  p=Path(x['path'])
  if p.suffix=='.html' and p.with_suffix('.md') in registry:p=p.with_suffix('.md')
  if p in registry and registry[p] not in docs:docs.append(registry[p])
 if id in session_paths:docs.insert(0,session_paths[id])
 if not docs:
  # Explicit record-only specimens must not be presented as completed reports.
  path='reports/originals/'+id.lower()+'-record.md';(ROOT/path).write_text('# '+r['title']+'\n\n'+r['historical_result']+'\n\n'+r['caveat']+'\n')
  docs=[path];documents.append({'id':Path(path).stem,'title':r['title'],'path':path,'format':'record-only','source':'inventory-record/'+id})
 engines,scope=classify(r)
 artifact=None
 if id=='NEON-01':artifact={'url':NEON,'play':'https://leoli-dev.github.io/llm-test-2026-09-01-game-neon-bastion/','name':'Neon Bastion'}
 if id=='TANK-01':artifact={'url':TANK,'play':'https://leoli-dev.github.io/llm-test-2026-10-20-game-tank-battle/','name':'Tank Battle'}
 if id.startswith('TET-'):artifact={'url':'https://github.com/leoli-dev/local-llm-tetris-code-test','name':'Tetris 同题作品'}
 if id.startswith('SHOP-'):artifact={'url':'https://github.com/leoli-dev/local-llm-shoping-mvp-test','name':'Shopping MVP 同题作品'}
 date=re.search(r'20\d{2}-\d{2}-\d{2}',r['date']);sortdate=date.group(0) if date else '2026-06-01' if '2026-06' in r['date'] else '0000-00-00'
 path='reports/experiments/'+id.lower()+'.md'
 caveat=re.sub(r'~/|/Users/[^/]+/','',r['caveat'])
 body='# '+r['title']+'\n\n| 项目 | 记录 |\n|---|---|\n| 编号 | '+id+' |\n| 日期 | '+r['date']+' |\n| 模型与运行方式 | '+r['model']+' |\n| 推理位置 | '+{'local':'本机','lan':'内网 PC，Mac 为客户端','cloud':'云端对照'}[scope]+' |\n\n## 历史结果\n\n'+r['historical_result']+'\n\n## 原始报告\n\n'
 for d in docs:body+='- ['+next(x['title'] for x in documents if x['path']==d)+'](../originals/'+Path(d).name+')\n'
 if artifact:body+='\n## 测试产物\n\n- ['+artifact['name']+']('+artifact['url']+')\n'+('- [浏览器试玩]('+artifact['play']+')\n' if artifact.get('play') else '')
 body+='\n## 证据边界\n\n'+(caveat or '历史成绩由原报告保存，本次发布没有重新测评模型。')+'\n'
 (ROOT/path).write_text(body)
 experiments.append({'id':id,'title':r['title'],'date':r['date'],'sortDate':sortdate,'model':r['model'],'engines':engines,'scope':scope,'category':r['group'],'summary':r['historical_result'],'caveat':caveat,'sourceStatus':'located' if r['source_status']=='located' else 'report-only','documents':docs,'markdown':path,'artifact':artifact})

# Explicit cover figures from the two separately published experiments.
for name,p in [('tank',Q/'mltf-27b-pi-tank-battle-2026-10-20/github-share/evidence/r4-wide.png'),('neon',Q/'mlx-dspark-27B-8bit-with-pi-3d-team-arena/docs/hero.png')]:
 if p.exists():shutil.copyfile(p,ROOT/'assets'/f'{name}.png')
archive={'title':'LLM Test Reports','updated':'2026-10-20','author':'leoli-dev','experiments':experiments,'documents':documents}
(ROOT/'data/catalog.json').write_text(json.dumps(archive,ensure_ascii=False,indent=2)+'\n')
(ROOT/'data/provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
# Missing historical source links are documented, never silently rendered as broken links.
(ROOT/'data/import-notes.json').write_text(json.dumps({'missingReferences':missing,'figureCount':len(figures),'notes':['Historical results are unchanged. Local account paths and private LAN addresses are generalized.','Product code is maintained in separate repositories. Source availability does not imply public hosting.']},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'experiments':len(experiments),'documents':len(documents),'figures':len(figures),'historicalMissingReferences':len(missing)},ensure_ascii=False))
