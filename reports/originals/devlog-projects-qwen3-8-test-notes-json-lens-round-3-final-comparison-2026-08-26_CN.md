---
type: Note
title: "JSON Lens — 第 3 轮最终审查及 Qwen 与 Ornith 对比"
status: current
description: "Qwen 3.8 27B 与 Ornith 1.5 35B-A3B JSON Lens 交付物的同提示词最终对比；两者均通过声明的门槛，但均未达到最终验收标准。"
tags: [json-lens, qwen3.8, ornith, code-review, benchmark, round-3]
timestamp: 2026-08-26T15:39:18Z
---

# JSON Lens — 第 3 轮最终审查及模型对比

[English](devlog-projects-qwen3-8-test-notes-json-lens-round-3-final-comparison-2026-08-26.md) | [简体中文](devlog-projects-qwen3-8-test-notes-json-lens-round-3-final-comparison-2026-08-26_CN.md)

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

## 范围与方法

两个仅基于浏览器的 React/TypeScript/Vite 交付物均使用了相同的固定 JSON Lens 提示词（历史本机文件，未随本报告发布）：

| 交付物 | 模型 / 运行 | 目录 |
|---|---|---|
| Qwen | MTPLX Qwen 3.8 27B Optimized Quality — Coding Stable | `$HOME/Code/qwen3.8-tests/json-lens-qwen` |
| Ornith | Ornith 1.5 35B-A3B Coding, Medium | `$HOME/Code/qwen3.8-tests/json-lens` |

本笔记延续了 Qwen 第 1–2 轮的审查，并在三个审查周期后对这两个项目进行了对比。它使用了源代码检查、现有的 [Ornith 第 1–3 轮审查](devlog-projects-qwen3-8-test-notes-json-lens-ornith-code-review-2026-08-25_CN.md)、声明门槛的重跑以及额外的对抗性探测。通过狭窄的测试套件仅被视为其已测试行为的证据，而非固定提示词所有要求的证明。

## 独立门槛结果

| 项目 | 构建 | 单元测试 | Playwright |
|---|---:|---:|---:|
| Qwen | `tsc -b && vite build` 通过；38 个模块，187.18 kB JS | 120/120, 10 个文件 | 6/6 通过 |
| Ornith | `tsc --noEmit && vite build` 通过；44 个模块，182.80 kB JS | 223/223, 15 个文件 | 5/5 通过 |

Ornith 的检查项已为此对比重新运行。Qwen 的同样三个门槛在本第 3 轮审查前刚刚独立重新运行。两个项目均未做修改。

## Qwen 第 3 轮审查

### 第 2 轮真正修复的内容

迭代式 TreeView 遍历和精确路径 JSONPath 评估确实处理了之前失败的普通 4,000 级文档。全局前序遍历差异回归问题在普通输入下也已修复，且交付的 E2E 套件现在包含了之前过时的从大到小、localStorage 恢复以及顶层 `null` 用例。

### P1 — 深层文档仍会导致差异工作流崩溃

深层文档的修复并不完整。`diff()` 仍然递归调用 `isIdentical()`（`src/lib/diff.ts:52-72`）、`collectChangedPaths()`（`:90-176`）和 `emit()`（`:194-349`）。两个独立构建的、具有不同叶子值的 4,000 级 `{a: ...}` 值，在使用默认选项和 `{ includeUnchanged: true }` 时均抛出 `RangeError: Maximum call stack size exceeded`。异常始于请求未更改行时的 `isIdentical`；另外两个递归遍历在正常差异路径中保留了相同的上限。

这是平台解析器接受的 JSON 的核心功能失败。请用显式的帧/工作栈替换完整的差异管道，并添加相同、已更改、对象和数组深度的回归测试。

### P1 — 新的路径前缀树破坏了有效键并允许原型污染

第 2 轮的 TreeView 优化通过按 `.` 和 `[` 分割显示路径来重建段（`src/components/TreeView.tsx:152-209`）。该表示对于合法的 JSON 对象键是不可逆的：

- 在父节点展开后，`{"a.b":{"child":1}}` 和 `{"a[0]":{"child":1}}` 无法显示 `child`。
- `{"#":{"child":1}}` 覆盖了用于根路径的相同 `'#'` 完成标记，导致仅可见 `$`。
- `JSON.parse('{"__proto__":{"child":1}}')` 使普通对象段字典遵循继承的 `__proto__` 属性；存储其 `'#'` 标记会改变页面域中的 `Object.prototype['#']`。

请使用由树模型携带的原始段数组，或完全可逆的 JSONPath 编码。使用 `Map`（首选）或 null 原型对象进行段存储，并使用显式的布尔完成字段，而不是与用户键冲突的 `'#'` 属性。将上述所有四个示例添加为回归测试。相同的显示路径构建对于包含标点符号键的复制/查询/差异路径也是模糊的。

### P1 — 差异模式绕过了 >5 MiB Worker/取消契约且缺乏差异树

仅查看模式使用 `useParse`。在差异模式下，两个文本域都在渲染时的 `useMemo` 调用中同步解析（`src/App.tsx:65-68,262-311`），因此任何 >5 MiB 的输入都可能阻塞 UI，且既无进度指示也无取消功能。这恰好与提示词中关于大文件的要求在双文档对比工作流中相冲突。

此外，`DiffView` 将 `DiffEntry[]` 直接映射到扁平行（`src/components/DiffView.tsx:47-102`）。该实现提供了彩色条目和功能性未更改过滤器，但未提供所要求的分层差异树/节点标记。Ornith 实现了该缺失的产品界面；Qwen 未实现。

### P2 — 验收 E2E 仍然过于狭窄

名为“100k”的测试提供的是 10,000 个键，而非 100,000, 个，因为浏览器 `fill()` 超时（`e2e/jsonlens.spec.ts:48-55`）。陈旧工作线程测试也使用 10,000 个键，远低于 5 MiB 阈值，因此它无法验证其声称覆盖的 Worker 路径（`:216-257`）。没有 E2E 覆盖特殊键展开、实际的 Worker 取消/进度、拖放（在 `InputPanel.tsx` 中未实现）、大型差异模式、查询导航、复制操作或下载字节。

### Qwen 第 3 轮裁决

**请求修改。** 常规文档路径表现良好，且原始第 1 轮的 P1s 已得到实质性解决，但当前交付引入了本地原型污染漏洞，破坏了普通 JSON 键，并且仍然无法处理深层/大型差异工作。它尚未准备好进行最终验收。

## Ornith 统一复查

现有的 [Ornith 审查](devlog-projects-qwen3-8-test-notes-json-lens-ornith-code-review-2026-08-25_CN.md) 已经记录了第 3 轮的重大改进：独立的 A/B 解析控制器、深层查询导航、真实的差异树/过滤器、友好的代码片段以及配额通知。它正确地保持 P1 处于开放状态，因为 >5 MiB 的解析使用了自定义的 `streamingParse`，而非提示中强制要求的原生 `JSON.parse`（`src/lib/parse.worker.ts:1-7,55-60`）。

此对比增加了一项统一的深层数据发现，这是其先前第 3 轮测试未覆盖的：`buildTree()` 使用 `walk()` 进行递归下降（`src/lib/tree.ts:52-121`），且其 `diffValues()` 是递归的（`src/lib/diff.ts:198-300`）。同样独立构建的 4,000 级 JSON 在 `RangeError` 中导致 `buildTree(a)` 和 `diff(a, b)` 均出现错误。因此，Ornith 也保持为 **请求修改**，现在包含两类 P1：原生解析器不合规以及深层树/差异栈溢出。

此外，还存在一个根 `null` 显示回归：解析成功被折叠到 `JsonValue | null` 无文档哨兵中（`src/App.tsx:19-20,62-79`），随后 `VirtualTree` 替换为 `{}` 并为 `value === null` 渲染其空状态（`src/components/VirtualTree.tsx:55-59,456-465`）。查询也通过 `parsedA ?? {}` 针对 `{}` 运行。这对于提示中的正常文档 UI 来说是 P2，但这是 Qwen 第 2 轮修复表现更好的具体领域。

## 记分卡

分数满分为 10，且为比较性质量分数，而非发布批准。加权总分有意保留硬性验收阻塞项的可见性，而不是让测试数量掩盖它们。

| 维度（权重） | Qwen 3.8 27B | Ornith 1.5 35B-A3B | 基于证据的对比 |
|---|---:|---:|---|
| 固定提示功能覆盖（30%） | 5.5 | 8.0 | Qwen 实现了大多数日常控件，但缺乏拖放和分层差异视图，并将 Diff 模式的大文件通过主线程发送。Ornith 实现了更完整的编辑器、复制、查询导航和差异树界面。 |
| 正确性与安全性（25%） | 3.0 | 5.5 | Qwen 的深层差异失败加上有效键回归和 `__proto__` 原型污染是严重的。Ornith 未发现等效的污染/路径问题，但其深层树/差异路径仍然溢出。 |
| 大数据行为（15%） | 6.0 | 5.5 | Qwen 的视图 Worker 保留了原生解析，且其树/查询深度修复是真实的，但 Diff 模式没有 worker。Ornith 具有可取消的双窗格 worker/进度，但替换了必需的原生解析器并急切地构建递归全树。 |
| 测试与验证（15%） | 6.0 | 8.0 | Qwen：120 单元 / 6 E2E，但两个命名的大型数据 E2Es 未达到其阈值。Ornith：223 单元 / 5 E2E，具有更广泛的组件覆盖，尽管一些浏览器集成和深层压力测试仍未测试。 |
| 可维护性与可访问性（15%） | 6.5 | 7.5 | Qwen 紧凑且标记了控件，但临时路径解析器/标记字典很脆弱。Ornith 更具模块化，具有漫游树焦点，剩余显式 aria-label 润色。 |
| **加权质量分数** | **5.0 / 10** | **7.0 / 10** | **两者均未通过验收；Ornith 在实质上更接近。** |

## 最终对比结论

**Ornith 1.5 35B-A3B 在整体产品完成度和测试证据方面赢得了这项三轮任务。** 其第三轮代码提供了更大比例的请求日常工具体验：双大输入生命周期处理、查询导航、差异树、功能性过滤、编辑器集成以及更广泛的回归测试套件。

**Qwen 3.8 27B 有两个有意义的优势：** 它为其 Worker 路径保留了原生 `JSON.parse`，且其最终迭代 TreeView/JSONPath 工作解决了 Ornith 仍然失败的普通 4,000 级导航案例。但其第 3 轮优化以正确性和安全性回归为代价换取了该收益，且其 Diff 模式在结构上仍不够完整。因此，原始绿色门控计数不应被解释为 Qwen 的胜利。

对于严格的验收重跑，Ornith 首先需要原生 Worker 解析（或明确的需求豁免）以及迭代式深层树/差异遍历。Qwen 首先需要安全的规范路径表示、非递归差异处理、基于 Worker 的双窗格差异解析，以及缺失的层级差异/拖放交互。在此之前，两者的结果均为具有参考价值的编码智能体输出，而非已接受的 JSON Lens 交付物。
