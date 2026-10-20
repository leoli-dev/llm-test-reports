---
type: Note
title: First successful Qwen Code test on local Qwen3.8
status: current
description: First end-to-end successful coding-agent task using local oMLX Qwen3.8-27B and Qwen Code.
tags: [qwen3.8, omlx, qwen-code, benchmark, arcology]
timestamp: 2026-08-21T23:36:00Z
---

# First successful Qwen Code test

## Result

首次成功的端到端 coding task：在当前测试根目录创建 `arcology-control-room`，实现可直接打开的 **Arcology 2049 / 未来城市能源调度中心**。成品为纯 HTML/CSS/原生 JS，不依赖 npm、框架、外部图片或 API。

代码位置：`$HOME/Downloads/qwen3.8_test/arcology-control-room`。

## Fixed evaluation prompt

后续 agent / profile 横向比较必须复用这份题面，不以压缩版替代：

> 在当前文件夹创建子文件夹 `arcology-control-room`，完成一个可直接打开运行的纯前端项目：**Arcology 2049 / 未来城市能源调度中心**。
>
> 技术约束：
>
> - 只用 HTML、CSS、原生 JavaScript，不用 npm、不用框架、不用外部图片或 API。
> - 可以使用内联 SVG、Canvas 和 Web Audio API。
> - 文件拆分为 `index.html`、`style.css`、`app.js`；代码必须完整可运行。
> - 不要写长篇解释。先实现，再自行检查浏览器控制台报错和交互。
>
> 视觉目标：
>
> - 深色高级控制室界面，不要做成普通 dashboard。
> - 中央是可缩放、可拖拽的等距未来城市 SVG 地图：包含 6 个能源区域、建筑群、道路、轨道交通线、能源管线。
> - 城市要有持续动画：车辆沿道路移动、轨道列车循环、建筑窗光随机闪烁、能量流在管线中流动、轻微雨雾/粒子背景。
> - 左侧为区域列表与实时能源总览；右侧为告警流、天气与一张动态折线图；底部为时间轴与调度控制台。
> - 有启动时的短暂 loading / boot sequence 动画。
>
> 交互要求：
>
> 1. 点击地图区域或左侧区域列表，地图聚焦并高亮该区域，右侧详情面板更新。
> 2. 地图支持滚轮缩放、拖拽平移、Reset View 按钮。
> 3. 顶部有 “LIVE / SIMULATION” 开关：
>    - LIVE：数据自动每 1–2 秒波动，图表和能量管线随之变化。
>    - SIMULATION：暂停自动变化，用户可拖动底部时间轴模拟未来 24 小时。
> 4. 每个区域有能源状态：normal / warning / critical。随机但合理地产生告警；点击告警可定位到对应区域。
> 5. 有一个 “Emergency Load Shed” 按钮：弹出确认模态框；确认后随机区域进入限电状态，城市灯光明显变暗，告警增加，并能用 “Restore Grid” 恢复。
> 6. 加入轻微的按钮音效和告警音效，首次用户交互后才启用音频。
> 7. 数据刷新、切换区域、打开模态框都要有自然过渡动画。
> 8. 响应式：桌面优先；窄屏时左右面板可折叠，地图仍可使用。
>
> 验收：
>
> - 打开 `index.html` 即可运行。
> - 不出现占位文字、未实现按钮或控制台报错。
> - 所有模拟数据在 JS 中生成。
> - 最后简短报告实现了哪些文件，以及你实际测试过的交互。

## Runtime setup

| Field | Value |
|---|---|
| Model | `True2456/Qwen3.8-27B-AWQ-5.0bpw`，通过 oMLX 本机 OpenAI-compatible endpoint 使用 |
| oMLX profile | `Qwen3.8-27B-AWQ-5.0bpw:coding-reason`：131,072 context / 32,768 output / thinking low |
| Agent tool | `@qwen-code/qwen-code` v0.21.15 |
| Agent mode | YOLO / auto approval |
| Machine | MacBook Pro M5 Max, 128 GB unified memory |

## What the agent shipped

- `index.html`：boot sequence、三栏控制室布局、地图 HUD、模式切换、时间轴、控制台与确认 modal。
- `style.css`：深色高密度控制室视觉、响应式侧栏、动画及状态样式。
- `app.js`：程序化 SVG 等距城市、车辆/列车/窗光/管线/雨雾动画，LIVE/SIM 模拟，区域与告警交互，缩放拖拽，Emergency Load Shed/Restore 和 Web Audio。

生成后 agent 自行运行 JS 解析、headless Chrome/CDP console 检查，并修复了 FX canvas backing-store 与 pointer-capture 相关的两个运行时问题；其报告为 0 console errors/warnings。

## Performance observation

此次是质量与稳定性试验，不宜作为稳定吞吐基准：Reason 首轮输出记录为约 19,827 completion tokens（其中 16,334 reasoning tokens），单次请求约 980 秒，长上下文下约 20 tok/s；较短写文件阶段的生成后 decode 约 28.5 tok/s。原因 profile 的 `low` thinking 不是硬 token 上限。

### Long-running-session slowdown

在 Round 2 后继续进行可视 QA 的同一条 Qwen Code session 中，用户提供的 oMLX v0.6.2 Dashboard 截图记录：累计 prefill **3,074,861 tokens**，其中 cached **2,760,704**，cache efficiency **89.8%**；未缓存 prefill **355.4 tok/s**，token generation 平均只剩 **18.1 tok/s**。这比首轮短写文件阶段约 28.5 tok/s 低约 36%，也略低于首轮长请求约 20 tok/s。

这个数字说明持续多轮 coding / review / CDP QA 后的**端到端生成体验确实在变慢**；但 Dashboard 的 “Total Prefill Tokens” 是多次请求的累计量，不能误读成单次 307 万 token context，也不能据此单独判定模型或硬件退化。高缓存命中意味着重复上下文的 prefill 已被有效复用；仍变慢的主要观察对象是长会话下的 decode / reasoning 工作量。下一次横向测试应以新 session、固定题面和固定 profile 单独记录首请求与第 N 轮请求的 tok/s。

### QA continuation: cancelled, not a code regression

用户在该轮继续约 3 小时后取消任务。检查实际文件确认：`index.html`、`style.css` 和 `app.js` 均停留在 Round 2 修复时的修改时间，**没有发生新的产品代码改动**。Qwen 的后续工作主要是构建/重跑 Chrome CDP QA：留下 14 张 desktop、交互、Load Shed、窄屏截图（临时目录 `/tmp/arcology-qa`），并多次纠正测试自身的错误——包括错误的元素 id、读错 CSS 属性、以及点击已选 region 导致的无效断言。

这说明这次不是模型“把代码越修越坏”，而是 agent 在缺乏明确测试预算时陷入了**验证循环**：反复重建 Chrome profile、重抓截图、对不确定的 pointer 点击继续推理。唯一实际新增发现是 1000px 窄屏的横向 overflow，已作为 UX-02（历史本机文件，未随本报告发布） 记录；用户取消是合理的止损。

## Quality verdict

Round 2 verdict：**B+ implementation review**。静态解析通过，地图命中正确性、初始告警文案与键盘/modal 无障碍问题均已闭环；生成 agent 的 CDP 功能验证也支持这些结论。独立 desktop / 窄屏可视验收正在由 Qwen 继续执行，完成前不把它当作最终 production-quality 交付。详见 [Round 1 findings / Round 2 verification](devlog-projects-qwen3-8-test-notes-arcology-control-room-round-1-review.md)。
