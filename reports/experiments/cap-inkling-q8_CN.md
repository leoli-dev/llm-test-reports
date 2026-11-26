# Inkling 2 Mini 在 Splash 256K 上的三题复测

[English](cap-inkling-q8.md) | [简体中文](cap-inkling-q8_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-11-26 |
| 模型 | Unsloth Inkling-2-Mini UD-Q8_K_XL |
| 引擎 | Splash 1.7.3 |
| 推理位置 | local |
| 推理主机硬件 | MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB |
| 实验时系统 | macOS 27.2.1（26B131），arm64 |

用 low 和 medium 重跑 CAP-IQ4-ENGINE 原三题。low 三题均写出源码，medium 只交付《白雪公主》。

[完整报告](../originals/2026-11-26-inkling-2-mini-splash-q8_CN.md)

每题每档各跑一次。服务配置为 256K，测试中最大单请求实际输入为 48,991 tokens。
