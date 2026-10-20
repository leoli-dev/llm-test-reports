---
type: Review
title: LLM bandwidth showcase — Round 3 review
status: request-changes
tags: [qwen3.8, omlx, frontend, code-review, data-integrity]
timestamp: 2026-08-23T11:49:00Z
---

# LLM bandwidth showcase — Round 3 review

## Initial verdict

**Request Changes.** Round-1 的三项 P1 已保持修复；动画也已从装饰性粒子改为四步单 token 时间线，方向正确。但本轮声称“所有 10 项均已和官方来源核实”的交付尚未成立：两项 Apple 数据仍与所附官方页面不一致或无法访问，且“可选自动播放”的初始 UI 状态与实际行为相反。

> ⚠️ Historical findings below were reviewed again after the final patch. M3 Ultra、UX-04 和 A11Y-01 已在本页末尾的 Final closeout 中标记为通过；M5 Max 的来源问题仍未解决。

## Review scope and evidence

- 本地静态检查：`node --check data.js calc.js animation.js app.js` 通过。
- 本地 Playwright/Chromium 加载 `http://127.0.0.1:8765` 并截取首屏、全页及 `#anim-title` 定位截图；页面能渲染，无本轮新增的加载错误。定位截图在桌面 2308×1382 视口稳定复现 Canvas 内文字/说明层叠。
- 逐项检查 `data.js` 及官方源页面。Apple 当前 M5 Max 技术规格应使用 `https://support.apple.com/en-us/126319`；当前 `https://www.apple.com/mac/macbook-pro/specs/` 是 404。Apple 的 M3 Ultra Mac Studio 页面 `https://support.apple.com/en-us/122211` 列出最高 256GB 统一内存、819GB/s。

## Findings

### P1 — DATA-01 remains incomplete: M5 URL broken and M3 figures are stale

`data.js:60-71` 把 M5 Max 标为 `confirmed`，但其 source URL (`apple.com/mac/macbook-pro/specs`) 返回 404；不可点击核验就不能称为可追溯来源。应改为 Apple Support M5 MacBook Pro 技术规格页并重新核验引用日期。

更严重的是，`data.js:161-169` 的实际计算字段仍是 `memoryGB: 512`、`bandwidthGBs: 816`，而其同一条 note 已说明当前为 “256GB / 819GB/s”，所附 Apple 支持页面也支持后者。因此选中 M3 Ultra 时，容量判定、比较图和 tok/s 都会基于错误数值。将字段更新为 `256` 和 `819`，并让 note 只描述当前引用页的规格；若需要保留历史规格，应新增独立且可复核的历史配置，不能混用。

### P1 — UX-04 timeline is visually broken: the explanation card obscures the diagram

Playwright 的 `#anim-title` 截图确认，说明卡直接盖住三个主体底部的标签与数值：例如“内存（模型权重）”“GPU 计算核心”“token 输出”及其 GB/GB/s/tok/s 数字在黑色半透明说明卡下方，处于不可读或半可读状态。这正是用户截图中“一塌糊涂”的视觉故障，不是配色偏好问题。

根因是固定 400px 高的 Canvas（`style.css:272-276`）中，主体框按 `h * 0.47` 为中心、最高延伸至约 `h * 0.74`（`animation.js:76-87`），而 `drawStepCaption()` 又从 `h * 0.62` 起绘制 96px 高的说明卡（`animation.js:311-340`）。两块区域在设计坐标上必然重叠；不同动画阶段只会改变谁被高亮，不能消除碰撞。

**不要尝试只把卡片向下挪十几像素。** 这会牺牲窄屏，也继续把正文排版交给脆弱的 Canvas 坐标。重构为以下结构：

1. Canvas 仅负责图形：三个节点、两条路径、当前阶段高亮；其内不再绘制任何解释卡、公式或主体标签，必要标签也置于不与节点重叠的安全位置。
2. 在 `#anim-canvas` **下方**用普通 HTML 新增“当前步骤”说明区：步骤标题、完整公式、1–2 句解释。HTML 负责自然换行、阅读顺序和屏幕阅读器语义；Canvas 不截断文本。
3. 说明区高度由内容撑开，Canvas 保持纯图形的固定或响应式高度；四个阶段切换只更新说明区文本和 Canvas 高亮。
4. 在 2308×1382、1280×800 和 390px 宽度逐阶段截图验收：任意一帧都不得遮住节点、节点标签、公式或说明文字；每一步的公式必须完整可读。

这项重构是 UX-04 的必要完成条件。未完成前，新的“解释性动画”实际比原来的纯粒子动画更妨碍阅读。

### P1 — UX-04’s “optional autoplay” contract is violated at first paint

`animation.js:494` 在未启用 reduced motion 时无条件调用 `api.play()`；但首屏按钮在 `index.html:93` 明确写为“自动播放（可选）”，初始 `aria-pressed="false"`，且 `app.js:220-244` 只在用户点击后才同步状态。也就是说，动画实际正在播放时，视觉标签和辅助技术均报告“未播放”。

默认应停在完整可读的第一步，由用户显式开始播放；或者保留自动开始，但在初始化时调用 `setPlayBtn(true)` 并把文案改为“暂停自动播放”。基于 Round-2 的用户反馈，推荐前者。

### P2 — Tablist 的 ARIA 语义不完整

`index.html:97` 把阶段容器标为 `role="tablist"`，但 `app.js:212-217` 创建的普通 buttons 没有 `role="tab"`、`aria-selected`、键盘箭头导航或关联的 `tabpanel`。这会让辅助技术接收到不完整的组件语义。要么实现完整 tab pattern，要么移除 `tablist`，把它们表述为一组“跳转到阶段”的普通按钮；后者更贴近当前交互。

## Positive verification

- FE-03：Canvas 首屏已可见；此前的空白启动故障未复发。
- FE-04：默认 RTX 5090 + Qwen3.8 FP16 容量不足时，结论和横向比较显示“不适用”，没有伪造 offload tok/s。
- UX-03：上下文滑杆已影响总占用/容量结论，且明确为教学估计。
- 数据模型已经加入 `memoryType`，并为 DeepSeek V4 Flash 记录 total/active MoE 参数；计算仍使用 total 参数，符合权重存储和读取带宽模型。
- 时间线的“读取权重 → 逐层计算 → 输出 1 token → 重复”以及 `weightGB ÷ bandwidthGBs → ms/token → tok/s` 说明，实质性回应了用户对原粒子动画“无法解释”的批评。剩余问题是控制契约与数据正确性，不是回到原装饰动画。

## Acceptance criteria for next review

1. M5 Max 链接可打开并直接支持 128GB / 614GB/s；M3 Ultra 的实际字段为 256GB / 819GB/s，来源、标题、日期一致。
2. Canvas 与说明区分离；逐步 Playwright 截图中没有任何文字或图形重叠，完整公式可读。
3. 首屏播放状态、按钮文字、`aria-pressed` 三者一致；默认暂停或显式同步自动播放均可。
4. 阶段控件移除不完整 `tablist` 语义，或完成可访问 tabs 行为。
5. 重跑 JS syntax、浏览器加载及 M3 Ultra 选择后的容量/比较值断言。

## Final closeout — 2026-08-23

**Final verdict: not accepted; case closed with one known P1 data-integrity exception.** The user requested final review and closure after Qwen's last patch.

### Independently accepted

- `node --check` passes for all four JavaScript files.
- Playwright screenshots at 2308×1382 and 1280×800 show that the diagram, its three node labels, legend, and the new DOM explanation panel no longer overlap. The explanation is below the Canvas, and the full formula is visible as wrapping HTML text.
- The page defaults to stopped: the button text is “自动播放（可选）” and `aria-pressed="false"`; `animation.js` no longer starts `requestAnimationFrame` during initialization.
- The `tablist` role has been removed; stage controls are ordinary buttons.
- M3 Ultra has been corrected in `data.js` to 256GB / 819GB/s and retains a matching Apple Support source.

### Rejection reason retained at closure

DATA-01 remains unresolved. `data.js:60-72` still marks the M5 Max entry as `confirmed` while linking to `https://www.apple.com/mac/macbook-pro/specs/`, which returns 404. Qwen described this as a blocking inability to find a source, but the Apple Support page `https://support.apple.com/en-us/126319` is live and explicitly lists both 614GB/s for the 40-core M5 Max and configurable 128GB unified memory. The entry must use that URL and its matching title before it can be called source-traceable.

No implementation was made in this review because the task was independent acceptance, not an authorization to alter Qwen's deliverable. The test case is now concluded as **failed acceptance with a single, concrete P1 remaining**; DATA-01 stays in the project backlog for any future reopening.
