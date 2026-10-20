# MLTF / Qwen、Pi、Hermes 三种真实 CLI

| 项目 | 记录 |
|---|---|
| 编号 | PERF-07 |
| 日期 | 2026-10-19 |
| 模型与运行方式 | Qwen3.8-27B 8bit；MLTF  |
| 推理位置 | 本机 |

## 历史结果

Qwen/Pi 主轮通过；Hermes 4096 cap 主轮失败，独立 16K 跟进最终通过。

## 原始报告

- [MLTF：qwen / pi / hermes 真实 CLI 图文长任务验收](../originals/engine-tests-2026-10-19-mltf-clients-report.md)

## 证据边界

原失败保留；128K 窗口内长任务，非满 128K 输入；客户端系统提示与 thinking 不同。 原报告内可能残留 mlx-dspark 旧绝对链接；现文件已迁移到本条位置。
