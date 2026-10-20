# Arcology 控制室 / Pi 尝试与 Qwen Code 交付

[English](early-02.md) | [简体中文](early-02_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | EARLY-02 |
| 日期 | 2026-08-21 |
| 模型与运行方式 | oMLX True2456/Qwen3.8-27B-AWQ-5.0bpw；Pi / Qwen Code coding-reason |
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

Qwen Code 交付并修复多项问题；最后仍有窄屏溢出及 QA 循环。Pi/MTPLX 前期另有 shape error 和重复 token 失败。

## 原始报告

- [首次成功运行 Qwen Code 测试](../originals/devlog-projects-qwen3-8-test-notes-first-successful-qwen-code-test_CN.md)
- [Arcology 控制室 — 第 1 轮审查](../originals/devlog-projects-qwen3-8-test-notes-arcology-control-room-round-1-review_CN.md)

## 证据边界

报告与会话在；原始产品源码目录未找到，不能将其当作已恢复源码。
