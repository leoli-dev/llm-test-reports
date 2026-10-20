# Hermes POS gauntlet / Cart & Pricing

[English](hermes-01.md) | [简体中文](hermes-01_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | HERMES-01 |
| 日期 | 2026-05-27 |
| 模型与运行方式 | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit；Config A |
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

01_CART_AND_PRICING：9/9 单测、build 通过；整体 7/10，越界改 UI 与后续 checkout。另有 02 任务评审路径记录。

## 原始报告

- [Hermes POS / Cart & Pricing](../originals/session-pos-gauntlet_CN.md)

## 证据边界

仅找回会话评审；hermes-pos-gauntlet、hermes-agent-eval-log 与 spec 仓库均未定位。第二任务不能仅凭历史文件名认定验收通过。
