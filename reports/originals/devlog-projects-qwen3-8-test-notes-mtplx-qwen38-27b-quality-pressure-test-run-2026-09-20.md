---
type: Note
title: MTPLX Qwen3.8 27B Optimized Quality 压测执行记录
status: current
description: 按 Flash-Next 128K 方法记录 Qwen3.8 27B Optimized Quality 冷 prefill 与后续近 128K natural soak；soak 完成 3 个任务、持续 30.6 分钟，系统采样完整而 CPU/GPU/热压力遥测只覆盖末段。
tags: [qwen3.8, optimized-quality, mtplx, benchmark, performance, prefill, decode, memory]
timestamp: 2026-09-20T08:42:42Z
---

# MTPLX Qwen3.8 27B Optimized Quality 压测

## 结论

2026-09-20 按 Flash-Next 128K 压测方法对 MTPLX 上的 `Qwen 3.8 27B Optimized Quality`（8-bit dynamic quant）执行第二个模型批次。完成两轮 warm-up 和 8K–120K 冷 prefill（每档 3 次），共 18 个请求；15 个冷 prefill 样本均通过 marker 校验且 `cached_tokens=0`。

实际 prompt 中位数由 8,406 增至 120,408 tokens 时，冷 prefill median 从 465.9 降至 305.9 tok/s（端点下降 34.3%）；TTFT 从 18.19s 增至 395.88s（约 21.8 倍）。这是上下文长度对冷 prefill 的曲线，不是持续 decode 衰减曲线。

短 marker 回复的 decode median 在 8K–120K 端点为 39.79→36.48 tok/s（端点变化 -8.3%），但每次仅 470–904 个 completion tokens，且各档不是单调变化；只作浅层上下文观测，不能代替约 4K structured/natural 长 decode 或 soak 时间序列。

首个结构化 decode 探针在 prefill 前被 MTPLX HTTP 507 拒绝：8,405 prompt tokens（全部未缓存），引擎估算 96.6 GiB，超过 96.0 GiB 内存预算 0.6 GiB，completion 为 0。按计划停止条件没有重试，因此 64K/112K 长 decode、natural 对照、缓存 A/B 与 45–60 分钟 soak 均未执行。本批结论为**部分完成**，不可宣称完整 decode 衰减曲线或稳定 soak 结果。

## 配置与方法

- MTPLX Desktop OpenAI-compatible endpoint：`http://127.0.0.1:8001/v1`；运行时 model id：`mtplx-qwen38-27b-optimized-quality`。
- 模型 UI 显示 8-bit dynamic quant；服务广告 context 为 262,144。为保持与原计划相同的测试合同，Pi 独立注册使用 131,072 context、8,192 max output。
- `reasoning_effort=medium`、MTP generation/head enabled、profile Auto、KV quantization off、`allow_swap=false`、MTP cohorts off；关闭 Pi tools/skills/extensions/context files 并用 `--no-session`。配置前后快照匹配。
- 使用隔离 Pi agent 目录；没有修改全局 Pi 模型/设置。正式冷组每档三个唯一语料，短 marker 响应用于测 prefill 并顺带取得短 decode 样本；执行前完成 2 次 warm-up。

| 名义输入 | 实际 prompt 中位数 | Prefill median (tok/s) | TTFT median (s) | 短答 decode median (tok/s) | Marker |
|---:|---:|---:|---:|---:|---:|
| 8K | 8,406 | 465.9 | 18.19 | 39.79 | 3/3 |
| 32K | 32,407 | 422.2 | 76.98 | 43.81 | 3/3 |
| 64K | 64,407 | 337.9 | 191.09 | 35.28 | 3/3 |
| 96K | 96,407 | 326.1 | 295.94 | 31.73 | 3/3 |
| 120K | 120,408 | 305.9 | 395.88 | 36.48 | 3/3 |

两次 64 行 warm-up 分别生成 1,314–1,694 completion tokens；据此校准到 160 行、约 3.8K token 的结构化输出探针。该探针输入为 8,405 tokens，未开始 prefill 就被拒绝；这不是输出截断、marker 错误或 Pi 适配问题。MTPLX 服务保持运行，触发停止条件后无后续请求。

## 资源观测与边界

设备物理内存 128 GB；采样期间 MTPLX PID 未变化，RSS 约 30.7 GB；Swap 约 3.67–4.27 GiB，未见持续上升的明确趋势。关键限制是 MTPLX 引擎对该请求的 96 GiB 投影预算，而非 Mac 物理内存已经耗尽。测试没有清 cache、重启服务或更改 KV/Swap 配置。

若继续长 decode，应作为后续独立批次处理：先由用户决定是否释放更多引擎余量或使用 q8 KV 配置。更改 KV 会改变配置合同，不与当前无 KV 量化批次混并。

## 产物

- 运行报告（历史本机文件，未随本报告发布）
- 逐请求曲线 CSV（历史本机文件，未随本报告发布）
- 短答 decode CSV（历史本机文件，未随本报告发布）
- [冷 prefill 曲线 SVG](../../assets/figures/9d2839259a0e-cold-prefill-throughput.svg)
- 原始 MTPLX metrics（历史本机文件，未随本报告发布）
- 请求记录与响应快照（历史本机文件，未随本报告发布）
- 机器状态采样（历史本机文件，未随本报告发布）

## 后续补测：近 128K 多任务 natural soak（2026-09-20）

按用户要求另起 soak run `20260920T071156Z-216b61`。context window 131,072；3 个不同任务各使用 120,410 prompt tokens，最多请求 8,192 输出 tokens。连续运行 **30 分 38 秒**，配置前后匹配。

| # | 任务 | Completion tokens | Prefill tok/s | Decode tok/s | TTFT (s) | marker/header |
|---:|---|---:|---:|---:|---:|:---:|
| 1 | 数据完整性与异常审计 | 8,192 | 404.182 | 28.638 | 298.404 | 通过 |
| 2 | 延迟分布与缓存/分片归因 | 6,428 | 348.884 | 26.208 | 345.878 | 通过 |
| 3 | 可靠性改进与验证方案 | 8,192 | 332.588 | 27.860 | 362.575 | 未通过 |

3 次请求的 prefill median 为 **348.884 tok/s**，decode median 为 **27.860 tok/s**。第 1→3 个任务 prefill 下降 **17.7%**；decode 有先降后升，端点变化 **−2.7%**。第 3 项 marker/header 校验失败，但请求完成且速率指标有效；因此正确/完整计数为 2/3。

全程 system-state 119 个样本：可用 RAM 最低/平均 **27.0% / 44.6%**；整机 RAM 已用估算峰值 **93.44 GiB**；MTPLX RSS 峰值 **35.99 GiB**；进程 CPU 中位/采样峰值 **11.7% / 95.9%**；Swap **3,638.25→3,614.25 MiB**，未增长。CPU/GPU/热压力 powermetrics 仅覆盖压测末段 **8 分 02 秒、33 个样本**：CPU/GPU 功耗估算均值 **5.69 W / 19.64 W**，GPU HW active residency 均值 **98.2%**，热压力 **Heavy 33/33**。没有采到绝对摄氏温度；独立 GPU 显存不可见（Apple Silicon 统一内存）。

补测证据：运行报告（历史本机文件，未随本报告发布） · 逐请求记录（历史本机文件，未随本报告发布） · 全程系统采样（历史本机文件，未随本报告发布） · powermetrics 原始遥测（历史本机文件，未随本报告发布） · [两模型对比报告](devlog-projects-qwen3-8-test-notes-mtplx-model-comparison-report-2026-09-20.md)。
