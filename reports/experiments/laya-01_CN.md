# Laya 本地服务 / 72 题与并发边界

[English](laya-01.md) | [简体中文](laya-01_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | LAYA-01 |
| 日期 | 2026-09-21 |
| 模型与运行方式 | aac6fef/laya-multilingual-mlx；GPU FP16；1024 tokens |
| 推理位置 | 本机 |

<!-- environment-context:start -->

## 本机配置与系统（2026-10-20 补充）

| 项目 | 记录与证据边界 |
|---|---|
| 本机用途 | 本机推理工作站 |
| 本机硬件参考 | MacBook Pro `Mac17,6`；Apple M5 Max；18 核 CPU；40 核 GPU；128 GB 统一内存（128 GiB / 137438953472 字节） |
| 原报告明确记载的主机 | Apple M5 Max / 128 GB / Python 3.12.13 |
| 当前系统快照 | macOS 27.0.1，build `26A434`，arm64，Metal 4；采集于 2026-10-20 22:03:27 UTC |
| 实验时系统 | Darwin 27.0.0；未记录 macOS 产品版本 |
| 历史配置边界 | 旧测试未保存独立快照时，详细核数只作为当前本机配置参考；内网 PC／云端推理硬件不由 Mac 配置推断 |

[完整环境说明](../../environment_CN.md)。模型、量化、引擎、缓存和请求条件以本报告原有记录为准。原始图表、源码和命令输出保留源语言证据。

<!-- environment-context:end -->

## 历史结果

72 题 37/72，51.4%；单题很快，但并发 7 有 reset 断崖。

## 原始报告

- [Laya 本地服务深度测评](../originals/devlog-projects-laya-mlx-notes-local-service-deep-evaluation-2026-09-21_CN.md)
- [本地基准测试](../originals/source-benchmarks_CN.md)

## 证据边界

Laya 是判别模型，与生成式 LLM 分列；报告中的临时 /tmp JSON 要单独核对是否仍在。
