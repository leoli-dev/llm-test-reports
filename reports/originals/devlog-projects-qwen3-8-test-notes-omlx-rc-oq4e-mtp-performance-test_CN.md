---
type: Note
title: "oMLX RC + Qwen3.8-27B-oQ4e-mtp 性能测试"
status: current
description: "oMLX RC 搭配 Qwen3.8-27B-oQ4e-mtp 的运行时观察范围与可重复对照计划。"
tags: [qwen3.8, omlx-rc, oq4e, mtp, performance, benchmark]
timestamp: 2026-08-22T21:05:06Z
---

# oMLX RC + Qwen3.8-27B-oQ4e-mtp 性能测试

[English](devlog-projects-qwen3-8-test-notes-omlx-rc-oq4e-mtp-performance-test.md) | [简体中文](devlog-projects-qwen3-8-test-notes-omlx-rc-oq4e-mtp-performance-test_CN.md)

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

## 范围

观察本机 oMLX RC（Dashboard 显示 v0.6.3rc2）搭配 `Qwen3.8-27B-oQ4e-mtp` 的真实 coding-agent 运行表现，并与先前 Qwen3.8 配置的已存快照作谨慎对照。当前工作区为 `$HOME/Code/qwen3.8-tests`。

这不是尚未完成的严格横向跑分：Dashboard 数字会混入缓存和多个请求。严格结论必须来自相同 prompt、同一 agent/profile、冷/清缓存条件与独立 session 下的重复测量。

## 首个会话快照（2026-08-22）

用户提供的 Dashboard 截图显示当前模型处于 `Generating...` 状态，活跃请求约已生成 1.4k tokens、持续 1分13秒；其即时速度为 **18.6 tok/s**。Session 汇总为：

| 指标 | 观测值 | 说明 |
|---|---:|---|
| 总 prefill | 216,363 tokens | 当前 session 累计，不是单次 context 长度。 |
| Cached tokens | 151,552 | cache efficiency 为 70.0%。 |
| 非缓存 prompt processing | 528.5 tok/s | 输入预填充吞吐；不应与 decode 速度混为一谈。 |
| Session token generation | 42.4 tok/s | session 加权平均，受短请求与缓存工作流影响。 |
| 当前活跃请求 generation | 18.6 tok/s | 更接近这条长输出的即时体验，但仍需稳定区间/多次重复验证。 |
| 模型内存 | 约 25.84 GB observed / 16.60 GB estimated | Dashboard 记录；总模型池约 30.4 GB。 |

## 初步判断

- 相比此前已归档的旧 27B 长会话约 17.4–20 tok/s generation 观察值，本次 **42.4 tok/s session 平均**看起来更快；但它不能直接当作“快了多少”的结论，因为 session 构成、缓存命中与任务阶段不同。
- 当前单请求 **18.6 tok/s**落在旧长会话观察区间附近。因此需要同题、冷缓存的单请求统计，才能确认 oQ4e-mtp / RC 的实际 decode 增益。
- 528.5 tok/s 的非缓存 prefill 与 70% cache efficiency 说明这轮输入侧表现良好；对 agent 交互总体等待很重要，但不能替代生成速度比较。

## 记录与验收计划

1. 保留本次 Dashboard 截图和活跃请求完成后的结果（输出 tokens、耗时、稳定 decode 速度、错误/中断）。
2. 选定一条固定 coding prompt，以新 session 运行至少 3 次；记录 TTFT、非缓存 prefill、completion tokens、wall time、稳定 generation tok/s 与峰值内存。
3. 以相同 agent、profile、上下文/输出上限和并发度复跑旧模型；分别报告冷缓存与暖缓存，而不把两者平均数混作模型能力差异。

## 证据

- 用户截图：`/var/folders/73/34m822xx0j56plz6t32f_s3c0000gn/T/codex-clipboard-2a6e8b21-7e6e-472f-893f-46783d9de97e.png`。
- 运行时进程检查：`omlx-server` 在 2026-08-22 约占 17 GB resident memory；Qwen Code CLI 正在运行。该检查用于确认服务在跑，不构成吞吐基准。

