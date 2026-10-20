---
type: Note
title: "Frog Choir — 第 2 轮独立评审"
status: current
description: "第 2 轮恢复了相机/音频/校准路径，且所有自动化检查均通过，但真机证据表明当前的左右手互换逻辑是反向的。"
tags: [frog-choir, code-review, mediapipe, web-audio, qwen-code, mtplx]
timestamp: 2026-08-24T03:13:46Z
---

# Frog Choir — 第 2 轮独立评审

[English](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review_CN.md)

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

## 范围与证据

在第 1 轮整改后，重新评审了 `$HOME/Code/qwen3.8-tests/frog-choir_mtplx-quality-pi`。用户提供了真机截图，显示相机预览、手部骨架、实时状态、舞台及控件均正常工作。同一真机测试证实，检测到的左右映射是反向的。

独立自动化验证：

| 命令 | 结果 |
|---|---|
| `npm run build` | 通过 |
| `npm test` | 在 7 个文件中 35/35 通过 |
| `npm run e2e` | 11/11 通过 |

## 第 1 轮整改状态

| ID | 状态 | 证据 |
|---|---|---|
| FE-05 — 已授权的相机画面空白 | 已修复 | 待流从 `CameraPreview` 挂载回调中附加；模拟相机的 Playwright 测试验证了 `srcObject`、就绪帧及预期像素。`src/hooks/useCamera.ts:23-31`；`src/components/CameraPreview.tsx:12-21`；`e2e/frog-choir.spec.ts:197-243`。 |
| FE-06 — 持续机器蜂鸣声 | 代码已修复；用户报告仅剩左右手问题 | `CroakEngine` 现在调度有限的双声蛙叫增益包络并停止每个振荡器；5 专用单元测试断言阈值下的静音、包络、速率、静音及销毁。`src/lib/croak.ts:1-170`；`src/lib/croak.test.ts`。 |
| FE-08 — 共享/无效的校准 | 已修复 | 钩子存储独立的 `userLeft` / `userRight` 校准状态和引用；专用测试覆盖不同的范围且无覆盖。`src/hooks/useHandTracking.ts:42-78,188-223`；`src/hooks/useHandTracking.calibration.test.ts`。 |
| QA-04 — 缺少相机/音频边界覆盖 | 实质性关闭 | 添加了 3 相机钩子测试、5 音频测试以及模拟流 E2E 测试；自动化检查现在覆盖了之前的空白预览故障。这不能替代特定设备的手动验收。 |

## 剩余 P1：真机左右手方向反向

当前实现显式地互换了 MediaPipe 标签：

| 传入标签 | 当前目标 | 真机预期目标 |
|---|---|---|
| `Left` | `userRight` / 低部 | `userLeft` / 高部 |
| `Right` | `userLeft` / 高部 | `userRight` / 低部 |

证据比之前基于文档的假设更强：在用户的实际相机管线中，物理左手出现在预期的镜像预览位置，但驱动的是右/低状态。正确的下一步变更是刻意微小的：移除 `src/lib/handMapping.ts:16-24` 中的标签互换，更新 `src/lib/handMapping.test.ts`，重新运行三个自动化命令，然后分别手动测试每只手。

当前的映射单元测试是循环的：它断言了与生产环境实现相同的互换映射，这就是为什么所有 35 单元测试通过而真机失败的原因。它必须随实现一起更改。

## 结论

**要求修改 — 剩余一个 P1。** 相机、声音、校准、构建、单元测试和 E2E 已实质性改进，且用户确认主要交互现在可以运行。在单手真机检查确认左→高且右→低之前，不要标记为最终验收。
