# MLTF vs mlx-vlm / 128K 图文性能

[English](perf-06.md) | [简体中文](perf-06_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | PERF-06 |
| 日期 | 2026-10-19 |
| 模型与运行方式 | Qwen3.8-27B 8bit；MLTF vs mlx-vlm  |
| 推理位置 | 本机 |

<!-- environment-context:start -->

## 本机配置与系统（2026-10-20 补充）

| 项目 | 记录与证据边界 |
|---|---|
| 本机用途 | 本机推理工作站 |
| 本机硬件参考 | MacBook Pro `Mac17,6`；Apple M5 Max；18 核 CPU；40 核 GPU；128 GB 统一内存（128 GiB / 137438953472 字节） |
| 原报告明确记载的主机 | 详见原报告；未以当前快照补造历史配置 |
| 当前系统快照 | macOS 27.0.1，build `26A434`，arm64，Metal 4；采集于 2026-10-20 22:03:27 UTC |
| 实验时系统 | macOS 27.0.1 (26A434) |
| 历史配置边界 | 旧测试未保存独立快照时，详细核数只作为当前本机配置参考；内网 PC／云端推理硬件不由 Mac 配置推断 |

[完整环境说明](../../environment_CN.md)。模型、量化、引擎、缓存和请求条件以本报告原有记录为准。原始图表、源码和命令输出保留源语言证据。

<!-- environment-context:end -->

## 历史结果

各后端两轮；decode 约 3.53×，整请求时间减少约 34.5%。

## 原始报告

- [MLTF 与 MLX-VLM：128K 图文长任务对照](../originals/engine-tests-2026-10-19-mltf-comparison-report_CN.md)

## 证据边界

8bit 权重源相同，KV 与数值路径不同；并非等精度实验，也不是长期稳定性证明。 原报告内可能残留 mlx-dspark 旧绝对链接；现文件已迁移到本条位置。
