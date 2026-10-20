---
type: Note
title: "JSON Lens — Ornith 1.5 35B-A3B 代码审查"
status: current
description: "对 JSON Lens 模型测试的独立审查：自动化检查通过，但交付的 UI 中缺失多项明确的产品需求。"
tags: [json-lens, code-review, qwen3.8, ornith, frontend, benchmark]
timestamp: 2026-08-25T16:52:38Z
---

# JSON Lens — Ornith 1.5 35B-A3B 代码审查

[English](devlog-projects-qwen3-8-test-notes-json-lens-ornith-code-review-2026-08-25.md) | [简体中文](devlog-projects-qwen3-8-test-notes-json-lens-ornith-code-review-2026-08-25_CN.md)

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
| 固定提示词 | `$HOME/Code/qwen3.8-tests/test-prompts/json-lens.md` |
| 审查的交付物 | `$HOME/Code/qwen3.8-tests/json-lens` |
| 生成模型/会话证据 | 用户截图：Ornith 1.5 35B-A3B Coding, Medium；4 轮次 / 197 步骤 / 185m30s 模型时间，2m59s 工具，637K 输入 + 12.4M 缓存 + 211K 输出 |
| 独立命令 | `npm run build`; `npm test -- --run`; `npx playwright test` |

所有三个命令在本地均通过：生产构建成功，Vitest 报告在 10 个文件中 **158/158** 个测试，Playwright 报告 **3/3** 个测试。构建发出三个 CSS 压缩器警告，因为 `src/index.css:154-156` 使用了 `//` 而非 CSS `/* ... */` 注释。单元测试运行还记录了来自 `src/smoke.test.tsx` 的 React `act(...)` 警告。

## 结论

**请求修改 — 未作为所请求的 JSON Lens 工具接受。** 基础扎实：React/TypeScript/Vite，纯解析/查询/差异辅助函数，仅限本地的存储，真正窗口化的树，以及通过的自动化测试。但 3 E2E 用例和单元测试套件未验证若干强制性的用户界面行为；README 声称这些行为存在，但其控件和集成路径并不存在。这使得绿色测试套件不足以作为任务验收标准的证据。

## P1 发现

### FE-09 — 未实现必需的每日工具 UI 功能

`EditorPane` 仅包含两个文本区域、一个修复按钮、一个缩进单选按钮组和“仅显示差异”复选框（`src/components/EditorPane.tsx:77-238`）。尽管 `parseJson` 构建了所需的附近错误片段（`src/lib/parse.ts:110-119`），但编辑器仅显示行/列、消息和原因（`EditorPane.tsx:126-139`），因此片段从未到达用户。此外，也没有拖放处理程序、格式化/压缩/排序操作，或应用这些纯辅助函数的路径。`formatJson`、`compressJson`、`sortKeys` 和 `reparseEmbedded` 仅作为库函数存在（`src/lib/utils.ts:41-121`），且没有生产 UI 导入或调用它们。同样，`VirtualTree` 仅在点击*整行*时复制 `JSON.stringify(node.value)`（`src/components/VirtualTree.tsx:144-153`）；它没有单独的“复制值”/“复制路径”操作，也无法提供所需的一键嵌入式 JSON 展开。

这不是外观上的缺失：尽管 README 章节 1, 3, 和 6 声称它们有效，但若干明确的提示词功能对真实用户不可用。

### FE-10 — 未满足大文件进度/取消验收标准

对于超过 5 MiB 的输入，`App` 调用 `parseInWorker`，但可见的 UI 仅打印 `Tree (N%)` 且未暴露取消按钮（`src/App.tsx:39-46,141-149`）。工作线程仅在单个原子 `JSON.parse` 之前立即发送 `0`，然后在其后发送 `100`（`src/lib/parse.worker.ts:31-35`），因此无法提供有意义的进度。在输入更改时，该效果仅抑制过期的 React 状态；它不会终止现有的工作线程（`src/App.tsx:33-65`）。`workerRunner` 也没有取消句柄（`src/lib/workerRunner.ts:11-69`）。提示词明确要求进度 UI **和取消**，因此当前的生命周期标志不是功能上的替代品。

### FE-11 — 缺失查询导航和差异树需求

`App` 计算匹配路径但从不更新 `highlightedPath`；“运行查询”按钮被故意设为无操作（`src/App.tsx:68-82,119-127`）。`VirtualTree` 可以着色渲染的匹配项，但无法展开祖先节点、滚动到或逐步遍历命中项（`src/components/VirtualTree.tsx:231-238`）。这未能满足“逐个跳转”。

差异侧是更改条目的扁平列表，而不是具有三色节点标记的 JSON 树（`src/components/DiffView.tsx:111-157`）。`showDiffsOnly` 更改仅报告样板代码（`src/lib/report.ts:51-65`）；由于不存在完整的差异树，它无法过滤树。因此，所需的“只看差异”控件在显示的比较中实际上毫无意义。

## P2 正确性、可访问性和测试质量发现

### LIB-01 — JSONPath 无法与 `null` 进行比较

`parseLiteral()` 将 `null` 既用作有效的 JSON 字面量，又用作解析失败哨兵（`src/lib/jsonpath.ts:102-134`）；`parsePredicate()` 随后在 `:177-180` 处拒绝它。直接检查：`query({ a: [{ x: null }] }, "$.a[?(@.x == null)]")` 返回 `{ ok: false, error: { message: "Expected a literal value" } }`。所需的简单比较子集应一致地支持有效的 JSON 字面量，或者记录并测试这种故意的限制。

### LIB-02 — ID 对齐静默混淆不同/重复的 ID

`indexById()` 使用 `String(id)` 规范化 ID，并仅保留第一个条目（`src/lib/diff.ts:74-81`）。因此，数值型 `1` 和字符串型 `"1"` 被视为相同的 ID 并对齐，重复的 ID 会丢失后续元素。例如，启用对齐功能后，将 `[{id:1,n:"a"},{id:1,n:"b"}]` 与 `[{id:1,n:"c"}]` 进行比较，仅产生从 `a` 到 `c` 的单个变更；第二个源项从报告中消失。要么在键中保留原始类型并报告重复 ID 的歧义，要么回退到基于索引的对齐并显示可见的警告。

### A11Y-02 — 所述的按钮可访问性并非事实

提示要求每个按钮都必须具有可访问标签，但展开/折叠工具栏按钮和查询/导出按钮仅依赖可见文本（`src/App.tsx:119-127`；`src/components/VirtualTree.tsx:312-317`；`src/components/DiffView.tsx:75-88`）。更重要的是，展开箭头是一个嵌套在另一个可聚焦的 `role="treeitem"` 内部的 `role="button"`，并且具有 `tabIndex={-1}`（`src/components/VirtualTree.tsx:241-272`），这使得控件无法通过键盘聚焦。此外，行对每个渲染的节点都使用 `tabIndex={0}`，而不是使用漫游 tabindex（roving-tabindex）树模式。

### QA-05 — 测试仅证明了狭窄的正常路径，而非声称的产品功能

这三个 E2E 测试仅覆盖修复/树的存在性、DOM 行数和报告文本（`playwright/json-lens.spec.ts:29-100`）。它们没有测试拖放、附近的错误片段、实用工具、嵌入式 JSON 展开、工作线程取消/进度、复制路径、查询跳转、差异树/着色或实际的下载负载。冒烟测试套件包含 `expect(1 + 1).toBe(2)`（`src/smoke.test.tsx:12-14`），并产生未处理的 `act(...)` 警告。因此，README 中关于所有验收功能均已交付的断言存在实质性夸大。

## 正面验证

- `parseJson` 和 `tryFix` 是干净的纯函数，具有聚焦的测试；修复扫描器保留了有效的带引号的撇号。
- 树确实进行了 DOM 虚拟化：在提供的 30,000 对象生成器展开后（约 150,000 个树节点），Playwright 观察到少于 200 个渲染行。
- `diff` 递归地区分普通对象和索引对齐数组中已添加、已删除、已更改和类型已更改的值；报告导出使用浏览器 `Blob` 下载，无需网络访问。
- 项目没有运行时 fetch 使用，且构建紧凑（主 JS 170 kB；工作线程 0.36 kB，gzip 前）。

## 验收路径

1. 将缺失的编辑器/树控件连接到现有的纯实用工具；添加放置处理、节点级复制按钮和安全的嵌入值展开。
2. 为工作线程解析提供可取消的控制器、可见的进度状态和取消 UI。保留过期结果保护，但终止被取代的工作线程。
3. 实现查询结果导航（包括祖先展开 + 滚动）以及具有节点级差异类的虚拟化/过滤差异树。
4. 修复 null 字面量解析并定义重复/混合类型 ID 的行为；添加回归测试。
5. 用提示中的实际交互替换肤浅的 E2E 检查，移除测试警告，更正 CSS 注释，并使 README 与已验证的行为保持一致。

在本次独立审查期间，未修改任何交付文件。

## 第 2 轮 — 2026-08-25

后续报告称所有审查项目均已解决。独立验证确认了实际的改进，但**结论仍为请求更改**：三个 P1 验收路径在交付的浏览器应用中仍然失败。

### 重新验证的质量门控和已关闭的库缺陷

| 命令 | 结果 |
|---|---|
| `npm run build` | 通过；无 CSS 压缩器警告 |
| `npm test -- --run` | **195/195** 在 11 个文件中通过；无 React `act(...)` 警告 |
| `npx playwright test` | **3/3** 通过 |

`jsonpath` 现在将解析的字面量与解析失败分开表示，并且 `== null` 回归测试套件通过（`json-lens/src/lib/jsonpath.ts:102-141`；`jsonpath.test.ts:274-321`）。ID 对齐修复拒绝重复 ID，并按值**和**类型对唯一 ID 进行键控（`json-lens/src/lib/diff.ts:55-157`；`diff.test.ts:273-321`）。冒烟测试中的同义反复已消除；CSS 注释有效；编辑器工具栏操作、拖放、复制控件和可取消的流式工作线程已实质性添加。

### P1 — FE-10 仍然存在：两个同时的大文档相互取消

`App` 在 `Promise.all` 中同时启动 `parseText("a")` 和 `parseText("b")`（`json-lens/src/App.tsx:38-63`），但这两个调用都通过唯一的模块全局 `parseController` 路由（`lib/workerRunner.ts:121-132`）。`ParseController.parse()` 首先取消前一个句柄（`:38-39`），因此 B 必然会取消正在进行的 A 工作线程。

使用两个单独有效的 8,628,914 字符文档进行浏览器复现：三秒后，树显示 **“No JSON to display”**，且差异为 `type-changed $: undefined → <B document>`。这是中央双输入 Diff 工作流中的数据丢失故障。请使用每个窗格的控制器/引用（或在单个多作业控制器中解析两者），并添加一个具有两个 >5 MiB 输入的 E2E 测试。

替换后的 Worker 解析器也不再是原生的 `JSON.parse`：它调用了新的自定义 `streamingParse`（`lib/parse.worker.ts:3-7,55-60`），这与提示中明确的“原生解析”要求相悖。可以通过在原生解析期间终止 Worker 来实现取消；如果保留自定义解析器，实现需要明确的产品级例外以及广泛的对等性/模糊测试覆盖。

### P1 — FE-11 仍然存在：查询导航无法定位已折叠的深层匹配项

新的“下一个/上一个”控件更新了 `highlightedPath`（`src/App.tsx:102-121,160-179`），但 `VirtualTree` 仅在目标行已存在于 `rowMapRef` 中时才调用 `scrollIntoView`；它既不会展开祖先节点，也不会设置计算后的滚动偏移量（`src/components/VirtualTree.tsx:168-176`）。

浏览器复现步骤：加载 `{ "a": { "b": { "name": "needle" } } }`，查询 `$.a.b.name`，然后选择“下一个”。唯一渲染的行仍然是 `$` 和 `$.a`，两者均带有空的轮廓；没有目标获得焦点。现有的应用测试仅使用 `"$[*]"`，其中匹配项已在根节点下方渲染（`src/App.test.tsx:38-70`）。查询导航必须首先展开匹配项的所有祖先节点，然后布局并滚动/聚焦目标。

### P1 — FE-11 仍然存在：没有 Diff 树或功能性的“仅显示差异”过滤器

`DiffView` 在结构上未变：它将 `DiffEntry[]` 映射到一个扁平的 flex 列表（`src/components/DiffView.tsx:111-157`）。没有 `DiffTree`、层级结构、虚拟化或未变更节点的渲染，因此它无法实现树级别的三色标记，也无法实现隐藏未变更节点的过滤器。`showDiffsOnly` 仍然仅通过 `buildMarkdownReport` 更改报告文本（`src/lib/report.ts:51-65`）。对嵌套的添加/删除/更改示例进行直接 DOM 检查，未发现 diff 树行；只发现了三个扁平的条目卡片。

### 剩余的 P2 问题

- 所需的附近错误代码片段仍由 `parseJson` 构建，但被省略在两个编辑器错误视图中（`src/lib/parse.ts:110-119`；`src/components/EditorPane.tsx:301-315,404-418`）。
- README 声称所有按钮都有 `aria-label`，但导出按钮和展开/折叠全部工具栏仍然缺少它（`src/components/DiffView.tsx:75-88`；`VirtualTree.tsx:402-407`）。
- 提示要求 localStorage 配额回退机制**并带有用户通知**。`saveState` 仍然是一个静默的 catch，且 README 现在记录了这种静默行为（`src/lib/storage.ts:24-31`；`README.md:92`）。
- 3 原始的 E2E 用例仍未覆盖新的工具栏/拖放/复制/取消控件、两个大输入 Diff、深层查询跳转或 Diff 树/过滤器交互（`playwright/json-lens.spec.ts:29-100`）。

### 第 2 轮结论

库修复、警告清理、布局修复以及新添加的编辑器/树控件已被接受。在修复上述三个 P1 浏览器复现问题并由端到端测试覆盖之前，**不要**将 FE-10/FE-11 或最终任务验收标记为完成。

## 第 3 轮 — 2026-08-26

### 独立验证

| 命令 | 结果 |
|---|---|
| `npm run build` | 通过 |
| `npm test -- --run` | **223/223** 在 15 个文件中通过 |
| `npx playwright test` | **5/5** 通过 |

报告的功能性修复是真实的：

- `App` 为每个源拥有控制器实例（`json-lens/src/App.tsx:29-36`）。在无头浏览器中，我同时加载了两个分别有效的 **5,244,955 字符** JSON 文档；A 在树中渲染，Markdown diff 正确报告了仅 `$.marker: "A" → "B"`。之前的交叉取消复现不再发生。
- 针对 `{a:{b:{name:"needle"}}}` 查询 `$.a.b.name` 并按下“下一个”时，渲染了 `$`、`$.a`、`$.a.b` 和 `$.a.b.name`；目标获得了蓝色轮廓和 DOM 焦点。`VirtualTree.tsx:168-222` 中的两阶段祖先展开/居中逻辑有效。
- 层级 diff 视图和仅显示差异的剪枝在源检查和浏览器检查中均有效（`DiffView.tsx:70-257`，`diffTree.ts`）。嵌套的干净容器仅在完整模式下可见，并在切换时实例化其子节点。错误代码片段和可关闭的存储警告也存在，并由单元/E2E 用例覆盖。

### 剩余的 P1 — Worker 不再使用所需的原生解析器

修正后的提示明确要求使用原生 `JSON.parse` 进行解析。正常大小的文档仍通过 `parseJson` 使用它，但所有 >5 MiB 的文档都使用自定义的 `streamingParse` 实现（`json-lens/src/lib/parse.worker.ts:3-7,55-60`），这是一个具有自身语法/语义兼容性表面的独立解析器。这是为了启用字节级进度和协作式取消而引入的，但它不符合该技术要求。

为了严格关闭此问题，请在 Worker 中保留原生 `JSON.parse`，并通过终止/替换 Worker 来取消。确定的解析百分比无法诚实地与原子原生解析共存；UI 可以改为显示不确定的解析状态，或者必须明确豁免提示中的要求。当前的自定义解析器有有用的针对性测试，但没有证明其在完整 JSON 语法上与 `JSON.parse` 对等性的差分/模糊测试套件。

### 剩余的 P2 问题

- 所声称的 5 端到端（E2E）场景并未覆盖双大文档路径、深度查询跳转、Worker 取消/进度、拖放/复制控件或实际下载负载（`json-lens/playwright/json-lens.spec.ts:29-158`）。相关的单元测试虽有用，但不能替代对集成路径的浏览器覆盖。
- 提示要求为所有按钮添加 `aria` 标签。导出控件、运行查询（Run Query）以及树形控件的展开/折叠全部按钮仍有文本名称，但缺少显式的 `aria-label`（`components/DiffView.tsx:132-145`；`App.tsx:213-221`；`VirtualTree.tsx:402-407`）。
- 仅显示 A 的解析进度（`App.tsx:255-284`）。仅针对 B 的大规模解析会激活取消按钮，但未提供 B 的可视化进度。

### 第 3 轮裁决

**在固定提示下要求修改，仍遗留一个 P1 问题。** 第 2 轮中的三个功能性阻塞项均已关闭，且实现已实质性改进。如果豁免针对可取消流式解析的原生 `JSON.parse`，则剩余问题为 P2 级 QA/无障碍优化，功能性裁决将变为批准。
