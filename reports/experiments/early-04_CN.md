# LLM 内存带宽教学页 / 三轮 review

[English](early-04.md) | [简体中文](early-04_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | EARLY-04 |
| 日期 | 2026-08-22—08-23 |
| 模型与运行方式 | oMLX RC Qwen3.8-27B-oQ4e-mtp + Qwen Code |
| 推理位置 | 本机 |

<!-- environment-context:start -->

## 本机配置与系统（2026-10-20 补充）

| 项目 | 记录与证据边界 |
|---|---|
| 本机用途 | 本机推理工作站 |
| 本机硬件参考 | MacBook Pro `Mac17,6`；Apple M5 Max；18 核 CPU；40 核 GPU；128 GB 统一内存（128 GiB / 137438953472 字节） |
| 原报告明确记载的主机 | 详见原报告；未以当前快照补造历史配置 |
| 当前系统快照 | macOS 27.0.1，build `26A434`，arm64，Metal 4；采集于 2026-10-20 22:03:27 UTC |
| 实验时系统 | 现存测试证据中未记录；不以当前系统版本倒填 |
| 历史配置边界 | 旧测试未保存独立快照时，详细核数只作为当前本机配置参考；内网 PC／云端推理硬件不由 Mac 配置推断 |

[完整环境说明](../../environment_CN.md)。模型、量化、引擎、缓存和请求条件以本报告原有记录为准。原始图表、源码和命令输出保留源语言证据。

<!-- environment-context:end -->

## 历史结果

经历 Canvas、公式、控件、数据与 autoplay 修复；会话最终结案只剩 1 个 P1：M5 Max 失效来源 URL 被标 confirmed。

## 原始报告

- [LLM 带宽展示 — oQ4e-mtp 交付测试](../originals/devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test_CN.md)
- [LLM 带宽展示 — 第 1 轮评审](../originals/devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review_CN.md)
- [LLM 带宽展示 — 第 2 轮评审与范围扩展](../originals/devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review_CN.md)
- [LLM 带宽展示 — 第 3 轮评审](../originals/devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review_CN.md)

## 证据边界

四篇报告在，产品源码目录未找到。
