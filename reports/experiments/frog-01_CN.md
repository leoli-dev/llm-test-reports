# Frog Choir / 首轮与修复轮

[English](frog-01.md) | [简体中文](frog-01_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | FROG-01 |
| 日期 | 2026-08-23—08-24 |
| 模型与运行方式 | MTPLX Optimized Quality + Pi / Qwen Code |
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

首轮核心功能不合格；第二轮恢复相机、音频与校准，仍有真实左右手映射问题。

## 原始报告

- [MTPLX + Pi `frog-choir` 测试](../originals/devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test_CN.md)
- [Frog Choir — 第 1 轮独立审查](../originals/devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review_CN.md)
- [Frog Choir — 第 2 轮独立评审](../originals/devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review_CN.md)

## 证据边界

旧报告用 frog-choir_mtplx-quality-pi；现目录由项目名和文件结构对应，未证明它与历史评审的逐字节版本一致。
