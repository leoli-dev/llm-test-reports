export default {
  locale:'cn',language:'简体中文',otherLanguage:'English',otherFile:'index.html',catalog:'data/catalog_CN.json',
  siteTitle:'LLM Test Reports · Leo 的模型实验档案',allRecords:'全部记录',originalReport:'原始报告',
  count:(n,total)=>`${n} / ${total} 项记录`,reports:n=>`${n} 份报告`,
  scope:{local:'本机',lan:'内网 PC',cloud:'云端'},inference:'推理',
  availability:{published:'作品已发布',located:'已定位源码 / 脚本',reportOnly:'报告 / 会话证据'},
  result:'历史结果',download:'下载 Markdown',github:'GitHub 原文',artifact:'作品仓库',
  contents:'本页内容',reading:n=>`约 ${n} 分钟阅读`,evidence:'保留历史报告与失败记录',
  unverifiedHost:'仅供当前本机参考；HTML 文件不能证明原始推理主机',reference:'当前本机配置参考',environment:'本机配置与系统',hardware:'MacBook Pro / M5 Max / 18 核 CPU / 40 核 GPU / 128 GB 统一内存',
  os:'macOS 27.0.1（26A434），Metal 4',snapshot:'当前快照：2026-10-20；实验时的系统版本逐项注明。',
  host:{local:'本机推理工作站',lan:'Mac 为客户端；实际推理在内网 PC',cloud:'Mac 为客户端／本地对照；云端硬件未说明'},
  testHardware:'原报告主机',recordedOS:'实验时系统',notRecorded:'现存测试证据中未记录',
  historicReference:'旧测试未保存独立快照时，详细核数仅作为当前本机配置参考。',
  profile:'完整环境说明',remote:'不根据这台 Mac 的配置推断远端推理硬件。',
  sourceLanguage:'原始图表、源码和命令输出保留其源语言证据。',
  footer:'个人实验记录 / 2026'
};
