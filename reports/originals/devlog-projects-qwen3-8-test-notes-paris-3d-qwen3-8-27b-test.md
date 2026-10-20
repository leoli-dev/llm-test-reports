---
type: Note
title: Paris 3D Qwen3.8-27B benchmark
status: current
description: An in-progress, end-to-end coding-agent benchmark for local oMLX Qwen3.8-27B using a data-driven Three.js reconstruction of central Paris.
tags: [qwen3.8, qwen3.8-27b, omlx, benchmark, threejs, osm, paris-3d]
timestamp: 2026-08-22T19:48:06Z
---

# Paris 3D — Qwen3.8-27B 测试

## 状态

Qwen 已宣布实现完成，但独立文件与浏览器验收结果为 **不通过（Request Changes）**；不得将本项目作为完成的 Paris 3D 交付。当前测试工作区为 `$HOME/Code/qwen3.8-tests`，题面与评分表分别位于：

- `$HOME/Code/qwen3.8-tests/prompts/paris3d.md`
- `$HOME/Code/qwen3.8-tests/prompts/paris3d-rubric.md`

## 测试目标

用一个完整浏览器工程验证本机 oMLX 上 Qwen3.8-27B 的 coding-agent 能力：是否能基于真实 OSM/Overpass 数据建立巴黎中心城区 Three.js 场景，并完成地标程序化建模、真实路网交通、车/船/飞机三种游览模式、性能控制和浏览器自验收。

这不是纯速度跑分。重点观察模型是否会先处理数据与坐标正确性、能否在长任务中持续运行/截图/修正，以及是否会在复杂度和外部 API 限流下缩小范围、伪造数据或留下半成品。

## 题面中最具区分度的要求

- Overpass 数据抓取、分块、重试/退避和本地缓存；禁止编造地理数据或使用 3D 地图引擎/现成地标模型。
- 以卢浮宫为原点的局部米制坐标；`cos(phi)` 纬度修正及两组距离单测。
- 5 万级建筑的挤出、坡屋顶、分块合批、LOD，以及带岛屿洞的塞纳河和桥下净空。
- 埃菲尔铁塔曲线塔腿与实例化格构、可穿行的凯旋门十字拱洞、卢浮宫玻璃金字塔网格等程序化地标。
- 尊重单行线的道路有向图、跟车行为、戴高乐广场环岛、船流和三种玩家载具。
- Playwright/Puppeteer 无控制台 error、8 张固定场景截图、30 秒 FPS 采样和 README 性能证据。

## 启动前判断

该题适合作为“极限工程执行力”横向测题，但对 27B 偏残酷：预计能做出可演示的城市骨架、部分 OSM 管线和若干重点地标；较高风险是完整数据规模、河流洞、多载具物理、真实有向路网/环岛、全套视觉验收和性能目标被简化或仅表面完成。

评估时不能只看截图，应检查抓取与缓存证据、投影测试、地标模块/`getInfo()`、路网单行线逻辑、Playwright 原始日志和性能采样。评分表标为 100 分，但现有各大项合计 **115 分**（20+12+15+25+15+15+13），后续正式横评前应归一或重配权重。

## 运行时速度快照

来自 oMLX v0.6.2 Dashboard 的当前 session / All Models 截图：

| 指标 | 数值 | 解读 |
|---|---:|---|
| Total prefill tokens | 10.4M | 会话累计预填充量，不等同一次性上下文长度。 |
| Cached tokens | 9,547,776 | 长任务重复上下文的大部分命中缓存。 |
| Cache efficiency | 91.8% | 很高；缓存有效降低反复携带上下文的等待。 |
| Prompt processing（excl. cached） | 111.1 tok/s | 新题面/新上下文读入速度良好。 |
| Token generation | 17.4 tok/s | 对 27B 本地模型足以进行长工程任务；约 10k 生成 token 需 9–10 分钟，未包含工具、构建、浏览器和网络等待。 |

该面板为 Session + All Models 平均值。要将本次结果严格归因给 Qwen3.8-27B，测试结束后应按单模型过滤并在运行前清零计数器；任务总耗时的主要变量将是 agent 的迭代质量与外部工具链，而非纯生成速度。

## 待记录的结束证据

- 最终目录/提交状态与实际完成范围。
- `fetch_data` 日志和 `data/` 真实数据证据。
- 单元测试、开发服务器与浏览器 console 结果。
- 8 张规定截图、FPS/draw call/三角数/加载时间原始结果。
- 按 rubric 的逐项分数、扣分依据和是否出现伪造/偷范围/未实现路径。

## 结束验证（2026-08-22）

Qwen 最终声称：18/18 测试通过、0 console error、8 张截图、6 类 OSM GeoJSON、headless 2 FPS。独立复核确认其中部分“成功”仅是表面产物：

- `npm test` 的确为 18/18 通过，`npm run build` 也成功；但测试仅覆盖投影（7）与埃菲尔铁塔模块（11），没有验证真实 GeoJSON 坐标、场景、交通或三种载具。
- `scripts/fetch_simple.mjs:82-90` 把 Overpass JSON 的 `el.nodes`（节点 ID）误当成 `{lon, lat}` 对象，而 `[out:json] ... out geom` 的坐标位于 `el.geometry`。因此 6 个生成的 GeoJSON 坐标全部序列化为 `[null, null]`：建筑 74,118、道路 9,745、水体 125 等要素计数真实存在，但没有一对有效坐标。浏览器场景不可能建立真实巴黎几何。
- 浏览器手测开车、开船、开飞机模式均无法呈现可游览巴黎；画面出现空白/过曝天空、巨大错误平面或玩家载具遮挡视野。`src/city/water.js:105-141` 以 XZ 顶点建网格后又旋转 `-PI/2`，将水面转为垂直面，是船模式巨大墙体的直接原因之一。
- 8 张所谓验收截图全部显示模式选择遮罩，而非题面指定机位。原因是 `scripts/screenshot.mjs:48-50` 在每次截图前强制 `mode-selector.classList.remove('hidden')`。它们不能作为地标、交通或视觉质量证据。
- 性能也未达标：报告为 2 FPS、约 60 秒首屏加载，低于题面 ≥50 FPS、<8 秒的硬预算；README 中的“真实 GPU 预期 50–60”没有实测依据。

结论：这是一个很有信息量的 27B coding-agent 压力测试。模型完成了大规模代码与文件产出、可编译构建和局部单测，却没有将外部数据契约、端到端视觉质量与验收产物闭环。详见 backlog 的 `QA-03`。

## 最终复核与停止决定（2026-08-22）

用户决定停止整改。Qwen 在 review 后确实修复了数据坐标问题：正式 `fetch_data.mjs` 取代临时脚本，6 层 GeoJSON 的所有坐标均有限且落在 bbox 内；`dataIntegrity.test.js` 加入后共 46/46 单测和 build 通过。

但第二次独立视觉复核仍拒绝验收：8 张重新生成的“规定机位”不再有模式选择遮罩，却呈现巨大方块、失真格构、黑暗立面或不对应机位的场景；车/船/机 live smoke 图分别出现近黑穿模、近黑船内/建筑内视角和无城市可见的暗景。`performance.json` 还记录 926 draw calls/帧（题面要求 <400）、6 FPS（要求 ≥50）以及大量 water earcut warning。Qwen 所称“所有修复关闭”与视觉证据矛盾。

**最终结论：** Paris 3D 作为自主 coding-agent 端到端任务未通过；不再继续修复。这个 run 的主要发现是：模型可在明确 review 下修复局部数据契约并补齐测试，但仍不能可靠地以真实浏览器视觉证据为目标进行系统集成和质量收敛。
