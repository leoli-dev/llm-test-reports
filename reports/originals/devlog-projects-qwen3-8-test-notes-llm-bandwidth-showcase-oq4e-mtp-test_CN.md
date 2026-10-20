---
type: Note
title: "LLM 带宽展示 — oQ4e-mtp 交付测试"
status: current
description: "已完成编码智能体交付，内容为关于内存带宽受限的 LLM 解码速度的零依赖交互式教学页面。"
tags: [qwen3.8, oq4e, mtp, omlx-rc, frontend, benchmark, education]
timestamp: 2026-08-23T01:04:17Z
---

# LLM 带宽展示 — oQ4e-mtp 交付测试

[English](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test.md) | [简体中文](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test_CN.md)

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

## 结果

`Qwen3.8-27B-oQ4e-mtp` 完成了一个本地、单页、纯前端且零运行时依赖的教学站点：`$HOME/Code/qwen3.8-tests/llm-bandwidth-showcase`。页面以「模型权重读取受内存带宽限制」解释 decode 阶段 token 生成上限，并明确把计算称为教学理论估算，不当作实测跑分。

## 已交付

- `index.html`、`style.css`：中文科学博物馆式深色界面、7 个内容区、reduced-motion 支持。
- `data.js`：5 个设备、6 个模型、4 个精度/量化项；每条硬件与模型数据带来源 URL、标题、检索日期与备注。
- `calc.js`：权重大小、容量判断、理论带宽上限和带效率系数的教学估算，以及逐步推导。
- `animation.js`：Canvas 内存 → GPU → token 的数据流动画；容量不足时改为 offload 窄通道说明。
- `app.js` 与 `README.md`：选择/重算/比较/方法与维护说明。

## 独立验证

- `node --check` 已通过 `data.js`、`calc.js`、`animation.js` 与 `app.js`。
- 使用本地 `python3 -m http.server` 与 Playwright Chromium 成功加载并截图；请求仅包括页面自身的 HTML/CSS/JS，未见运行时 `fetch` / XHR 或第三方资源加载。
- 截图人工检查显示首屏布局、设备卡、模型选择与精度选择正确渲染，视觉风格与 README 描述一致。

生成 agent 另报告 DOM 计数、交互重算和零 console error 均通过；这些是生成端自测声明，尚未由本次独立检查逐一复跑。

## 数据注意事项

页面内来源链接与检索日期齐全，但本次任务没有联网逐条核对数据。尤其 Apple 各代芯片的最大统一内存和标称带宽，正式对外使用前需按页面链接重新核实。页面和 README 已明确该限制，未将理论数值表述为真实性能。

## 复用

本地运行：`cd $HOME/Code/qwen3.8-tests/llm-bandwidth-showcase && python3 -m http.server 8000`。

