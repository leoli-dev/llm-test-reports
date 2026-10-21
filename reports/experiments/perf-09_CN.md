# Splash vs MLTF / 复现 PERF-06 的 128K 图文性能

[English](perf-09.md) | [简体中文](perf-09_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-10-21 |
| 模型 | Qwen3.8-27B MLX affine 8bit / MLTF q8c; INT8 KV |
| 引擎 | Splash,MLTF |
| 推理位置 | local |
| 推理主机硬件 | MacBook Pro / Apple M5 Max / 18 核 CPU / 40 核 GPU / 128 GiB 统一内存 |
| 实验时系统 | macOS 27.0.1（26A434），arm64；测试时 hardware.json 快照 |

新进程 ABBA 复测：四轮均满 4096 输出，图片与恢复检查通过。Splash 平均总耗时 633.02 秒，MLTF 777.38 秒；正文交付率 29.36 vs 27.97 tok/s。

[完整报告](../originals/2026-10-21-splash-vs-mltf-perf06-replay_CN.md)

每个后端两项任务。本次 MLTF 未复现历史 PERF-06 速度，原因尚未隔离。保留一次 status 遥测超时（证据审计 66/67）；未验证生成代码正确性或一般质量。
