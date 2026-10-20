---
type: Note
title: MTPLX Flash-Next 128K 压测执行记录
status: current
description: 记录冷 prefill 首轮与后续近 128K natural soak；首轮结构化请求因 HTTP 507 安全停止，补测完成 3 个任务、持续 13.5 分钟，BENCH-06 其余矩阵仍未完成。
tags: [qwen3.8, flash-next, mtplx, benchmark, performance, memory]
timestamp: 2026-09-20T08:42:42Z
---

# MTPLX Flash-Next 128K 压测执行记录

## 结论

2026-09-20（Asia/Shanghai）按测试计划启动首轮。Pi/MTPLX 固定配置匹配，执行前后快照一致；连续采集 /metrics 与机器状态成功。共记录 20 个请求：2 轮 warm-up、15 轮冷 prefill、1 个有实际输出的结构化 decode，以及 2 个 MTPLX 拒绝请求。

冷 prefill 的实际 prompt tokens 从 8,400 增至 120,402 时，median prefill 从 1,411.4 降至 704.9 tok/s（约下降 50.1%）；median TTFT 从 6.04s 增至 171.36s。15 个冷样本 cached ratio 均为 0。完整逐档数据见下表和运行报告。

| 名义输入 | 实际 prompt tokens | Prefill median (tok/s) | TTFT median (s) |
|---:|---:|---:|---:|
| 8K | 8,400 | 1,411.4 | 6.04 |
| 32K | 32,401 | 1,048.4 | 31.13 |
| 64K | 64,401 | 855.8 | 75.85 |
| 96K | 96,401 | 770.2 | 125.68 |
| 120K | 120,402 | 704.9 | 171.36 |

冷 prefill 请求的短 marker 回复只有 180–267 completion tokens；其 decode median 从 8.4K 的 103.24 降至 120.4K 的 86.43 tok/s（约下降 16.3%）。这是上下文相关的浅层观测，不可当成计划要求的持续长 decode 衰减曲线。

## 停止原因与数据边界

首个 8.4K 结构化输出返回 8,192 completion tokens、63.85 decode tok/s，finish reason 为 length，只输出到 D0473（目标 512 行），因此该样本被标记为不完整。随后两次请求被 MTPLX 以 HTTP 507 memory_refusal 拒绝：运行时报告预计需 96.2 GiB、超过 96.0 GiB 引擎限制 0.2 GiB。Pi 没有返回 marker，测试按停止条件中止；没有继续发送高负载请求。

系统采样 96 次：memory free percentage 为 19%–94%，Swap 为 4,453.5–4,517.5 MiB，MTPLX RSS 约 32.0–42.0 million KiB；未观察到服务 PID 变化或持续 Swap 增长。拒绝来自 MTPLX 内部内存预算，并非采集器误配。没有清 cache、重启服务或改量化配置。

计划的 64K/112K 持续 decode、structured vs natural 对照、112K cache A/B 和 45–60 分钟 soak 均未执行，BENCH-06 仍进行中。恢复前需要确认内存余量已恢复；若选择改变 KV/运行时配置，应另开配置批次，不能与本批合并。

## 执行偏差与修正

两轮 64 行 warm-up 分别用了 1,251 和 1,321 completion tokens。首版 harness 未将该结果用于校准，正式结构化请求仍要求 512 行，导致首个输出触及 8,192 上限。按 warm-up token 数校准，后续正常探针应约为 192 行。harness 已修正为正式矩阵前自动校准，并在首次 MTPLX 507 memory refusal 时立即停止；本次 stopped run 不重试。

唯一有输出的结构化样本 MTP 深度为 3，accepted drafts 为 4,366、rejected drafts 为 248，分深度接受数为 [1533, 1502, 1331]，平均接受概率为 [0.971, 0.951, 0.843]。单个且截断的样本仅作原始观测，不作为总体结论。

冷 prefill 的 TTFT 线性拟合得到约 -11.9s 固定项和 685.5 tok/s 斜率等效速率；负固定项说明这条宽区间数据不支持将拟合截距解释为真实固定开销。

## 产物

- 运行报告（历史本机文件，未随本报告发布）
- 逐请求曲线数据（历史本机文件，未随本报告发布）
- 短答 decode 曲线（历史本机文件，未随本报告发布）
- [冷 prefill 图](../../assets/figures/31b23b6766cc-cold-prefill-throughput.svg)
- 原始 MTPLX metrics（历史本机文件，未随本报告发布）
- 机器状态采样（历史本机文件，未随本报告发布）
- harness 位于 $HOME/Code/qwen3.8-tests/mtplx-flash-next-pressure-2026-09-20/pressure_test.py。
- [MTPLX 两模型完整对比报告](devlog-projects-qwen3-8-test-notes-mtplx-model-comparison-report-2026-09-20.md)

## 后续补测：近 128K 多任务 natural soak（2026-09-20）

首轮因结构化探针的 HTTP 507 停止后，按用户要求另起独立 soak run `20260920T080135Z-193bc8`。context window 131,072；3 个不同任务各使用 120,402 prompt tokens，最多请求 8,192 输出 tokens。正式重跑耗时 13 分 32 秒，配置前后匹配；marker/header 作为诊断项而非连续失败停止门槛，资源阈值、HTTP 507、指标缺失、超时及异常重复/乱码保护仍有效。

| # | 任务 | Completion tokens | Prefill tok/s | Decode tok/s | TTFT (s) | marker/header |
|---:|---|---:|---:|---:|---:|:---:|
| 1 | 数据完整性与异常审计 | 8,166 | 921.331 | 55.383 | 131.097 | 通过 |
| 2 | 延迟分布与缓存/分片归因 | 6,186 | 829.193 | 58.465 | 145.706 | 通过 |
| 3 | 可靠性改进与验证方案 | 4,452 | 686.047 | 44.508 | 175.969 | 通过 |

3 次请求的 prefill median 为 **829.193 tok/s**，decode median 为 **55.383 tok/s**。第 1→3 个任务 prefill 下降 **25.5%**；decode 先升至第 2 任务、再降至第 3 任务，端点变化 **−19.6%**。这是三项任务上的端点对照，不是等间隔长期衰减曲线。

全程 system-state 53 个样本：可用 RAM 最低/平均 **15.0% / 22.2%**；整机 RAM 已用估算峰值 **108.80 GiB**；MTPLX RSS 峰值 **42.66 GiB**；进程 CPU 中位/采样峰值 **36.7% / 325.0%**；Swap **3,558.69→3,518.69 MiB**，未增长。powermetrics 覆盖完整 soak（55 个样本）：CPU/GPU 功耗估算均值 **6.03 W / 20.86 W**，GPU HW active residency 均值 **95.1%**；热压力 **Heavy 49/55、Nominal 6/55**。系统未提供摄氏温度字段；Apple Silicon 统一内存也无法拆分独立 GPU 显存。

此前 Flash 首轮 soak `20260920T074916Z-28c2d9` 在约 9.1 分钟、两次 marker 未通过后停止，未混入正式结果。正式重跑 3/3 marker/header 检查通过。

补测证据：正式运行报告（历史本机文件，未随本报告发布） · 逐请求记录（历史本机文件，未随本报告发布） · 全程系统采样（历史本机文件，未随本报告发布） · powermetrics 原始遥测（历史本机文件，未随本报告发布）。
