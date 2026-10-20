---
type: Note
title: "JSON Lens Qwen 3.8 第 1 轮代码审查"
status: current
description: "对 Qwen JSON Lens 交付物的独立两轮审查：第 1 轮的缺陷已关闭，但深层有效 JSON 仍会导致应用堆栈溢出。"
tags: [json-lens, qwen3.8, code-review, frontend, benchmark]
timestamp: 2026-08-26T10:18:40Z
---

# JSON Lens Qwen 3.8 第 1 轮代码审查

[English](devlog-projects-qwen3-8-test-notes-json-lens-qwen-round-1-review-2026-08-25.md) | [简体中文](devlog-projects-qwen3-8-test-notes-json-lens-qwen-round-1-review-2026-08-25_CN.md)

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

| 字段 | 值 |
|---|---|
| 审查的交付物 | `$HOME/Code/qwen3.8-tests/json-lens-qwen` |
| 用户声称的模型 / 工作流 | MTPLX Qwen 3.8 27B 优化质量 — 编码稳定；顺序执行的 Qwen CLI-agent 子任务 |
| 独立检查 | `npm test -- --run`; `npm run build`; `npx playwright test` |

所有声明的检查在本地均通过：**95/95 Vitest**，成功的 TypeScript/Vite 生产构建，以及 **3/3 Playwright** 场景。这是有用的基线证据，但它并未确立下文中的核心状态转换和边缘情况。

## 结论

**要求修改。** 实现紧凑、可读，且在纯函数层面进行了有意义的测试，但尚不能安全地称为完整：正常的编辑可能会用过时的 Worker 输出替换当前可见的文档，并且有效 JSON 值 / 位置处理不当。`onlyDiffs` UI 也没有可观察到的效果。

## P1 发现

### FE-12 — 过时的较大文件 Worker 结果覆盖了较新的小编辑

`useParse.parse()` 仅在其大文件分支中递增 `requestIdRef`（`json-lens-qwen/src/hooks/useParse.ts:142-175`）。当 >5 MiB 的输入启动 Worker 请求 1 且用户立即将其替换为小文档时，小同步分支更新了 UI 状态，但将当前请求 ID 保留为 1 且从未发送 Worker 取消信号。因此，完成的 Worker 消息仍然通过 `:74-75` 处的相等性检查并替换了新文档。

浏览器复现：用顶层键为 `stale` 的 >5 MiB 有效文档填充，立即将其替换为 `{ "fresh": true }`，并等待 1.5 秒。文本区域仍包含新输入，但渲染的树路径为 `$`、`$.stale`，且 UI 保留了大文件指示器。这是主工作流中的数据/视图分歧。

通过推进代际（generation）并在*每次*解析（包括同步分支）之前取消任何进行中的 Worker 来修复；仅接受活动代际的响应。添加一个针对大 → 小替换的 E2E 回归测试，以及一个使用模拟 Worker 的钩子测试。

### FE-13 — 有效 JSON `null` 和恢复的持久化 JSON 从未成为视图状态

`ParseStatus.value` 使用 `null` 作为无值哨兵，然后 `App` 和 `InputPanel` 基于 `value !== null` 门控成功渲染和工具（`json-lens-qwen/src/App.tsx:70-75,218`; `src/components/InputPanel.tsx:228`）。仅包含 `null` 的有效文档解析成功，但不渲染树并禁用 Format。将解析成功与解析值分开表示（现有的 `parseState === 'done'` 已提供这种区分）。

持久化存在第二个集成缺口：`useLocalStorage` 恢复 `jsonlens:text`，但 `useParse()` 从未被要求解析该初始文本。当 localStorage 预加载为 `{ "saved": true }` 并重新加载时，文本区域被恢复，但结果面板显示“输入 JSON 后在此显示树形视图”且行数为零。在挂载时解析恢复的文本，并适当地清除或替换过时的查询状态。

### LIB-02 — 友好的结构错误报告列号高了一个字符

`toLineColumn()` 在 `jsonErrors.ts:14-26` 中返回 `position - lastNewline + 1`。对于 `lastNewline === -1`，位置 0 变为列 2；通常，基于 1 的列是 `position - lastNewline`，而不是额外的 `+ 1`。结构扫描器覆盖了原生位置，因此这影响了宣传的尾随逗号、单引号和未加引号键的消息。

针对带有尾随逗号的多行对象的浏览器复现报告该逗号为“第 2 行，第 10 列”；它实际上是列 9.。更正公式并测试首字符、单行和后续行的错误位置。现有的 E2E 期望目前固化了错误的数字。

### FE-14 — “只看差异” is a no-op

`DiffView` 设置 `const visible = onlyDiffs ? entries : entries`（`json-lens-qwen/src/components/DiffView.tsx:46-52`）。两种设置渲染完全相同的集合，因此切换复选框无法过滤任何内容。提供的 E2E 明确断言切换后计数不变（`e2e/jsonlens.spec.ts:182-188`），这验证了缺陷而非所述功能。

要么渲染一个包含未更改节点的比较树/列表并让控件隐藏它们，要么移除复选框并修订 README/需求。添加一个交互测试，以证明两种模式下内容不同。

## P2 发现

### LIB-03 — 按 ID 对齐会静默丢弃重复元素

当启用 `alignById` 时，`diff()` 通过序列化的 `id` 映射每个元素并跳过重复的 ID（`json-lens-qwen/src/lib/diff.ts:82-107`）。将具有重复 ID 的源元素与单个相同 ID 的目标进行比较时，仅报告第一个更改；后续的源元素消失。应检测重复 ID 并回退到索引比较（或显示明确的歧义），而不是返回不完整的差异。

### UX-05 — 树遍历反转了兄弟节点顺序并破坏了前序层次结构

`buildVisibleRows()` 以相反顺序将对象/数组子节点推入 `rows`，同时单独堆叠展开的子节点（`json-lens-qwen/src/components/TreeView.tsx:59-96`）。对于一个 `a` 和 `b` 子树均展开的对象，可见路径为 `$`、`$.b`、`$.a`、`$.a.x`、`$.b.y`：兄弟节点顺序被反转，且 `b` 的后代与其父节点分离。应按文档前序构建行；当前的 E2E 记录并接受了这种相反顺序。

### QA-06 — 集成测试覆盖率遗漏了上述所有发现

没有测试执行持久化状态解析、大→小替换、顶层 `null`、`onlyDiffs` 的 true/false 行为、重复 ID 或嵌套展开顺序。在声称所有验收门通过之前，应添加这些测试，而不仅仅是当前通过的狭窄场景。

## 看起来不错的部分

- 纯 JSON 修复层保持有效的双引号撇号完整，且其聚焦测试清晰。
- 生产构建干净且小（主 JS 约 182 kB，CSS 8.9 kB，gzip 前 Worker 4.8 kB）。
- 100k 节点检查确认了 DOM 窗口化；仅挂载了一个小的行窗口。
- Worker 预扫描在阻塞解析前真正让出，一旦请求生命周期处理得到修正，这为取消提供了有意义的窗口。

## 建议的验收路径

1. 修复 Worker 生成/取消并解析初始持久化值。
2. 将“解析成功”与解析后的负载分离，使 `null` 成为一等 JSON 文档；修正基于 1 的列算术。
3. 实现真正的双状态差异呈现（或移除无效控件），并定义重复 ID 处理。
4. 修正树前序，添加聚焦的 unit/E2E 回归测试，然后重新运行三个质量门。

在此独立审查期间未修改任何交付文件。

## 第 2 轮 — 2026-08-26

### 重新验证的已关闭项

声称的质量门独立通过：**115/115 Vitest** 跨越 9 个文件、`npm run build`，以及 **3/3 Playwright**。浏览器检查还确认，>5 MiB 的 `stale` 文档不再替换立即的小 `fresh` 编辑，顶层 `null` 渲染为启用 Format 的一个根行，localStorage 恢复的 JSON 在重新加载时生成其树，且禁用“只看差异”会添加未更改的行。

因此，以下 Round-1 发现已关闭：FE-12（请求生成/取消）、FE-13（顶层 null + 恢复解析）、LIB-02（基于 1 的列）、FE-14（功能性仅差异）、LIB-03（重复 ID 回退）和 UX-05（正常文档前序）。相应的单元测试聚焦且有意义。

### 裁决

**请求更改。** 常规路径现在实质上更强，但一个紧凑、有效的深层文档仍会破坏核心查询/树功能。在 `TreeView` 中引入的 Round-2 递归也退化了原始的基于栈的大数据方法。

### P1 — FE-15：深层有效 JSON 触发栈溢出

`JSON.parse` 接受嵌套 4,000 层级的对象（约 24 KB 的 JSON）。相比之下，`query(value, '$.a…')` 和 `buildVisibleRows(value, allAncestorPaths)` 均抛出 `RangeError: Maximum call stack size exceeded`。`jsonpath.ts` 每次调用递归消耗一个路径段（`:336-403`），且新的前序 `TreeView` 实现递归下降每个展开的祖先（`:51-101`）。查询导航通常展开匹配的祖先，因此这不仅仅是测试辅助函数的限制。

在 `TreeView` 中恢复迭代式、显式栈遍历，同时保持前序；使精确路径 JSONPath 评估也变为迭代式。在两层中添加 4,000 级别的回归测试。这保留了与平台解析器接受的 JSON 的兼容性，并移除了新的调用栈上限。

### 剩余的 P2s

- **UX-06 — 完整差异列表并非全局前序。** `compareTwo()` 在 `addUnchangedEntries()` 追加干净行之前发出所有变更行。对于具有未变更父节点的嵌套文档，所有行的顺序可能是 `$.a | $.b.d | $.b | $.b.c | $.e`：子节点 `$.b.d` 出现在父节点 `$.b` 之前。新测试在断言顺序之前过滤到未变更行，因此它不能证明显示的列表是前序。在一次结构遍历中合并条目。
- **QA-06 — 浏览器回归覆盖仍然部分。** 新的 hook/App/组件测试覆盖了从大到小的过期消息、恢复的状态、null 和遍历顺序；3 E2E 场景仍然未在真实浏览器中驱动从大到小的替换、恢复的 localStorage 或顶层 null。
