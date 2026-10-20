---
type: Note
title: LLM bandwidth showcase — Round 1 review
status: current
description: Independent first-round review found three P1 correctness issues in the oQ4e-mtp delivery: a blank Canvas animation, invalid offload speed figures, and a no-op context control.
tags: [qwen3.8, oq4e, mtp, review, frontend, canvas, correctness]
timestamp: 2026-08-23T01:32:10Z
---

# LLM bandwidth showcase — Round 1 review

## Verdict

**Request Changes.** 页面静态结构、数据与文案的分离良好，JS 语法和本地页面加载均通过；但三项 P1 问题使核心教学结论不可靠或缺少功能。

## Findings

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

## What passed

- `data.js`、`calc.js`、`animation.js`、`app.js` 均通过 `node --check`。
- 页面本地加载不依赖外部运行时资源；外部 URL 只作为用户点击的数据来源链接。
- 数据的 `source` 字段渲染链接使用 `rel="noopener"`。

