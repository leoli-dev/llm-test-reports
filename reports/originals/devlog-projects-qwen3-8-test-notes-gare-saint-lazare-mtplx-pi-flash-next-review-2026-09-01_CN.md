---
type: Note
title: "Gare Saint-Lazare — MTPLX/Pi Flash Next 独立验收与代码审查"
status: current
description: "对 Gare Saint-Lazare React/R3F 交付物的独立审查；模拟和测试表现强劲，但蒸汽出口消散是 P1 级需求失败。"
tags: [qwen3.8, flash-next, mtplx, pi, react, threejs, r3f, code-review, frontend]
timestamp: 2026-09-01T01:58:16Z
---

# Gare Saint-Lazare — MTPLX/Pi Flash Next 独立验收与代码审查

[English](devlog-projects-qwen3-8-test-notes-gare-saint-lazare-mtplx-pi-flash-next-review-2026-09-01.md) | [简体中文](devlog-projects-qwen3-8-test-notes-gare-saint-lazare-mtplx-pi-flash-next-review-2026-09-01_CN.md)

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

## 范围与证据处理

验收权限依据为 `test-prompts/3d-gare-saint-lazare.md`（历史本机文件，未随本报告发布）。被审查的交付物为 `$HOME/Code/qwen3.8-tests/gare-saint-lazare-flash-with-pi`；它不是一个 Git 仓库，因此本次审查针对的是工作树，而非提交差异。

用户提供的终端/仪表盘截图仅作为上下文，并非完成证明。由于无法再主张浏览器标签页引用，验证转而使用了已检查的源代码、全新的生产预览、已提交的 Playwright 截图以及独立的本地 Playwright 探针。Orbital Garden 审查提供了对比契约：R1–R7 / 100 要点，且任何 P1 级发现都将阻止验收。

## 运行配置与性能上下文

| 字段 | 记录值 | 来源 |
|---|---|---|
| MTPLX | `2.10.1` | 用户陈述，2026-09-01. |
| 模型 | [`Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed`](https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed) | 用户提供的模型 URL。 |
| 智能体 | Pi | 用户陈述。 |
| 上下文容量 | 196K tokens | 用户陈述。 |
| 长任务解码观察 | 最终长任务后稳定在约 **40 tok/s** | 用户陈述；这是会话级观察，而非受控基准测试。 |

最终数值不得直接与其他模型/配置文件的仪表盘或任务运行进行比较。它并未确立冷/热缓存状态、提示/补全 token 数、TTFT、实际耗时、工具轮次、硬件争用或请求隔离情况。它被保留作为后续受控重放时有用的会话上下文。

### 视觉输入诊断

上游 `Qwen/Qwen3.8-Flash-Next` 是多模态的：其模型卡片将其标记为 Image-Text-to-Text，描述了一个带有视觉编码器的因果语言模型，并给出了图像输入示例。MTPLX 量化卡片也指出视觉塔保留在权重中。因此，Pi 声称其“无法读取图像”描述的是当前活动的智能体/运行时路径，而非底层模型的架构。

当前活动的 Pi `models.json` 使用 `input: ["text"]` 注册了 `mtplx-flash-next-optimized-speed`（`$HOME/.pi/agent/models.json:26-29`）。因此，Pi 将其视为纯文本，并且不会转发附加的图像内容。Pi 自身的 VLM 指南指出，OpenAI 兼容模型必须声明 `input: ["text", "image"]`；否则图像内容可能会被丢弃。仅更改该声明是不够的：所选的 MTPLX 服务器/API 路径还必须接受多模态聊天内容并调用视觉处理器。在依赖视觉自审查之前，请使用单图像提示和服务器端请求检查来验证完整路径。

来源：[上游 Qwen 模型卡片](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)，[MTPLX 量化卡片](https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed)，[Pi VLM 配置指南](https://github.com/earendil-works/pi/issues/2687)。

## 结果

**结论：要求修改 — 78/100（7.8/10）。**

核心立体模型已实质性实现：一个受限的 3/4 R3F 场景，两条轨道车道，现代和蒸汽列车编组，确定性的列车/行人模拟，程序化音频，天气，调试信息以及导演模式。P1 级问题具体且可复现：残留蒸汽在列车离开沙盒后被销毁，而不是在列车离开后消散。响应式、运动偏好以及最终用户交互的证据也需要改进。

| 评分标准 | 得分 | 原因 |
|---|---:|---|
| R1 — 场景与空间构建 | 14/15 | R3F、有界立体模型、两条轨道沟槽、雨棚、时钟、车站结构及天际线均存在，且未使用外部模型。 |
| R2 — 列车、行人、直接交互 | 18/20 | 已实现状态机、精确对接、乘客耦合、列车信息及天气控制；浏览器证明未物理点击列车或时钟。 |
| R3 — 视听与动态呈现 | 9/15 | 存在三种天气状态、雨水及程序化音频，但出站蒸汽和广播降级表现不足。 |
| R4 — 韧性与可访问性 | 13/20 | 强制无 WebGL 情况具有信息性且无画布；减少动态效果仅部分实现，且 390×844 HUD 面板重叠。 |
| R5 — 艺术指导 | 8/10 | 微型车站构图清晰，但日间场景仍相对低多边形/玩具化，且湿润/电影感材质响应较为克制。 |
| R6 — 验证证据 | 9/10 | 存在 lint/build、8 单元测试、7 E2E 测试及四个要求的截图状态；缺失针对性回归测试降低了置信度。 |
| R7 — 代码质量与审查就绪度 | 7/10 | 聚焦的模拟/渲染/UI 边界及对象池化表现强劲，但一个 P1 及列出的 P2 问题阻碍了发布就绪。 |
| **总计** | **78/100** | **请求修改；FE-18 为 P1。** |

## 独立验证 — 2026-09-01

| 检查项 | 结果 | 证据 |
|---|---|---|
| Lint | 通过 | `npm run lint` 退出码为 0. |
| 生产构建 | 通过（含警告） | `npm run build` 退出码为 0；Vite 输出 1,012.87 kB JS / 283.63 kB gzip 及标准的 >500 kB 代码块警告。 |
| 模拟测试 | 通过 | Vitest 8/8 通过，包括 15 分钟同轨不重叠、精确对接、自然边界、人群曲线及死锁检查。 |
| 浏览器 E2E | 通过 | Playwright 7/7 在 28.9 秒内通过：启动、停靠的现代列车、蒸汽、雨夜、信息卡片、导演模式及音频启用。 |
| 视觉状态 | 通过 | `e2e/screenshots/01-boot.png`、`02-docked.png`、`03-steam.png` 和 `04-rain.png` 清晰展示了所需的初始、现代、蒸汽及雨天状态。 |
| 390×844 响应式探测 | P2 失败 | 无水平文档溢出，但在相同的 y=18 处，`.plaque` 为 x=20/w=353.6，`.toolbar` 为 x=0/w=370；底部调试和声音面板重叠。 |
| 强制 320×568 无 WebGL | 通过 | 覆盖 WebGL 上下文后生成了 0 画布，具有可读的解释性文本且无文档溢出。 |

## 发现

### P1 — 蒸汽残留物在沙盒边界处被销毁，而非逐渐消散

`SteamPlume` 是 `SteamTrain` 的子级。其粒子具有独立的寿命，但保留在列车的局部坐标系中。`Simulation.step()` 在列车尾部越过远端边界时立即移除列车，随后 `SceneContent` 移除 `TrainView`；因此整个烟柱随列车一起消失。这未满足蒸汽在出发后逐渐消散的明确要求。

将残留粒子移至场景级、世界坐标系的对象池中，或在列车清理后保留一个分离的发射器，直到其活动粒子过期。添加一个回归测试，在 `EXITED` 后采样粒子，并证明在完全淡出前数量呈递减且非零状态。

证据：`gare-saint-lazare-flash-with-pi/src/render/Trains.tsx:99-160,315`；`src/render/Scene.tsx:191-203`；`src/sim/simulation.ts:182-183`。

### P2 — 广播回退为铃声，而非公告

`announce()` 仅在法语浏览器语音已可用时才调用语音。若无可用语音，则播放短促铃声；这不是法式到站公告。其 `_gain` 参数也未被使用，因此合成语音未遵循所述的距离混合。

即使没有匹配的语音，也应始终使用 `lang='fr-FR'` 发出语音，或提供真正的合成语音式回退；将距离映射到可用的音量控制。

证据：`gare-saint-lazare-flash-with-pi/src/audio/AudioEngine.ts:201-224`。

### P2 — 减少动态效果实现仅部分完成且文档过度声明

该偏好设置抑制了雨水和行人起伏，但模拟速度、列车和蒸汽仍完全动画化。README 称模拟会变慢，但没有相应的实现。要么为非必要效果添加减少的时间比例/暂停，要么修订文档以描述实际行为。

证据：`gare-saint-lazare-flash-with-pi/src/App.tsx:41-47,74-77`；`src/render/Scene.tsx:204`；`src/render/Passengers.tsx:79-80`；`README.md:89-90`。

### P2 — 移动端 HUD 组件重叠

仅限桌面的绝对布局允许顶部控件覆盖铭牌，且调试和音频控件在 390×844. 处重叠。添加一个移动媒体查询以堆叠或折叠控件，并在浏览器回归中覆盖布局。

证据：`gare-saint-lazare-flash-with-pi/src/styles.css:54-85,108-150,200-208`；上述新记录的 390×844 Playwright 探测。

### P2 — E2E 绕过两个要求的直接交互并缺失回退/动态覆盖

列车卡片测试调用 `window.__gare.select()` 而非点击投影画布几何体；天气测试点击工具栏而非物理时钟。该测试套件不包含移动端、强制禁用 WebGL、减少动态效果、退出冒烟测试或音频事件断言。

证据：`gare-saint-lazare-flash-with-pi/e2e/diorama.spec.ts:81-106`。

## 积极发现

- `sim/` 无框架依赖且经过直接测试；渲染读取模拟状态而非拥有游戏逻辑。
- 车道占用和长时间运行测试为列车重叠和边界突然生成提供了可信的保护。
- 乘客流与状态耦合而非随机游荡，具有排队、上车、下车和冷却状态。
- 乘客、车轮和静态细节渲染使用实例化；蒸汽使用固定 170 槽位池而非无限制分配。
- HUD 显示周期、列车数量、站台占用率和 FPS，而导演模式移除所有 UI。

## 建议的收尾工作

1. 首先解决 FE-18，然后添加退出后的视觉/行为冒烟回归测试。
2. 实现可靠的公告回退机制，并使其与距离/音量行为保持一致。
3. 修正减少动态效果的语义和响应式 HUD 布局。
4. 扩展 E2E 以直接点击画布上的列车/时钟，390×844, 强制禁用 WebGL、减少动态效果以及退出冒烟持久性。
5. 在重新考虑验收之前重新运行完整的验证矩阵。
