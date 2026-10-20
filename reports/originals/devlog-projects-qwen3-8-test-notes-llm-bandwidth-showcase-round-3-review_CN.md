---
type: Review
title: "LLM 带宽展示 — 第 3 轮评审"
status: request-changes
tags: [qwen3.8, omlx, frontend, code-review, data-integrity]
timestamp: 2026-08-23T11:49:00Z
---

# LLM 带宽展示 — 第 3 轮评审

[English](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review_CN.md)

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

## 初步结论

**Request Changes.** Round-1 的三项 P1 已保持修复；动画也已从装饰性粒子改为四步单 token 时间线，方向正确。但本轮声称“所有 10 项均已和官方来源核实”的交付尚未成立：两项 Apple 数据仍与所附官方页面不一致或无法访问，且“可选自动播放”的初始 UI 状态与实际行为相反。

> ⚠️ 以下历史发现已在最终补丁后再次复核。M3 Ultra、UX-04 和 A11Y-01 已在本页末尾的 Final closeout 中标记为通过；M5 Max 的来源问题仍未解决。

## 审查范围与证据

- 本地静态检查：`node --check data.js calc.js animation.js app.js` 通过。
- 本地 Playwright/Chromium 加载 `http://127.0.0.1:8765` 并截取首屏、全页及 `#anim-title` 定位截图；页面能渲染，无本轮新增的加载错误。定位截图在桌面 2308×1382 视口稳定复现 Canvas 内文字/说明层叠。
- 逐项检查 `data.js` 及官方源页面。Apple 当前 M5 Max 技术规格应使用 `https://support.apple.com/en-us/126319`；当前 `https://www.apple.com/mac/macbook-pro/specs/` 是 404。Apple 的 M3 Ultra Mac Studio 页面 `https://support.apple.com/en-us/122211` 列出最高 256GB 统一内存、819GB/s。

## 发现

### P1 — DATA-01 仍不完整：M5 URL 已失效且 M3 图表已过时

`data.js:60-71` 把 M5 Max 标为 `confirmed`，但其 source URL (`apple.com/mac/macbook-pro/specs`) 返回 404；不可点击核验就不能称为可追溯来源。应改为 Apple Support M5 MacBook Pro 技术规格页并重新核验引用日期。

更严重的是，`data.js:161-169` 的实际计算字段仍是 `memoryGB: 512`、`bandwidthGBs: 816`，而其同一条 note 已说明当前为 “256GB / 819GB/s”，所附 Apple 支持页面也支持后者。因此选中 M3 Ultra 时，容量判定、比较图和 tok/s 都会基于错误数值。将字段更新为 `256` 和 `819`，并让 note 只描述当前引用页的规格；若需要保留历史规格，应新增独立且可复核的历史配置，不能混用。

### P1 — UX-04 时间线在视觉上损坏：说明卡片遮挡了图表

Playwright 的 `#anim-title` 截图确认，说明卡直接盖住三个主体底部的标签与数值：例如“内存（模型权重）”“GPU 计算核心”“token 输出”及其 GB/GB/s/tok/s 数字在黑色半透明说明卡下方，处于不可读或半可读状态。这正是用户截图中“一塌糊涂”的视觉故障，不是配色偏好问题。

根因是固定 400px 高的 Canvas（`style.css:272-276`）中，主体框按 `h * 0.47` 为中心、最高延伸至约 `h * 0.74`（`animation.js:76-87`），而 `drawStepCaption()` 又从 `h * 0.62` 起绘制 96px 高的说明卡（`animation.js:311-340`）。两块区域在设计坐标上必然重叠；不同动画阶段只会改变谁被高亮，不能消除碰撞。

**不要尝试只把卡片向下挪十几像素。** 这会牺牲窄屏，也继续把正文排版交给脆弱的 Canvas 坐标。重构为以下结构：

1. Canvas 仅负责图形：三个节点、两条路径、当前阶段高亮；其内不再绘制任何解释卡、公式或主体标签，必要标签也置于不与节点重叠的安全位置。
2. 在 `#anim-canvas` **下方**用普通 HTML 新增“当前步骤”说明区：步骤标题、完整公式、1–2 句解释。HTML 负责自然换行、阅读顺序和屏幕阅读器语义；Canvas 不截断文本。
3. 说明区高度由内容撑开，Canvas 保持纯图形的固定或响应式高度；四个阶段切换只更新说明区文本和 Canvas 高亮。
4. 在 2308×1382、1280×800 和 390px 宽度逐阶段截图验收：任意一帧都不得遮住节点、节点标签、公式或说明文字；每一步的公式必须完整可读。

这项重构是 UX-04 的必要完成条件。未完成前，新的“解释性动画”实际比原来的纯粒子动画更妨碍阅读。

### P1 — UX-04 的“可选自动播放”契约在首次渲染时被违反

`animation.js:494` 在未启用 reduced motion 时无条件调用 `api.play()`；但首屏按钮在 `index.html:93` 明确写为“自动播放（可选）”，初始 `aria-pressed="false"`，且 `app.js:220-244` 只在用户点击后才同步状态。也就是说，动画实际正在播放时，视觉标签和辅助技术均报告“未播放”。

默认应停在完整可读的第一步，由用户显式开始播放；或者保留自动开始，但在初始化时调用 `setPlayBtn(true)` 并把文案改为“暂停自动播放”。基于 Round-2 的用户反馈，推荐前者。

### P2 — Tablist 的 ARIA 语义不完整

`index.html:97` 把阶段容器标为 `role="tablist"`，但 `app.js:212-217` 创建的普通 buttons 没有 `role="tab"`、`aria-selected`、键盘箭头导航或关联的 `tabpanel`。这会让辅助技术接收到不完整的组件语义。要么实现完整 tab pattern，要么移除 `tablist`，把它们表述为一组“跳转到阶段”的普通按钮；后者更贴近当前交互。

## 正向验证

- FE-03：Canvas 首屏已可见；此前的空白启动故障未复发。
- FE-04：默认 RTX 5090 + Qwen3.8 FP16 容量不足时，结论和横向比较显示“不适用”，没有伪造 offload tok/s。
- UX-03：上下文滑杆已影响总占用/容量结论，且明确为教学估计。
- 数据模型已经加入 `memoryType`，并为 DeepSeek V4 Flash 记录 total/active MoE 参数；计算仍使用 total 参数，符合权重存储和读取带宽模型。
- 时间线的“读取权重 → 逐层计算 → 输出 1 token → 重复”以及 `weightGB ÷ bandwidthGBs → ms/token → tok/s` 说明，实质性回应了用户对原粒子动画“无法解释”的批评。剩余问题是控制契约与数据正确性，不是回到原装饰动画。

## 下次评审的验收标准

1. M5 Max 链接可打开并直接支持 128GB / 614GB/s；M3 Ultra 的实际字段为 256GB / 819GB/s，来源、标题、日期一致。
2. Canvas 与说明区分离；逐步 Playwright 截图中没有任何文字或图形重叠，完整公式可读。
3. 首屏播放状态、按钮文字、`aria-pressed` 三者一致；默认暂停或显式同步自动播放均可。
4. 阶段控件移除不完整 `tablist` 语义，或完成可访问 tabs 行为。
5. 重跑 JS syntax、浏览器加载及 M3 Ultra 选择后的容量/比较值断言。

## 最终结案 — 2026-08-23

**最终裁定：未通过验收；案件结案，存在一项已知的 P1 数据完整性例外。** 用户在 Qwen 提交最后一个补丁后，请求进行最终审查并结案。

### 独立验收通过项

- `node --check` 在所有四个 JavaScript 文件中均通过。
- 在 2308×1382 和 1280×800 处的 Playwright 截图显示，图表、其三个节点标签、图例以及新的 DOM 说明面板不再重叠。说明位于 Canvas 下方，完整公式作为换行的 HTML 文本可见。
- 页面默认处于停止状态：按钮文本为“自动播放（可选）”且 `aria-pressed="false"`；`animation.js` 在初始化期间不再启动 `requestAnimationFrame`。
- `tablist` 角色已被移除；舞台控件为普通按钮。
- M3 Ultra 已在 `data.js` 中更正为 256GB / 819GB/s，并保留了匹配的 Apple Support 来源。

### 结案时保留的拒绝理由

DATA-01 仍未解决。`data.js:60-72` 仍将 M5 Max 条目标记为 `confirmed`，同时链接至 `https://www.apple.com/mac/macbook-pro/specs/`，而该链接返回 404.。Qwen 将此描述为无法找到来源的阻断性问题，但 Apple Support 页面 `https://support.apple.com/en-us/126319` 处于在线状态，并明确列出了 40 核 M5 Max 的 614GB/s 以及可配置的 128GB 统一内存。该条目必须使用该 URL 及其匹配的标题，才能被称为来源可追溯。

本次审查中未进行任何实现，因为任务性质是独立验收，而非授权修改 Qwen 的交付物。该测试用例现已以**验收失败，且剩余一项具体、明确的 P1** 告终；DATA-01 保留在项目待办事项中，以备未来重新开启。
