---
type: Note
title: "MTPLX Qwen3.8 优化质量 — Pi frog-choir 测试"
status: current
description: "Pi coding-agent 的 frog-choir 运行最初被 MTPLX 中断，随后声称已完成，但独立的第 1 轮审查发现了四个核心功能缺陷。"
tags: [mtplx, qwen3.8, pi, qwen-code, frog-choir, benchmark]
timestamp: 2026-08-23T23:25:22Z
---

# MTPLX + Pi `frog-choir` 测试

[English](devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test.md) | [简体中文](devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test_CN.md)

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

| 字段 | 值 |
|---|---|
| 固定提示词 | `$HOME/Code/qwen3.8-tests/test-prompts/frog-choir.md` |
| Pi 工作目录 | `$HOME/Code/qwen3.8-tests/frog-choir_mtplx-quality-pi` |
| 主要代理 | Pi (`@earendil-works/pi-coding-agent`) 通过本地 OpenAI 兼容的 MTPLX 端点 |
| MTPLX 提供的模型 | `mtplx-qwen38-27b-optimized-quality` — Qwen3.8 27B 优化质量 |
| MTPLX 运行时 | 2.9.1 / 构建 2009009; `qwen3_next`, MTP `quality` 配置文件, 131,072-token 上下文, 推理/思考关闭 |
| 量化 | 模型权重 INT8 (组大小 64); MTP 头 INT8; 分页 KV 缓存 q8 — **非 4-bit** |
| 计划验证 | 实施计划, 项目实施, Playwright 检查, 然后 TypeScript/构建验证 |

## Pi 运行结果

Pi 完成了实施的大部分并运行了 `npm run build`。构建报告了四个需要修复的 TypeScript 类别：

- `src/App.tsx` 中未使用的 `TrackerStatus` 导入；
- `src/components/DemoPanel.tsx` 中 input 上不支持的 `orientation` 属性；
- `src/vision/HandTracker.ts` 中未使用的 `HandSide` 导入；
- `src/vision/HandTracker.ts` 中未使用的 `wrist` 局部变量。

Pi 开始下一轮以进行那四个机械编辑。在流式传输了 165 个完成 token 后，响应以以下内容终止：

```text
request cancelled via POST /v1/mtplx/cancel after 165 streamed tokens
```

服务器请求日志证据：30,798 提示词 token, 165 生成 token, 经过 20.072 秒, `request_cancelled: true`, `cancellation_reason: stream_cancelled`。

> ⚠️ 更新, 2026-08-23: Pi 随后继续并报告项目已完成，构建、25 个单元测试和 10 个 Playwright 测试通过。独立的第 1 轮审查发现，实际的摄像头路径、Web Audio 输出、手性映射和校准仍不符合任务要求。参见 [第 1 轮审查](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review_CN.md)；任务未被接受。

## 调查确定的内容

这是一条 MTPLX 显式取消路径，而不是干净的模型完成，也不是 Pi HTTP 断开连接：当 Pi 流传输仍然存在时，调用了 MTPLX 取消处理程序。发送本地 `POST /v1/mtplx/cancel/{request_id}` 的调用者尚未确定，因此将根本原因标记为 Pi 配置问题是错误的。

重启服务后的控制测试：

| 控制 | 结果 | 限制 |
|---|---|---|
| Pi, ~27.8K 提示词 token 长上下文续传，无工具 | 完成: 374 完成 token / 63.47 秒 | 无法复现工具续传 |
| Pi, ~30.1K 提示词 token 续传，暴露工具 | 完成: 317 完成 token / 80.71 秒 | 模型直接回答而不是调用工具；不是完整的工具后复现 |
| Qwen Code 0.22.0, 相同的 MTPLX 模型 | 冒烟测试在 `enable_thinking: false` 下完成 | 相同的 `frog-choir` 运行待定 |

为了归因复发，本地 MTPLX 运行时现在在 `~/.mtplx/logs/cancel-audit-8000.jsonl` 处有一个临时的仅用于诊断的审计，记录取消端点的调用者头。没有保留任何持久的 Pi 扩展策略变更。诊断服务重启中断了原始的活跃 Pi 会话，因此不得将其视为续传测试。

## 与上游问题的关系

[MTPLX #310](https://github.com/youssofal/MTPLX/issues/310) 报告了在接近 19K 序列 token 时 Pi 工具轮次的张量广播形状崩溃；[#311](https://github.com/youssofal/MTPLX/issues/311) 报告了在接近 8,192-token 边界时原始 CSS `!` 重复循环。它们共享 Qwen3.8 + Pi + 工具续传区域，但这里没有发生任何失败签名。这次运行显示了一个显式取消请求。这些问题是有用的上下文，但不是已证实的匹配。

## 来自提供的 Dashboard 快照的速度记录

该截图是模型具有 71K / 131K 上下文且使用 86.3 GB / 128 GB 内存时的共享 MTPLX Dashboard 快照：

| 指标 | 观测值 |
|---|---:|
| 5-分钟稳定解码范围 | 18.3–21.4 TPS |
| 5-分钟平均解码 | **19.9 TPS** |
| 瞬时解码 | 17.6 TPS |
| 预填充平均 | 132 TPS |
| 历史最大解码 | 67.4 TPS |

仅将 **19.9 TPS** 记录为当前的 5-分钟 Dashboard 平均值。它不是被中断的 `frog-choir` 请求的隔离平均速度：Dashboard 包含一个长的、缓存的、共享的运行时状态（3.22M 缓存 token），而失败的请求持续了大约 20 秒且未完成。

## 下一步需要的证据

参见 BENCH-03（历史本机文件，未随本报告发布）：首先使用 Qwen Code，然后使用 Pi，从新的独立目录运行确切的提示词；如果取消再次发生，保留请求级别的 token/计时记录和取消审计文件。
