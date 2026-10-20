---
type: Note
title: LLM bandwidth showcase — oQ4e-mtp delivery test
status: current
description: Completed coding-agent delivery of a zero-dependency interactive teaching page about memory-bandwidth-limited LLM decode speed.
tags: [qwen3.8, oq4e, mtp, omlx-rc, frontend, benchmark, education]
timestamp: 2026-08-23T01:04:17Z
---

# LLM bandwidth showcase — oQ4e-mtp delivery test

## Result

`Qwen3.8-27B-oQ4e-mtp` 完成了一个本地、单页、纯前端且零运行时依赖的教学站点：`$HOME/Code/qwen3.8-tests/llm-bandwidth-showcase`。页面以「模型权重读取受内存带宽限制」解释 decode 阶段 token 生成上限，并明确把计算称为教学理论估算，不当作实测跑分。

## Delivered

- `index.html`、`style.css`：中文科学博物馆式深色界面、7 个内容区、reduced-motion 支持。
- `data.js`：5 个设备、6 个模型、4 个精度/量化项；每条硬件与模型数据带来源 URL、标题、检索日期与备注。
- `calc.js`：权重大小、容量判断、理论带宽上限和带效率系数的教学估算，以及逐步推导。
- `animation.js`：Canvas 内存 → GPU → token 的数据流动画；容量不足时改为 offload 窄通道说明。
- `app.js` 与 `README.md`：选择/重算/比较/方法与维护说明。

## Independent verification

- `node --check` 已通过 `data.js`、`calc.js`、`animation.js` 与 `app.js`。
- 使用本地 `python3 -m http.server` 与 Playwright Chromium 成功加载并截图；请求仅包括页面自身的 HTML/CSS/JS，未见运行时 `fetch` / XHR 或第三方资源加载。
- 截图人工检查显示首屏布局、设备卡、模型选择与精度选择正确渲染，视觉风格与 README 描述一致。

生成 agent 另报告 DOM 计数、交互重算和零 console error 均通过；这些是生成端自测声明，尚未由本次独立检查逐一复跑。

## Data caution

页面内来源链接与检索日期齐全，但本次任务没有联网逐条核对数据。尤其 Apple 各代芯片的最大统一内存和标称带宽，正式对外使用前需按页面链接重新核实。页面和 README 已明确该限制，未将理论数值表述为真实性能。

## Reuse

本地运行：`cd $HOME/Code/qwen3.8-tests/llm-bandwidth-showcase && python3 -m http.server 8000`。

