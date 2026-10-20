---
type: Note
title: "LLM 带宽展示 — 第 1 轮评审"
status: current
description: "独立首轮评审在 oQ4e-mtp 交付中发现三个 P1 正确性问题：空白的 Canvas 动画、无效的卸载速度数值，以及无操作（no-op）的上下文控制。"
tags: [qwen3.8, oq4e, mtp, review, frontend, canvas, correctness]
timestamp: 2026-08-23T01:32:10Z
---

# LLM 带宽展示 — 第 1 轮评审

[English](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review_CN.md)

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

## 结论

**Request Changes.** 页面静态结构、数据与文案的分离良好，JS 语法和本地页面加载均通过；但三项 P1 问题使核心教学结论不可靠或缺少功能。

## 发现

### FE-03 — Canvas 动画首次加载为空白（P1）

独立浏览器检查 `http://localhost:8000/`：Canvas 具备正确的 CSS/位图尺寸（1066×380 CSS px，2132×760 backing store），但动画区域没有任何已绘制内容。

根因是 `animation.js:22` 把 `state.running` 初始设为 `true`，而初始化时 `animation.js:481` 调 `api.start()`；`start()` 在 `animation.js:459-462` 只在 `!state.running` 时创建 `requestAnimationFrame`。因此首次页面加载永远不会启动 `loop()`，也不会调用 `draw()`。

修复：初始设为 `running: false`，或让 `start()` 在没有已排队 RAF 时启动循环。修复后需在真实浏览器验证：首屏有绘制、暂停/继续正常、`prefers-reduced-motion` 仍只显示静态帧。

### FE-04 — 容量不足仍显示本地带宽 tok/s（P1）

`calc.js:36-41` 无论 `fits` 与否都会计算本地内存带宽的理想/教学 tok/s，`app.js:153-164` 与 `app.js:238-240` 继续把数值展示为 verdict 卡和横向速度柱。以 RTX 4090 + 70B FP16 为例，UI 会同时说“装不下”与给出看似有效的 tok/s。

这与页面和 README 中“offload 不计算精确速度”的约束矛盾。容量不足时应显示“不适用”，并在 chart 最大值与排序中排除该速度；可保留 offload 警示和解释，但不能将本地带宽公式作为其运行速度。

### UX-03 — 上下文长度滑杆没有任何模型效应（P1）

`app.js:123-127` 只更新 `state.ctx` 并触发重绘；`calc.js:101` 仅把 `ctxTokens` 原样返回，未参与容量判断、KV cache 示意、结论或动画。用户改变 256→128k 只会变化控件文本。

修复方向二选一：删除控件并把 KV cache 解释留在“别误解”中；或加入明确标注为教学估计的 KV cache 预算，使它影响可用内存、容量结论和可解释文本。

## 通过项

- `data.js`、`calc.js`、`animation.js`、`app.js` 均通过 `node --check`。
- 页面本地加载不依赖外部运行时资源；外部 URL 只作为用户点击的数据来源链接。
- 数据的 `source` 字段渲染链接使用 `rel="noopener"`。

