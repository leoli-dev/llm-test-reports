# Neon Bastion / ds-v4-flash-vision 55-task

[English](neon-03.md) | [简体中文](neon-03_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | NEON-03 |
| 日期 | 2026-09-08—09-16 |
| 模型与运行方式 | ds-v4-flash-vision + DeepSeek Harness；云端对照 |
| 推理位置 | 云端 |

<!-- environment-context:start -->

## 本机配置与系统（2026-10-20 补充）

| 项目 | 记录与证据边界 |
|---|---|
| 本机用途 | Mac 为客户端／本地对照；云端硬件未记录 |
| 本机硬件参考 | MacBook Pro `Mac17,6`；Apple M5 Max；18 核 CPU；40 核 GPU；128 GB 统一内存（128 GiB / 137438953472 字节） |
| 原报告明确记载的主机 | 详见原报告；未以当前快照补造历史配置 |
| 当前系统快照 | macOS 27.0.1，build `26A434`，arm64，Metal 4；采集于 2026-10-20 22:03:27 UTC |
| 实验时系统 | 现存测试证据中未记录；不以当前系统版本倒填 |
| 历史配置边界 | 旧测试未保存独立快照时，详细核数只作为当前本机配置参考；内网 PC／云端推理硬件不由 Mac 配置推断 |

[完整环境说明](../../environment_CN.md)。模型、量化、引擎、缓存和请求条件以本报告原有记录为准。原始图表、源码和命令输出保留源语言证据。

<!-- environment-context:end -->

## 历史结果

55/55 任务完成；历史最终记录 550 单测、122 E2E；人工验收仍发现测试遗漏。

## 原始报告

- [Neon Bastion ds-v4-flash-vision 运行 — A01–A03](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-ds-v4-flash-vision-run-2026-09-08_CN.md)
- [Neon Bastion 三轮测试横向总结](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-three-rounds-summary-2026-09-16_CN.md)

## 证据边界

代码在本机，推理为云端；不能计作本机模型跑分。单轮 note 的旧标题与正文最终状态不一致，最终状态看三轮总结及验收文档。
