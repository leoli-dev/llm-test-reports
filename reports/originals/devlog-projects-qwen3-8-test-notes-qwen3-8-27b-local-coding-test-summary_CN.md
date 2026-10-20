---
type: Note
title: "Qwen3.8-27B 本机编程代理测试总结"
status: current
description: "M5 Max 上全部本机 oMLX/MTPLX Qwen3.8-27B 编程代理测试的综合总结，涵盖各测试结果、跨测试失败模式及按证据权重形成的使用结论。"
tags: [qwen3.8, omlx, mtplx, qwen-code, pi, quantization, context, benchmark, summary]
timestamp: 2026-08-24T16:30:00Z
---

# Qwen3.8-27B 本机 coding-agent 测试总结（全量）

[English](devlog-projects-qwen3-8-test-notes-qwen3-8-27b-local-coding-test-summary.md) | [简体中文](devlog-projects-qwen3-8-test-notes-qwen3-8-27b-local-coding-test-summary_CN.md)

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

本页综合 2026-08-21 至 2026-08-24 的全部测试 note：4 个端到端 coding 战役（Arcology、Paris 3D、LLM bandwidth showcase、Frog Choir）、2 个性能观察 scope 与 2 个未结 bug。既是逐测试的结果档案，也是横向失败模式与工作流结论的唯一汇总。

## 0. 结论（当前默认工作流）

对于 M5 Max / 128GB unified memory 上的复杂本地 coding-agent 任务，当前最稳妥的默认组合是：

> **8-bit Qwen3.8-27B + Qwen Code + thinking off + 每个窄任务一个 subagent + 每阶段新 session + build/test/E2E + 独立复核验收。**

这是一套有真实任务证据支持的工程选择，不是严格控制变量下的模型、量化或 agent 总排名。严格对照保留给 BENCH-02/03（历史本机文件，未随本报告发布）。

## 1. 四个端到端战役的结果档案

| 战役 | 日期 | 模型/量化 | Agent | 结果 | 关键证据 |
|---|---|---|---|---|---|
| **Arcology 2049**（纯前端控制室） | 08-21 | AWQ-5.0bpw via oMLX | Qwen Code 0.21.15, YOLO | **成功（B+）**：一轮交付 + 一轮 review 修复闭环；后续可视 QA 陷入 3 小时验证循环被取消 | [首测记录](devlog-projects-qwen3-8-test-notes-first-successful-qwen-code-test_CN.md)；[Round 1/2 review](devlog-projects-qwen3-8-test-notes-arcology-control-room-round-1-review_CN.md)；遗留 UX-02 窄屏 overflow（历史本机文件，未随本报告发布） |
| **Paris 3D**（真实 OSM 数据 Three.js 城市） | 08-22 | 27B via oMLX | Qwen Code | **失败结案**：声称 18/18 测试通过，但 Overpass 解析把节点 ID 当坐标，6 层 GeoJSON 全部 `[null,null]`；8 张“验收截图”实为强制显示的模式选择遮罩；修复数据后视觉仍不可游览，926 draw calls / 6 FPS（预算 <400 / ≥50） | [Paris 3D 测试](devlog-projects-qwen3-8-test-notes-paris-3d-qwen3-8-27b-test_CN.md) |
| **LLM bandwidth showcase**（教学站点） | 08-23 | **oQ4e-mtp（4-bit）** via oMLX RC | Qwen Code | **交付但验收失败结案**：站点完整可用，但首轮独立 review 有 3 个 P1 正确性缺陷（Canvas 不启动、offload 伪造速度、无效滑杆）；三轮修复后动画/ARIA/M3 Ultra 均过，最终仍剩 M5 Max 404 来源标 `confirmed` 的 DATA-01（历史本机文件，未随本报告发布） | [交付测试](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test_CN.md)；[Round 1](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review_CN.md) / [2](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review_CN.md) / [3](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review_CN.md) |
| **Frog Choir**（摄像头+手势+Web Audio） | 08-23/24 | **INT8 权重 + INT8 MTP + q8 KV** via MTPLX `optimized-quality` | Pi（初跑）→ Qwen Code（整改） | **基本成功，剩 1 个 P1**：Pi 初跑被 MTPLX 显式 cancel 中断（未归因）；Pi 后续声称完成但 Round 1 查出 4 个核心缺陷（摄像头黑屏、连续嗡声、handedness、校准无效）；Qwen Code 分任务整改后 Round 2 恢复主链路，build + 35/35 unit + 11/11 E2E；仅剩真机 handedness 映射 FE-07（历史本机文件，未随本报告发布） | [test note](devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test_CN.md)；[Round 1](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review_CN.md) / [Round 2](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review_CN.md)；cancel investigation（历史本机文件，未随本报告发布） |

## 2. 横向失败模式（每一条都有 ≥2 个战役的证据）

### 2.1 “测试通过”不等于“验收通过”——模型系统性地用测试计数冒充完成证据

- Paris 3D：18/18 单测通过，但测试只覆盖投影和铁塔模块，掩盖了全部坐标为 null；截图脚本强制移除遮罩，让 8 张“验收图”看似存在。
- Frog Choir Round 1：25 unit + 10 E2E 全绿，但 E2E 只走演示滑杆路径，从未 mock 摄像头或断言音频；真机授权后黑屏。
- Frog Choir Round 2 还发现**循环测试**：handedness 单测断言的正是生产代码同一套交换逻辑，所以 35/35 通过与真机相反并存。

**对策：**验收必须由独立复核执行，且测试要求必须写进题面（mock 边界、断言什么、人工验收哪一步）；新 test prompts 已按此设计。

### 2.2 外部数据契约是最大重灾区

- Paris 3D：`el.nodes`（ID 数组）被当成 `{lon,lat}`，正确坐标在 `el.geometry`——一个字段名级别的契约误读毁掉整个数据管线。
- Bandwidth showcase：三轮 review 都栽在数据事实性上——404 URL 标 `confirmed`、M3 Ultra 字段与自己 note 矛盾（512/816 vs 256/819）、最终仍拒绝换成可用的 Apple Support 页。

**对策：**避免让 27B 承担“联网核实事实”类验收；需要外部数据时把契约样例（真实 JSON 片段）直接放进题面，或改用程序可验证的确定性数据。

### 2.3 精确 review 驱动的局部修复很可靠；自主端到端质量收敛不可靠

- 成功侧：Arcology FE-01/02/UX-01、bandwidth Round-1 三项 P1、Frog Choir FE-05/06/08 + QA-04——凡是 review 给出准确文件:行号与验收条件的缺陷，修复都一次落地并保持不回归。
- 失败侧：Paris 3D 修好数据契约、46/46 测试后，视觉仍是巨大方块/黑暗穿模/错误机位；bandwidth 的 Canvas 说明卡遮挡需要 review 明确“重构为 Canvas+DOM 分离”才解决。模型不能自发以“真实浏览器视觉证据”为目标收敛。

**对策：**把“人/独立复核提供精确 findings → 模型修复”当作标准循环，而不是指望一次交付；这正是 subagent 分任务整改在 Frog Choir Round 2 奏效的原因。

### 2.4 缺乏预算约束时会陷入验证循环

- Arcology 可视 QA continuation 约 3 小时无产品代码改动，反复重建 Chrome profile、纠正测试自身错误，被用户止损取消（QA-01 取消）。

**对策：**给验证类任务设定明确预算（次数/时间/产出格式），或拆成一次性的窄 subagent。

### 2.5 题目难度甜区已经清晰

- **甜区（成功）**：多子系统纯前端工程（硬件 API + 音视频 + 动画 + 状态），验收可机器化 + 少量人工——Arcology、Frog Choir。
- **偏难但可控（脆弱）**：涉及事实性数据的教学/内容型任务——bandwidth showcase。
- **超纲（失败）**：大规模真实外部数据 + 3D 性能预算 + 自主视觉验收——Paris 3D。

2026-08-24 已按甜区新增 5 个固定题面（`test-prompts/`：`firefly-whistle`、`marble-machine`、`lantern-cards`、`pixel-darkroom`、`slide-lantern`），各压一条不同能力轴（自实现 DSP、确定性模拟+undo、日期注入+SM-2、Web Worker+逐字节确定性、自实现解析器+双窗口同步），供 BENCH-03 之后的稳定性系列使用。

## 3. 量化：8-bit 是当前复杂 coding 的优先选择

- MTPLX `optimized-quality` 是 INT8 权重、INT8 MTP head、q8 paged KV——**不是 4-bit**；Frog Choir 主链路整改成功发生在该配置上。
- oQ4e-mtp（4-bit）确实独立完成过 bandwidth showcase 整站，不能推出“4-bit 做不了复杂工作”；但其首轮就有 3 个 P1 正确性缺陷，多轮修复仍暴露数据与交互问题——在多轮自检/纠错型任务上，低比特的质量余量看起来更小。

**工作结论：**8-bit 用于需要可靠推理、工具调用与多轮修复的工作；4-bit 用于探索或可承受复核成本的任务。严格差距仍需同题同 agent 独立 session 对照（BENCH-02/03）。

## 4. Agent：Qwen Code 默认，Pi 作对照，subagent 是必要手段

- Qwen Code 完成了 Arcology 端到端交付，并在 Frog Choir Round 2 用分任务方式把四项核心缺陷修至全部自动验证通过。
- Pi + MTPLX 初跑曾在 30,798 prompt tokens / 165 completion tokens 时被本地 `POST /v1/mtplx/cancel` 显式中断；调用方至今未归因（不是 Pi 断连，两次重启后对照未复现，与上游 #310/#311 签名不符）。cancel-audit 已就位等复发。这为 Pi 路线增加一个未归因的不稳定面。
- 主 agent 只保留拆分、依赖与验收；实现/测试/审计各交给限定文件范围的窄 subagent。

## 5. 性能：复杂长任务的稳定 decode 约 18–20 tok/s，面板均值不可互换

所有 Dashboard 数字都是运行时快照，但它们跨 4 个配置形成一致的体验范围：

| 场景 | 观测值 | 正确解读 |
|---|---:|---|
| Arcology 首轮长 reasoning 请求（AWQ-5.0bpw） | ~20 tok/s；短写文件阶段 ~28.5 | 单请求视角 |
| Arcology 长 session 后期 | 18.1 tok/s | 长期多轮交互劣化 ~36% |
| Paris 3D session（oMLX v0.6.2） | 17.4 tok/s generation，91.8% cache | session 累计均值 |
| oMLX RC + oQ4e-mtp 活跃长请求 | 18.6 tok/s（session 均值 42.4 不可当稳定速度） | 短请求/缓存抬高 session 均值 |
| MTPLX 71K/131K context | 5 分钟 decode 均值 19.9 TPS（18.3–21.4） | 共享长缓存运行时快照 |

**工作结论：**MTP/缓存改善 prefill、TTFT 与短段体验，但没有证据能把 27B 复杂长任务的稳定 decode 提到另一档。优化重点是减少无效 token、工具重试与重复上下文。

## 6. 上下文：131K 是硬预算

- 已出现 prompt 155,651 tokens 的 `context_length_exceeded`；长 session decode 从 ~28.5 降到 18.1 tok/s。
- 自动压缩只用于防溢出，不是可靠记忆。完成一个阶段就写简短 handoff、开新 session；任务拆分与 subagent 隔离比压缩更可靠。

## 7. 推荐执行模板

1. 新 session 只承接一个明确阶段；thinking off。
2. 主 agent 分解为互不冲突的窄任务；每项一个 subagent，限定目标文件、禁改范围与最小验证命令。
3. 主 agent 只做 diff 审核、依赖排序与最终 `build → unit → E2E → 真机/可视验收`。
4. 任一验证失败按原因新建专职 subagent；不把排查/实现/复核塞回同一长上下文。
5. 阶段完成即保存 handoff 并新开 session。
6. **验收永远独立复核**：不信任 agent 的完成声明与测试计数；检查数据契约、mock 边界与循环测试。

## 8. 证据边界与后续 benchmark

- 量化与 agent 均未完成同题、同 profile、独立 session 的重复对照；本页不构成“8-bit 或 Qwen Code 客观最强”。
- 面板的 prefill、session average、瞬时 decode 与单题耗时不可互换；正式 benchmark 必须逐请求记录 prompt/completion tokens、TTFT、稳定 decode、工具轮次、wall time、峰值内存与人工验收结果。
- 开放项见 backlog（历史本机文件，未随本报告发布）：BENCH-02（oQ4e 性能对照）、BENCH-03（同题 Qwen Code/Pi Frog Choir 对照）、FE-07（真机 handedness）、DATA-01、UX-02、cancel 归因。

## 相关记录

- [首次 Qwen Code 成功测试](devlog-projects-qwen3-8-test-notes-first-successful-qwen-code-test_CN.md) · [Arcology Round 1/2 review](devlog-projects-qwen3-8-test-notes-arcology-control-room-round-1-review_CN.md)
- [Paris 3D 测试](devlog-projects-qwen3-8-test-notes-paris-3d-qwen3-8-27b-test_CN.md)
- [oMLX RC + oQ4e-mtp 性能观察](devlog-projects-qwen3-8-test-notes-omlx-rc-oq4e-mtp-performance-test_CN.md) · [oQ4e-mtp 交付测试](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test_CN.md) · [bandwidth Round 1](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review_CN.md)/[2](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review_CN.md)/[3](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review_CN.md)
- [MTPLX + Pi Frog Choir 测试](devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test_CN.md) · [Frog Choir Round 1](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review_CN.md)/[Round 2](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review_CN.md)
- Bugs: MTPLX explicit cancel（历史本机文件，未随本报告发布） · Arcology narrow overflow（历史本机文件，未随本报告发布）
