# CLOUD-03 证据

[English](README.md) | [简体中文](README_CN.md)

这是2026-11-20作品评测的精选证据，不是新模型生成实验。候选源码保留于固定公开仓库。`generation-provenance.json`区分原作者自述、检查过的任务消息和未知项；独立笔记保留源语言，历史说法以最终报告和共识限定。

ZIP含本目录、报告配图、Codex原始观察JPEG及Claude原始JPEG/JSON截图（不含联系表拼图）；公开清单记录哈希。移镜中截图、错误选择器和失败观察运行有意保留并标注，不是候选失败。

在新临时目录复现：

```sh
export SCRATCH_ROOT="$PWD"
git clone https://github.com/leoli-dev/snowglobe-park.git
git -C snowglobe-park checkout 2eee3d5c4110dde4a351b758975f480594875684
git clone https://github.com/leoli-dev/noel-globe.git
git -C noel-globe checkout 239e9bba12bb20a01513e7a9189d422905ed1232
(cd snowglobe-park && npm ci --ignore-scripts && npm run build)
(cd noel-globe && npm ci --ignore-scripts && npm run build)
npm install --no-save --ignore-scripts playwright-core@1.65.1
python3 -m http.server 8462 --bind 127.0.0.1
```

在另一个终端进入同一临时根目录，把ZIP的`evidence/`复制到此处并创建`claude-shots/`。脚本导入`playwright-core`；`BROWSER_PATH`默认为macOS Thorium路径，其他平台也应明确选Thorium；`BASE_URL`默认为`http://127.0.0.1:8462`，不要替换成Google Chrome。

- `scripts/evaluate.mjs`：首轮功能、拍照/下载/持久化/竖屏。公开版已纠正计数选择器，原`functional.json`仍保留0/0，`corrections.json`为60/82。
- `scripts/correct-and-probe.mjs`：稳定视角、纠正计数、键盘、新开竖屏拍照下载、离线与禁用WebGL启动。
- `scripts/stress.mjs`：天气/时间/尺寸变化的存活GL计数，不测内存字节或无限拍照。
- `scripts/focus-probe.mjs`：Snowglobe玲娜贝儿最终机位。原输出名含`obstructed`，但稳定截图实际推翻了遮挡猜测；报告图片改用中性名称。
- `scripts/joint-probes.mjs`：标签滚轮/相邻canvas对照、Noël稳定图鉴缺陷。
- `scripts/performance.mjs`：完整合成全画布ABBA×2。先关其他浏览器测试；`observer-performance-*`是被排除尝试，不是最终表格样本。
- `scripts/live-smoke.mjs`：公开Pages启动/天气冒烟；`live-http.json`另记录HTML哈希。
- `scripts/claude/`：原始场景、标签、取景/演出补测；主脚本运行`node evidence/scripts/claude/run.mjs sg`或`noel`，可选`mobile`。原始截图没有生成式编辑；只含画布的图片是原始截图clip，不用拼图当原始证据。

公开转换：本地临时/依赖路径改为可配置变量或`<scratch>`；去除ANSI日志颜色和电池标识；保留配图、任务文本和数值测量的字节/哈希。`source-hashes.json`记录原观察脚本/评议及配图来源哈希。不得公开完整私人消息历史文件；不打包凭据、私有服务、node_modules、模型权重或缓存。
