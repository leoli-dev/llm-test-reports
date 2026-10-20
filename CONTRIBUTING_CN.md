# 添加测试报告

[English](CONTRIBUTING.md) | [简体中文](CONTRIBUTING_CN.md)

本仓库保存报告。游戏、网站等产物放在独立仓库；尽可能链接到产物的固定提交。

## 命名与语言

- 英文为默认版本：使用 `reports/originals/YYYY-MM-DD-topic.md`，并提供完整中文版本 `YYYY-MM-DD-topic_CN.md`。正文、表格、失败与局限都要翻译，摘要不能代替全文。
- 中文文档、JSON 目录与 HTML 入口在扩展名前加 `_CN`。技术源码、原始截图保留证据语言，两种报告都提供说明。
- 产物仓库命名为 `llm-test-YYYY-MM-DD-{type}-{name}`，日期采用该测试的**开始日期**。示例：`llm-test-2026-09-01-game-neon-bastion`、`llm-test-2026-10-20-game-tank-battle`。
- 修复轮归入同一测试链；不同模型的独立重跑可单列。日期未知时明确说明，不用导入日期代替测试日期。

## 记录实际环境

使用配对的[报告模板](templates/report_CN.md)。记录推理主机的芯片／CPU、GPU、内存、系统版本与 build、架构、引擎与 Agent 版本、模型 revision／量化、缓存和请求参数。内网 PC 或云端模型需分别记录客户端与推理主机。缺失信息写明**未记录**。

[本机配置快照](environment_CN.md)是有日期的参考，不可用当前系统版本倒填缺失的历史系统。保存实际采集的硬件／状态证据，去掉身份标识与凭据。

## 注册报告配对

1. 保存两份全文 Markdown 并互相链接。图片放入 `assets/`，从报告使用 `../../assets/...` 引用。移除凭据、私人会话与私有端点，保留测量值与实验事实。
2. 运行注册脚本（以下仅为用法示例，不是测量结果）：

```sh
node scripts/add-report.mjs \
  --id EXP-2026-10-21-example \
  --title 'Example experiment' \
  --title-cn '实验示例' \
  --date 2026-10-21 \
  --model 'Exact model name and quantization' \
  --engine MLTF \
  --scope local \
  --file reports/originals/2026-10-21-example.md \
  --summary 'Observed result and evidence limits' \
  --summary-cn '实测结果与证据边界' \
  --hardware 'MacBook Pro / Apple M5 Max / CPU 18 / GPU 40 / 128 GB' \
  --test-os 'Not recorded' \
  --test-os-cn '未记录'
```

`--scope` 为 `local`、`lan` 或 `cloud`，表示**推理位置**，不由源码目录决定。`--file` 是英文报告，必须有对应 `_CN.md`。`--engine` 可用逗号分隔。可选 `--repo` 链接作品；使用证据边界时同时填写 `--caveat`、`--caveat-cn`。脚本生成两种实验入口并更新两份目录。`--hardware` 写实际推理主机配置，未知时明确写未记录；`--test-os` 和 `--test-os-cn` 写实验时系统证据。

3. 运行 `npm ci --ignore-scripts`、`npm run build`、`npm run check`，然后 `npm run preview`。在 Chromium 检查中英版本、当前报告语言切换、搜索、组合筛选、图片、下载及窄屏布局。
4. 提交报告配对、图片与两份目录。推送 main 后，GitHub Pages 自动构建并发布静态站。

## 历史证据与来源

`reports/originals/` 保存全文版本，`reports/experiments/` 按实验组织。首次导入的 HTML 报告已转为 Markdown。仅从会话找回的记录保留相应标识，不能因此声称源码已找回。

`data/provenance_CN.json` 保留原始来源哈希、首次导入哈希与当前翻译文件哈希。翻译必须保留图表、源码、命令、数值字面量、失败、不确定性和人工介入。公开发布时概括私人路径或重定位链接，应记录变换。不要在已维护的双语档案上重新运行首次导入脚本。

本机找到源码与产物已经发布是两件事。不要上传权重、`node_modules`、虚拟环境、客户端 auth、完整私人会话或含凭据的请求日志。发布校验不等于新增模型 benchmark。
