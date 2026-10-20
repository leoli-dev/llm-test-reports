---
type: Note
title: "LLM 带宽展示 — 第 2 轮评审与范围扩展"
status: current
description: "第二轮评审接受了三项 Round-1 功能性修复，但要求提供具有教学意义的可视化以及最新的 2026 设备/模型目录。"
tags: [qwen3.8, oq4e, mtp, review, frontend, visualization, data]
timestamp: 2026-08-23T03:53:17Z
---

# LLM 带宽展示 — 第 2 轮评审与范围扩展

[English](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review_CN.md)

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

## 功能回归检查

Round-1 修复已获接受：Canvas 首次加载动画现在可以渲染；容量不足的配置显示“不适用”，而非无效的本地带宽 tok/s；上下文长度现在会影响明确标记的 KV 教学估算值、总内存和适配结果。在独立的本地页面检查期间，未发现任何控制台警告/错误。

## UX-04 — 当前动画是装饰性的，而非解释性的（P1）

用户的视觉评审正确指出了剩余的核心问题。当前场景显示权重块从通用的“内存仓库”移动到“GPU 核心”，以及一个独立的向上移动的 token 堆栈。其运动缺乏因果可读性：

- 它没有展示**单个解码步骤**：读取一次模型权重 → 执行层 → 输出下一个 token → 重复。
- 它没有提供从 `weightGB / bandwidthGBs` 到显示的毫秒/token 或 tok/s 的视觉映射。
- 粒子数量、速度、通道宽度和 token 堆栈的变化足够独立，以至于观看者无法推断哪种运动代表带宽、模型大小或输出节奏。
- 静态图像仍然传达了几乎所有可用信息；运动增加了视觉活动，但没有增加教学价值。

### 必需的重设计

用用户控制的、带标签的**单 token 时间线**替换装饰性的连续流：

1. **读取权重** — 高亮显示一次“模型权重读取”，其标签说明 `64 GB ÷ 800 GB/s = 80 ms`。
2. **逐层计算** — 简短的、视觉上次要的计算步骤；解释它被排除在仅带宽的上限之外。
3. **输出 1 token** — 精确输出一个 token 并显示循环总时长/推导出的理论速率。
4. **重复下一个 token** — 重置时间线并使重复性明确化。

保持播放为可选，但在暂停和 `prefers-reduced-motion` 下，步进/定位必须保持可理解。对于 offload，在不受支持的边界处停止时间线，并说明不使用本地内存公式；不要虚构外部传输动画速率。

**验收证据：** 评审者可以在每个步骤暂停，并仅从可见标签解释为什么较大的权重大小会增加时间/token，而较高的带宽会降低它；更改选定的设备/模型会一致地更新公式和一个循环的持续时间。

## DATA-01 — 设备和模型目录已过时（P1）

页面必须停止将其小型旧列表呈现为“所有已调研硬件”。添加一个当前的、有来源支持的 2026 基线：

- GeForce RTX 5090 — 32 GB GDDR7，1,792 GB/s。
- RTX PRO 6000 Blackwell Workstation Edition — 96 GB ECC GDDR7，1,792 GB/s。
- Apple M5 Max 顶级配置 — 最高 128 GB 统一内存，最高 614 GB/s。
- NVIDIA DGX Spark — 128 GB 一致性统一内存，273 GB/s。“DGX”是一个产品系列；列出具体命名的系统，而不是通用的“NVIDIA DGX”。
- Qwen3.8-27B — 稠密 27B 模型。
- DeepSeek-V4-Flash — 记录**284B 总计 / 13B 激活**。存储/容量和权重带宽计算必须使用总参数；激活参数可以作为计算上下文元数据单独显示。

所有新增内容都需要新的官方 URL 和实际检索日期。硬件记录应区分 `dedicated VRAM` 和 `unified/coherent system memory`，以便读者不会将 GPU 板卡与集成系统混淆。

### 已验证的来源集（2026-08-23）

- NVIDIA RTX 5090 公告：32 GB / 1,792 GB/s。
- NVIDIA RTX PRO 6000 产品规格：96 GB / 1,792 GB/s。
- Apple M5 Max 公告：最高 128 GB / 614 GB/s。
- NVIDIA DGX Spark 产品规格：128 GB / 273 GB/s。
- Qwen Qwen3.8-27B 官方模型卡。
- DeepSeek-V4-Flash 官方模型卡：284B 总计 / 13B 激活。

