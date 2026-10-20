export default {
  locale:'en',language:'English',otherLanguage:'中文',otherFile:'index_CN.html',catalog:'data/catalog.json',
  siteTitle:'LLM Test Reports · Leo’s experiment archive',allRecords:'All records',originalReport:'Original report',
  count:(n,total)=>`${n} / ${total} records`,reports:n=>`${n} report${n===1?'':'s'}`,
  scope:{local:'Local',lan:'LAN PC',cloud:'Cloud'},inference:'inference',
  availability:{published:'Artifact published',located:'Source / scripts located',reportOnly:'Report / conversation evidence'},
  result:'Historical result',download:'Download Markdown',github:'View on GitHub',artifact:'Artifact repository',
  contents:'On this page',reading:n=>`About ${n} min read`,evidence:'Historical reports and failed attempts are retained',
  unverifiedHost:'Current workstation reference only; HTML files do not establish the original inference host',reference:'Current workstation reference',environment:'Workstation and system',hardware:'MacBook Pro / M5 Max / 18-core CPU / 40-core GPU / 128 GB unified memory',
  os:'macOS 27.0.1 (26A434), Metal 4',snapshot:'Current snapshot: 2026-10-20. Test-time OS is recorded separately.',
  host:{local:'Local inference workstation',lan:'Mac client — inference ran on a LAN PC',cloud:'Mac client / local comparison — cloud hardware is unspecified'},
  testHardware:'Source-reported host',recordedOS:'Test-time OS',notRecorded:'Not recorded in the surviving test evidence',
  historicReference:'For older tests, detailed core counts are a current workstation reference unless a test-time snapshot survives.',
  profile:'Full environment notes',remote:'Remote inference hardware is not inferred from this Mac.',
  sourceLanguage:'Original figures, source code and command output retain their source-language evidence.',
  footer:'Personal experiment records / 2026'
};
